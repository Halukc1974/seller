import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

// Verify Paddle webhook signature using HMAC-SHA256
function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  // Paddle signature header format: ts=<timestamp>;h1=<hash>
  const parts = signatureHeader.split(";");
  let timestamp = "";
  let h1 = "";

  for (const part of parts) {
    if (part.startsWith("ts=")) timestamp = part.slice(3);
    if (part.startsWith("h1=")) h1 = part.slice(3);
  }

  if (!timestamp || !h1) return false;

  const payload = `${timestamp}:${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(h1), Buffer.from(expected));
}

function generateLicenseKey(): string {
  const segment = () =>
    crypto.randomBytes(2).toString("hex").toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("paddle-signature") ?? "";
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  // Verify signature only when secret is configured
  if (webhookSecret) {
    if (!signatureHeader) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
    const valid = verifyPaddleSignature(rawBody, signatureHeader, webhookSecret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: {
    event_type?: string;
    data?: Record<string, unknown>;
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event_type;
  const data = event.data as Record<string, unknown> | undefined;

  try {
    if (eventType === "transaction.completed" && data) {
      const transactionId = data.id as string;
      const customData = data.custom_data as
        | { userId?: string; productId?: string }
        | undefined;

      const userId = customData?.userId;
      const productId = customData?.productId;

      if (!userId || !productId || !transactionId) {
        // Missing required fields — still return 200 to avoid Paddle retries
        return NextResponse.json({ received: true });
      }

      const amountTotal = (
        data.details as { totals?: { total?: string } } | undefined
      )?.totals?.total;
      const currencyCode = data.currency_code as string | undefined;

      const product = await db.product.findUnique({
        where: { id: productId },
        select: { id: true, type: true },
      });

      if (!product) {
        return NextResponse.json({ received: true });
      }

      const needsLicenseKey =
        product.type === "SOFTWARE" || product.type === "LICENSE";
      const licenseKey = needsLicenseKey ? generateLicenseKey() : undefined;

      await db.purchase.create({
        data: {
          userId,
          productId,
          paddleTransactionId: transactionId,
          amount: amountTotal ? parseFloat(amountTotal) / 100 : 0,
          currency: currencyCode ?? "USD",
          status: "COMPLETED",
          ...(licenseKey ? { licenseKey } : {}),
        },
      });

      await db.product.update({
        where: { id: productId },
        data: { totalSales: { increment: 1 } },
      });
    } else if (eventType === "transaction.refunded" && data) {
      const transactionId = data.origin_transaction_id as string | undefined ?? data.id as string;

      if (transactionId) {
        const purchase = await db.purchase.findUnique({
          where: { paddleTransactionId: transactionId },
          select: { id: true, productId: true, status: true },
        });

        if (purchase && purchase.status !== "REFUNDED") {
          await db.purchase.update({
            where: { id: purchase.id },
            data: { status: "REFUNDED" },
          });

          await db.product.update({
            where: { id: purchase.productId },
            data: { totalSales: { decrement: 1 } },
          });
        }
      }
    }
  } catch (err) {
    console.error("[Paddle Webhook] Error processing event:", err);
    // Still return 200 so Paddle doesn't keep retrying
  }

  return NextResponse.json({ received: true });
}

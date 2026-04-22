import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  purchaseConfirmationEmail,
  purchaseConfirmationSubject,
} from "@/lib/email-templates";

// Verify Paddle webhook signature using HMAC-SHA256
function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): boolean {
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
  const segment = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

interface CartSnapshotItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

function parseSnapshot(raw: unknown): CartSnapshotItem[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((i) => ({
        productId: String(i.productId ?? ""),
        quantity: Math.max(1, Number(i.quantity ?? 1)),
        unitPrice: Number(i.unitPrice ?? 0),
      }))
      .filter((i) => i.productId);
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("paddle-signature") ?? "";
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (webhookSecret) {
    if (!signatureHeader) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
    const valid = verifyPaddleSignature(rawBody, signatureHeader, webhookSecret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: { event_type?: string; data?: Record<string, unknown> };
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
        | { userId?: string; cartId?: string; items?: string; productId?: string }
        | undefined;

      const userId = customData?.userId;
      if (!userId || !transactionId) {
        return NextResponse.json({ received: true });
      }

      const currencyCode = (data.currency_code as string | undefined) ?? "USD";

      // Multi-item snapshot (from Sprint 2 cart checkout)
      let snapshot = parseSnapshot(customData?.items);

      // Back-compat: single-product legacy customData
      if (snapshot.length === 0 && customData?.productId) {
        const amountTotal = (
          data.details as { totals?: { total?: string } } | undefined
        )?.totals?.total;
        const unit = amountTotal ? parseFloat(amountTotal) / 100 : 0;
        snapshot = [{ productId: customData.productId, quantity: 1, unitPrice: unit }];
      }

      if (snapshot.length === 0) {
        return NextResponse.json({ received: true });
      }

      const productIds = snapshot.map((s) => s.productId);
      const products = await db.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, title: true, type: true },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      const createdPurchases: Array<{
        productTitle: string;
        amount: number;
        licenseKey: string | null;
      }> = [];

      for (const item of snapshot) {
        const product = productMap.get(item.productId);
        if (!product) continue;

        const existing = await db.purchase.findFirst({
          where: {
            paddleTransactionId: transactionId,
            productId: item.productId,
            userId,
          },
          select: { id: true },
        });
        if (existing) continue;

        const needsLicense =
          product.type === "SOFTWARE" || product.type === "LICENSE";
        const licenseKey = needsLicense ? generateLicenseKey() : null;
        const amount = item.unitPrice * item.quantity;

        await db.purchase.create({
          data: {
            userId,
            productId: item.productId,
            paddleTransactionId: transactionId,
            amount,
            currency: currencyCode,
            status: "COMPLETED",
            licenseKey,
          },
        });

        await db.product.update({
          where: { id: item.productId },
          data: { totalSales: { increment: item.quantity } },
        });

        createdPurchases.push({
          productTitle: product.title,
          amount,
          licenseKey,
        });
      }

      // Clear cart server-side (idempotent)
      if (customData?.cartId) {
        await db.cartItem
          .deleteMany({ where: { cartId: customData.cartId } })
          .catch(() => {});
      }

      // Send a single confirmation email with the order summary
      if (createdPurchases.length > 0) {
        try {
          const user = await db.user.findUnique({
            where: { id: userId },
            select: { email: true },
          });
          if (user?.email) {
            const baseUrl =
              process.env.NEXT_PUBLIC_BASE_URL || "https://onedollarsell.com";
            const downloadUrl = `${baseUrl}/dashboard/downloads`;
            const firstTitle = createdPurchases[0].productTitle;
            const totalAmount = createdPurchases.reduce(
              (sum, p) => sum + p.amount,
              0,
            );
            const licenseKey = createdPurchases.find((p) => p.licenseKey)
              ?.licenseKey;

            await sendEmail(
              user.email,
              purchaseConfirmationSubject(
                createdPurchases.length === 1
                  ? firstTitle
                  : `${firstTitle} and ${createdPurchases.length - 1} more`,
              ),
              purchaseConfirmationEmail({
                productTitle:
                  createdPurchases.length === 1
                    ? firstTitle
                    : `${createdPurchases.length} items`,
                amount: totalAmount,
                currency: currencyCode,
                downloadUrl,
                licenseKey: licenseKey ?? undefined,
              }),
            );
          }
        } catch (emailErr) {
          console.error(
            "[Paddle Webhook] Failed to send confirmation email:",
            emailErr,
          );
        }
      }
    } else if (eventType === "transaction.refunded" && data) {
      const transactionId =
        (data.origin_transaction_id as string | undefined) ??
        (data.id as string);

      if (transactionId) {
        const purchases = await db.purchase.findMany({
          where: { paddleTransactionId: transactionId, status: { not: "REFUNDED" } },
          select: { id: true, productId: true },
        });

        for (const purchase of purchases) {
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
  }

  return NextResponse.json({ received: true });
}

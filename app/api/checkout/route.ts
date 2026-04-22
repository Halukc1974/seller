import { NextRequest, NextResponse } from "next/server";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateLicenseKey } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { accepted?: boolean };
  if (!body.accepted) {
    return NextResponse.json(
      { error: "You must accept the terms to complete checkout." },
      { status: 400 },
    );
  }

  const cart = await db.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              shortDescription: true,
              price: true,
              currency: true,
              type: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const availableItems = cart.items.filter((i) => i.product.status === "PUBLISHED");
  if (availableItems.length === 0) {
    return NextResponse.json({ error: "No available items in cart" }, { status: 400 });
  }

  const currency = availableItems[0].product.currency;
  const productIdList = availableItems.map((i) => i.productId);

  const apiKey = process.env.PADDLE_API_KEY;
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  // Demo mode — no Paddle credentials. Create purchases directly so R2/downloads flow can be tested.
  if (!apiKey || !clientToken) {
    const userId = session.user.id;
    const purchases = await db.$transaction(
      availableItems.map((item) => {
        const needsLicense = item.product.type === "SOFTWARE" || item.product.type === "LICENSE";
        const unitPrice = Number(item.product.price);
        return db.purchase.create({
          data: {
            userId,
            productId: item.productId,
            amount: unitPrice * item.quantity,
            currency: item.product.currency,
            status: "COMPLETED",
            licenseKey: needsLicense ? generateLicenseKey() : null,
          },
          select: { id: true, productId: true },
        });
      }),
    );

    await db.cartItem.deleteMany({ where: { cartId: cart.id } });

    for (const item of availableItems) {
      await db.product.update({
        where: { id: item.productId },
        data: { totalSales: { increment: item.quantity } },
      });
    }

    return NextResponse.json({ mode: "demo" as const, purchaseIds: purchases.map((p) => p.id) });
  }

  // Paddle mode — ad-hoc (non-catalog) transaction.
  const environment =
    process.env.PADDLE_ENVIRONMENT === "production"
      ? Environment.production
      : Environment.sandbox;

  const paddle = new Paddle(apiKey, { environment });

  const paddleItems = availableItems.map((item) => ({
    quantity: item.quantity,
    price: {
      description: `Seller.com — ${item.product.title}`,
      unitPrice: {
        amount: Math.round(Number(item.product.price) * 100).toString(),
        currencyCode: (item.product.currency || "USD") as "USD",
      },
      product: {
        name: item.product.title,
        taxCategory: "digital-goods" as const,
        description: item.product.shortDescription ?? "Digital product",
      },
    },
  }));

  const cartSnapshot = availableItems.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    unitPrice: Number(i.product.price),
  }));

  const transaction = await paddle.transactions.create({
    items: paddleItems,
    currencyCode: (currency || "USD") as "USD",
    customData: {
      userId: session.user.id,
      cartId: cart.id,
      items: JSON.stringify(cartSnapshot),
    },
  });

  return NextResponse.json({
    mode: "paddle" as const,
    transactionId: transaction.id,
    customData: {
      userId: session.user.id,
      cartId: cart.id,
    },
  });
}

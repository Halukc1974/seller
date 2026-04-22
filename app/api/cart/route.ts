import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getOrCreateCart(userId: string) {
  return db.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              title: true,
              price: true,
              currency: true,
              status: true,
              images: true,
              creator: { select: { storeName: true } },
            },
          },
        },
      },
    },
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }
  const cart = await getOrCreateCart(session.user.id);
  return NextResponse.json({
    items: cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      product: {
        ...item.product,
        price: item.product.price.toString(),
      },
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { productId?: string; quantity?: number };
  if (!body.productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const product = await db.product.findUnique({
    where: { id: body.productId },
    select: { id: true, status: true },
  });
  if (!product || product.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Product not available" }, { status: 404 });
  }

  const cart = await getOrCreateCart(session.user.id);
  const quantity = Math.max(1, body.quantity ?? 1);

  await db.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: body.productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId: body.productId, quantity },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cart = await db.cart.findUnique({ where: { userId: session.user.id } });
  if (cart) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { productId } = await params;
  const body = (await request.json()) as { quantity?: number };
  const quantity = body.quantity ?? 1;

  const cart = await db.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) {
    return NextResponse.json({ error: "Cart empty" }, { status: 404 });
  }

  if (quantity <= 0) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  } else {
    await db.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { productId } = await params;
  const cart = await db.cart.findUnique({ where: { userId: session.user.id } });
  if (cart) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  }
  return NextResponse.json({ ok: true });
}

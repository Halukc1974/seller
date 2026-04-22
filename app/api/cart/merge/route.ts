import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface GuestItem {
  productId: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { items?: GuestItem[] };
  const guestItems = (body.items ?? []).filter(
    (i) => typeof i.productId === "string" && i.productId.length > 0,
  );

  if (guestItems.length === 0) {
    return NextResponse.json({ ok: true, merged: 0 });
  }

  const validProducts = await db.product.findMany({
    where: {
      id: { in: guestItems.map((i) => i.productId) },
      status: "PUBLISHED",
    },
    select: { id: true },
  });
  const validIds = new Set(validProducts.map((p) => p.id));

  const cart = await db.cart.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  let merged = 0;
  for (const item of guestItems) {
    if (!validIds.has(item.productId)) continue;
    const quantity = Math.max(1, item.quantity ?? 1);
    await db.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId: item.productId, quantity },
    });
    merged += 1;
  }

  return NextResponse.json({ ok: true, merged });
}

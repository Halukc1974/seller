import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const items = await db.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          images: true,
          price: true,
          currency: true,
          type: true,
          averageRating: true,
          reviewCount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return new NextResponse("productId is required", { status: 400 });
  }

  await db.wishlist.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    create: { userId: session.user.id, productId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return new NextResponse("productId is required", { status: 400 });
  }

  await db.wishlist
    .delete({
      where: { userId_productId: { userId: session.user.id, productId } },
    })
    .catch(() => {
      // already deleted — ignore
    });

  return NextResponse.json({ ok: true });
}

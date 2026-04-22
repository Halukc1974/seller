import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const review = await db.review.findUnique({
    where: { id },
    select: { id: true, productId: true, rating: true },
  });
  if (!review) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.review.delete({ where: { id } });

  // Recompute product rating aggregates
  const agg = await db.review.aggregate({
    where: { productId: review.productId },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await db.product.update({
    where: { id: review.productId },
    data: {
      averageRating: agg._avg.rating ?? 0,
      reviewCount: agg._count._all,
    },
  });

  await logAdminAction({
    actorId: session.user.id!,
    actorEmail: session.user.email,
    action: "review.delete",
    targetType: "Review",
    targetId: id,
    metadata: { productId: review.productId, rating: review.rating },
  });

  return NextResponse.json({ ok: true });
}

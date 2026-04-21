import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function recalculateProductRating(productId: string) {
  const stats = await db.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await db.product.update({
    where: { id: productId },
    data: {
      averageRating: stats._avg.rating ?? 0,
      reviewCount: stats._count.rating,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { productId, rating, title, body } = await request.json();

  if (!productId || !rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return new NextResponse("Invalid request: productId and rating (1-5) are required", {
      status: 400,
    });
  }

  // Verify the user has a COMPLETED purchase for this product
  const purchase = await db.purchase.findFirst({
    where: { userId: session.user.id, productId, status: "COMPLETED" },
    select: { id: true },
  });

  if (!purchase) {
    return new NextResponse("You must purchase this product before leaving a review", {
      status: 403,
    });
  }

  // Check for existing review
  const existing = await db.review.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
    select: { id: true },
  });

  if (existing) {
    return new NextResponse("You have already reviewed this product", { status: 409 });
  }

  const review = await db.review.create({
    data: {
      userId: session.user.id,
      productId,
      rating: Math.round(rating),
      title: title ?? null,
      body: body ?? null,
    },
  });

  await recalculateProductRating(productId);

  return NextResponse.json(review, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { reviewId } = await request.json();
  if (!reviewId) {
    return new NextResponse("reviewId is required", { status: 400 });
  }

  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, productId: true },
  });

  if (!review) {
    return new NextResponse("Review not found", { status: 404 });
  }

  if (review.userId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await db.review.delete({ where: { id: reviewId } });
  await recalculateProductRating(review.productId);

  return NextResponse.json({ ok: true });
}

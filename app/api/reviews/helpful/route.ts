import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
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
    select: { id: true },
  });

  if (!review) {
    return new NextResponse("Review not found", { status: 404 });
  }

  const updated = await db.review.update({
    where: { id: reviewId },
    data: { helpful: { increment: 1 } },
    select: { helpful: true },
  });

  return NextResponse.json({ helpful: updated.helpful });
}

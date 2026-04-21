import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { productId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { productId } = body;

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      status: true,
    },
  });

  if (!product || product.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    product: {
      id: product.id,
      title: product.title,
      price: product.price.toString(),
      currency: product.currency,
    },
    customData: {
      userId: session.user.id,
      productId: product.id,
    },
  });
}

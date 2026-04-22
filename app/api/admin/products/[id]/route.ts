import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type ProductStatus = (typeof VALID_STATUSES)[number];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: { status?: string; featured?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { status, featured } = body;

  if (status !== undefined && !VALID_STATUSES.includes(status as ProductStatus)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  if (featured !== undefined && typeof featured !== "boolean") {
    return NextResponse.json({ error: "featured must be a boolean" }, { status: 400 });
  }

  const updateData: { status?: ProductStatus; featured?: boolean } = {};
  if (status !== undefined) updateData.status = status as ProductStatus;
  if (featured !== undefined) updateData.featured = featured;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const product = await db.product.update({
      where: { id },
      data: updateData,
      select: { id: true, title: true, status: true, featured: true },
    });
    return NextResponse.json(product);
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("Admin update product error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

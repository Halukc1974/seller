import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;

  const collection = await db.collection.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: {
            include: {
              creator: { select: { storeName: true, slug: true, verified: true } },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  return NextResponse.json(collection);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;

  let body: {
    title?: string;
    slug?: string;
    description?: string;
    featured?: boolean;
    sortOrder?: number;
    productIds?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, slug, description, featured, sortOrder, productIds } = body;

  // Build scalar update data
  const updateData: {
    title?: string;
    slug?: string;
    description?: string | null;
    featured?: boolean;
    sortOrder?: number;
  } = {};

  if (title !== undefined) updateData.title = title.trim();
  if (slug !== undefined) updateData.slug = slug.trim().toLowerCase();
  if (description !== undefined) updateData.description = description.trim() || null;
  if (featured !== undefined) updateData.featured = featured;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

  try {
    // Run scalar update + product membership in a transaction
    const collection = await db.$transaction(async (tx) => {
      const updated = await tx.collection.update({
        where: { id },
        data: updateData,
      });

      if (productIds !== undefined) {
        // Replace all product memberships
        await tx.collectionsOnProducts.deleteMany({ where: { collectionId: id } });
        if (productIds.length > 0) {
          await tx.collectionsOnProducts.createMany({
            data: productIds.map((productId, index) => ({
              collectionId: id,
              productId,
              sortOrder: index,
            })),
            skipDuplicates: true,
          });
        }
      }

      return updated;
    });

    return NextResponse.json(collection);
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A collection with this slug already exists" }, { status: 409 });
    }
    console.error("Admin update collection error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;

  try {
    await db.collection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    console.error("Admin delete collection error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

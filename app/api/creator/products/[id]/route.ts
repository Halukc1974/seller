import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

async function getCreatorProfile(userId: string) {
  return db.creatorProfile.findUnique({ where: { userId } });
}

async function getOwnedProduct(productId: string, creatorId: string) {
  return db.product.findFirst({
    where: { id: productId, creatorId },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      files: true,
    },
  });
}

// GET /api/creator/products/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await getCreatorProfile(session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  }

  const product = await getOwnedProduct(id, profile.id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PUT /api/creator/products/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await getCreatorProfile(session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  }

  const owned = await db.product.findFirst({ where: { id, creatorId: profile.id } });
  if (!owned) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const {
      title,
      slug: rawSlug,
      type,
      price,
      compareAtPrice,
      shortDescription,
      description,
      licenseType,
      licenseTerms,
      categoryIds = [],
      tags = [],
      status,
      images,
      files = [],
    } = body;

    if (title !== undefined && !title?.trim()) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }

    const slug = rawSlug?.trim() || (title ? slugify(title.trim()) : undefined);

    // Check slug uniqueness (excluding self)
    if (slug && slug !== owned.slug) {
      const existing = await db.product.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
      }
    }

    // Upsert tags
    const tagRecords = await Promise.all(
      (tags as string[]).map(async (name: string) => {
        const tagSlug = slugify(name);
        return db.tag.upsert({
          where: { slug: tagSlug },
          create: { name, slug: tagSlug },
          update: {},
        });
      })
    );

    // Update inside a transaction: clear and recreate categories/tags, append new files
    const updated = await db.$transaction(async (tx) => {
      // Delete existing category/tag links
      await tx.categoriesOnProducts.deleteMany({ where: { productId: id } });
      await tx.tagsOnProducts.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          ...(title !== undefined && { title: title.trim() }),
          ...(slug && { slug }),
          ...(type !== undefined && { type }),
          ...(price !== undefined && { price }),
          ...(compareAtPrice !== undefined && { compareAtPrice }),
          ...(shortDescription !== undefined && { shortDescription: shortDescription || null }),
          ...(description !== undefined && { description: description || null }),
          ...(licenseType !== undefined && { licenseType: licenseType || null }),
          ...(licenseTerms !== undefined && { licenseTerms: licenseTerms || null }),
          ...(status !== undefined && { status }),
          ...(images !== undefined && { images }),
          categories: {
            create: (categoryIds as string[]).map((categoryId: string) => ({ categoryId })),
          },
          tags: {
            create: tagRecords.map((tag) => ({ tagId: tag.id })),
          },
          // Append new files
          files: {
            create: (files as { fileName: string; filePath: string; fileSize: number; mimeType: string }[]).map(
              (f) => ({
                fileName: f.fileName,
                filePath: f.filePath,
                fileSize: f.fileSize,
                mimeType: f.mimeType,
              })
            ),
          },
        },
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
          files: true,
        },
      });
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update product error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// DELETE /api/creator/products/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await getCreatorProfile(session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  }

  const owned = await db.product.findFirst({ where: { id, creatorId: profile.id } });
  if (!owned) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await db.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

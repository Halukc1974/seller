import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

async function getCreatorProfile(userId: string) {
  return db.creatorProfile.findUnique({ where: { userId } });
}

// GET /api/creator/products — list creator's own products
export async function GET() {
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

  const products = await db.product.findMany({
    where: { creatorId: profile.id },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      files: { select: { id: true, fileName: true, fileSize: true } },
      _count: { select: { purchases: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

// POST /api/creator/products — create new product
export async function POST(request: NextRequest) {
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

  try {
    const body = await request.json();
    const {
      title,
      slug: rawSlug,
      type = "OTHER",
      price = 0,
      compareAtPrice = null,
      shortDescription = null,
      description = null,
      licenseType = null,
      licenseTerms = null,
      categoryIds = [],
      tags = [],
      status = "DRAFT",
      images = [],
      files = [],
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const slug = rawSlug?.trim() || slugify(title.trim());

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
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

    const product = await db.product.create({
      data: {
        creatorId: profile.id,
        title: title.trim(),
        slug,
        type,
        price,
        compareAtPrice,
        shortDescription,
        description,
        licenseType,
        licenseTerms,
        status,
        images,
        categories: {
          create: (categoryIds as string[]).map((categoryId: string) => ({ categoryId })),
        },
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
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

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

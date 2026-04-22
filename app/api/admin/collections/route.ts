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

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const collections = await db.collection.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(collections);
}

export async function POST(request: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  let body: { title?: string; slug?: string; description?: string; featured?: boolean; sortOrder?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, slug, description, featured, sortOrder } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  try {
    const collection = await db.collection.create({
      data: {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description?.trim() ?? null,
        featured: featured ?? false,
        sortOrder: sortOrder ?? 0,
      },
    });
    return NextResponse.json(collection, { status: 201 });
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A collection with this slug already exists" }, { status: 409 });
    }
    console.error("Admin create collection error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

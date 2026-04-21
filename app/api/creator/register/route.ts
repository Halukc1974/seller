import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { storeName, slug, bio } = body as {
      storeName?: string;
      slug?: string;
      bio?: string;
    };

    // Validate storeName
    if (!storeName || storeName.trim().length === 0) {
      return NextResponse.json(
        { error: "Store name is required" },
        { status: 400 }
      );
    }

    // Validate slug: URL-safe characters only
    if (!slug || slug.trim().length === 0) {
      return NextResponse.json(
        { error: "Store URL slug is required" },
        { status: 400 }
      );
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug.trim())) {
      return NextResponse.json(
        {
          error:
            "Slug must be lowercase letters, numbers, and hyphens only (e.g. my-store)",
        },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existingSlug = await db.creatorProfile.findUnique({
      where: { slug: slug.trim() },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: "This store URL is already taken" },
        { status: 409 }
      );
    }

    // Check user doesn't already have a creator profile
    const existingProfile = await db.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (existingProfile) {
      return NextResponse.json(
        { error: "You already have a creator profile" },
        { status: 409 }
      );
    }

    // Create creator profile and update user role in a transaction
    const [profile] = await db.$transaction([
      db.creatorProfile.create({
        data: {
          userId: session.user.id,
          storeName: storeName.trim(),
          slug: slug.trim(),
          bio: bio?.trim() ?? null,
        },
      }),
      db.user.update({
        where: { id: session.user.id },
        data: { role: "CREATOR" },
      }),
    ]);

    return NextResponse.json(
      {
        id: profile.id,
        storeName: profile.storeName,
        slug: profile.slug,
        bio: profile.bio,
        verified: profile.verified,
        createdAt: profile.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Creator registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

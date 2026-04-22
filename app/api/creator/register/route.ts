import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateAcceptances } from "@/lib/creator-legal";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      storeName?: string;
      slug?: string;
      bio?: string;
      acceptances?: unknown;
    };
    const { storeName, slug, bio, acceptances } = body;

    if (!storeName || storeName.trim().length === 0) {
      return NextResponse.json({ error: "Store name is required" }, { status: 400 });
    }

    if (!slug || slug.trim().length === 0) {
      return NextResponse.json({ error: "Store URL slug is required" }, { status: 400 });
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug.trim())) {
      return NextResponse.json(
        {
          error:
            "Slug must be lowercase letters, numbers, and hyphens only (e.g. my-store)",
        },
        { status: 400 },
      );
    }

    const acceptanceResult = validateAcceptances(acceptances);
    if (!acceptanceResult.ok) {
      return NextResponse.json({ error: acceptanceResult.error }, { status: 400 });
    }

    const existingSlug = await db.creatorProfile.findUnique({
      where: { slug: slug.trim() },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: "This store URL is already taken" },
        { status: 409 },
      );
    }

    const existingProfile = await db.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (existingProfile) {
      return NextResponse.json(
        { error: "You already have a creator profile" },
        { status: 409 },
      );
    }

    // Capture audit context
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded?.split(",")[0]?.trim() ?? null;
    const userAgent = request.headers.get("user-agent") ?? null;

    const userId = session.user.id;

    const profile = await db.$transaction(async (tx) => {
      const created = await tx.creatorProfile.create({
        data: {
          userId,
          storeName: storeName.trim(),
          slug: slug.trim(),
          bio: bio?.trim() ?? null,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { role: "CREATOR" },
      });

      await tx.creatorLegalAcceptance.createMany({
        data: acceptanceResult.accepted.map((a) => ({
          creatorProfileId: created.id,
          documentKey: a.key,
          documentVersion: a.version,
          ipAddress,
          userAgent,
        })),
      });

      return created;
    });

    return NextResponse.json(
      {
        id: profile.id,
        storeName: profile.storeName,
        slug: profile.slug,
        bio: profile.bio,
        verified: profile.verified,
        createdAt: profile.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Creator registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

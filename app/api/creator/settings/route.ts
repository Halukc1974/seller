import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/creator/settings — return creator profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await db.creatorProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      storeName: true,
      slug: true,
      bio: true,
      avatar: true,
      banner: true,
      payoutEmail: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

// PUT /api/creator/settings — update storeName, bio, payoutEmail
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await db.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  }

  // Verify ownership
  if (profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { storeName, bio, payoutEmail } = body as {
      storeName?: string;
      bio?: string;
      payoutEmail?: string;
    };

    if (storeName !== undefined && storeName.trim().length === 0) {
      return NextResponse.json({ error: "Store name cannot be empty" }, { status: 400 });
    }

    const updated = await db.creatorProfile.update({
      where: { id: profile.id },
      data: {
        ...(storeName !== undefined ? { storeName: storeName.trim() } : {}),
        ...(bio !== undefined ? { bio: bio.trim() || null } : {}),
        ...(payoutEmail !== undefined
          ? { payoutEmail: payoutEmail.trim() || null }
          : {}),
      },
      select: {
        id: true,
        storeName: true,
        slug: true,
        bio: true,
        payoutEmail: true,
        verified: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Creator settings update error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

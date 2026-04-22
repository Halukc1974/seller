import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ creatorId: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { creatorId } = await params;
  const body = (await request.json().catch(() => ({}))) as { verified?: boolean };

  const profile = await db.creatorProfile.findUnique({
    where: { id: creatorId },
    select: { id: true, verified: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  const nextValue = typeof body.verified === "boolean" ? body.verified : !profile.verified;

  const updated = await db.creatorProfile.update({
    where: { id: creatorId },
    data: { verified: nextValue },
    select: { id: true, verified: true },
  });

  await logAdminAction({
    actorId: session.user.id!,
    actorEmail: session.user.email,
    action: nextValue ? "creator.verify" : "creator.unverify",
    targetType: "CreatorProfile",
    targetId: creatorId,
  });

  return NextResponse.json(updated);
}

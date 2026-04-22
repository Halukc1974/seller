import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { verified?: boolean };

  const profile = await db.creatorProfile.findUnique({
    where: { userId: id },
    select: { id: true, verified: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  }

  const nextValue = typeof body.verified === "boolean" ? body.verified : !profile.verified;

  const updated = await db.creatorProfile.update({
    where: { id: profile.id },
    data: { verified: nextValue },
    select: { id: true, verified: true },
  });

  return NextResponse.json(updated);
}

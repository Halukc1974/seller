import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSuperAdminEmail, logAdminAction } from "@/lib/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    status?: "ACTIVE" | "BANNED";
    reason?: string | null;
  };

  if (body.status !== "ACTIVE" && body.status !== "BANNED") {
    return NextResponse.json(
      { error: "status must be ACTIVE or BANNED" },
      { status: 400 },
    );
  }

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, status: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (isSuperAdminEmail(target.email)) {
    return NextResponse.json(
      { error: "Cannot ban the super-admin account." },
      { status: 403 },
    );
  }

  const updated = await db.user.update({
    where: { id },
    data:
      body.status === "BANNED"
        ? {
            status: "BANNED",
            bannedAt: new Date(),
            bannedReason: body.reason ?? null,
          }
        : { status: "ACTIVE", bannedAt: null, bannedReason: null },
    select: { id: true, status: true },
  });

  // Invalidate sessions for banned users so they drop immediately
  if (body.status === "BANNED") {
    await db.session.deleteMany({ where: { userId: id } }).catch(() => {});
  }

  await logAdminAction({
    actorId: session.user.id!,
    actorEmail: session.user.email,
    action: body.status === "BANNED" ? "user.ban" : "user.unban",
    targetType: "User",
    targetId: id,
    metadata: { reason: body.reason ?? null },
  });

  return NextResponse.json(updated);
}

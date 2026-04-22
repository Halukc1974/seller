import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin";

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
    suspended?: boolean;
    reason?: string | null;
  };

  const profile = await db.creatorProfile.findUnique({
    where: { id },
    select: { id: true, suspended: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  const nextValue = typeof body.suspended === "boolean" ? body.suspended : !profile.suspended;

  await db.creatorProfile.update({
    where: { id },
    data: nextValue
      ? {
          suspended: true,
          suspendedAt: new Date(),
          suspendedReason: body.reason ?? null,
        }
      : { suspended: false, suspendedAt: null, suspendedReason: null },
  });

  // Optional: archive their PUBLISHED products on suspend so they disappear
  // from the storefront; leave DRAFT/ARCHIVED alone.
  if (nextValue) {
    await db.product.updateMany({
      where: { creatorId: id, status: "PUBLISHED" },
      data: { status: "ARCHIVED" },
    });
  }

  await logAdminAction({
    actorId: session.user.id!,
    actorEmail: session.user.email,
    action: nextValue ? "creator.suspend" : "creator.unsuspend",
    targetType: "CreatorProfile",
    targetId: id,
    metadata: { reason: body.reason ?? null },
  });

  return NextResponse.json({ ok: true, suspended: nextValue });
}

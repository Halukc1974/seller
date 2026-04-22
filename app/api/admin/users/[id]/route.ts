import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSuperAdminEmail, logAdminAction } from "@/lib/admin";

const VALID_ROLES = ["BUYER", "CREATOR", "ADMIN"] as const;
type Role = (typeof VALID_ROLES)[number];

export async function PUT(
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

  let body: { role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const role = body.role;
  if (!role || !VALID_ROLES.includes(role as Role)) {
    return NextResponse.json(
      { error: `role must be one of: ${VALID_ROLES.join(", ")}` },
      { status: 400 },
    );
  }

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Super-admin is untouchable
  if (isSuperAdminEmail(target.email)) {
    return NextResponse.json(
      { error: "Cannot modify the super-admin account." },
      { status: 403 },
    );
  }

  const actorIsSuperAdmin = isSuperAdminEmail(session.user.email);

  // Only the super-admin can grant or revoke ADMIN
  const isPromotionToAdmin = role === "ADMIN" && target.role !== "ADMIN";
  const isDemotionFromAdmin = target.role === "ADMIN" && role !== "ADMIN";
  if ((isPromotionToAdmin || isDemotionFromAdmin) && !actorIsSuperAdmin) {
    return NextResponse.json(
      { error: "Only the super-admin can change admin assignments." },
      { status: 403 },
    );
  }

  const user = await db.user.update({
    where: { id },
    data: { role: role as Role },
    select: { id: true, email: true, role: true },
  });

  await logAdminAction({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "user.role.update",
    targetType: "User",
    targetId: id,
    metadata: { from: target.role, to: role },
  });

  return NextResponse.json(user);
}

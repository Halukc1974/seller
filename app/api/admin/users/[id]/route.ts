import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_ROLES = ["BUYER", "CREATOR", "ADMIN"] as const;
type Role = (typeof VALID_ROLES)[number];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

  const { role } = body;
  if (!role || !VALID_ROLES.includes(role as Role)) {
    return NextResponse.json(
      { error: `role must be one of: ${VALID_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const user = await db.user.update({
      where: { id },
      data: { role: role as Role },
      select: { id: true, email: true, role: true },
    });
    return NextResponse.json(user);
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Admin update user role error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

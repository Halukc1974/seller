import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, currentPassword, newPassword } = body as {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  // Profile name update
  if (name !== undefined) {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    await db.user.update({
      where: { id: session.user.id },
      data: { name: trimmed },
    });
    return NextResponse.json({ success: true });
  }

  // Password update
  if (currentPassword !== undefined && newPassword !== undefined) {
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password) {
      return NextResponse.json({ error: "No password set on this account" }, { status: 400 });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
}

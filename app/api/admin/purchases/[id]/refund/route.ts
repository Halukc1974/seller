import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _request: NextRequest,
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
  const purchase = await db.purchase.findUnique({
    where: { id },
    select: { id: true, status: true, productId: true },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  if (purchase.status === "REFUNDED") {
    return NextResponse.json({ ok: true, alreadyRefunded: true });
  }

  await db.purchase.update({
    where: { id },
    data: { status: "REFUNDED" },
  });

  if (purchase.status === "COMPLETED") {
    await db.product.update({
      where: { id: purchase.productId },
      data: { totalSales: { decrement: 1 } },
    });
  }

  return NextResponse.json({ ok: true });
}

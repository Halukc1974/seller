import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ users: [], creators: [], products: [], orders: [] });
  }

  const [users, creators, products, orders] = await Promise.all([
    db.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true, role: true },
      take: 5,
    }),
    db.creatorProfile.findMany({
      where: {
        OR: [
          { storeName: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, storeName: true, slug: true },
      take: 5,
    }),
    db.product.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, slug: true, status: true },
      take: 5,
    }),
    db.purchase.findMany({
      where: {
        OR: [
          { id: { contains: q, mode: "insensitive" } },
          { paddleTransactionId: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        user: { select: { email: true } },
      },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    users,
    creators,
    products,
    orders: orders.map((o) => ({
      ...o,
      amount: Number(o.amount),
    })),
  });
}

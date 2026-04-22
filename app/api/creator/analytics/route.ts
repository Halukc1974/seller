import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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
  });

  if (!profile) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  }

  // All products for this creator
  const products = await db.product.findMany({
    where: { creatorId: profile.id },
    select: {
      id: true,
      title: true,
      totalSales: true,
      averageRating: true,
      reviewCount: true,
    },
  });

  const totalProducts = products.length;
  const totalSales = products.reduce((sum, p) => sum + p.totalSales, 0);

  // Total revenue: sum of completed purchases for creator's products
  const productIds = products.map((p) => p.id);

  const revenueResult = await db.purchase.aggregate({
    where: {
      productId: { in: productIds },
      status: "COMPLETED",
    },
    _sum: { amount: true },
  });

  const totalRevenue = Number(revenueResult._sum.amount ?? 0);

  // Avg rating across all products
  const ratedProducts = products.filter((p) => p.reviewCount > 0);
  const avgRating =
    ratedProducts.length > 0
      ? ratedProducts.reduce((sum, p) => sum + Number(p.averageRating), 0) /
        ratedProducts.length
      : 0;

  // Recent purchases (last 10) with product and buyer info
  const recentPurchases = await db.purchase.findMany({
    where: {
      productId: { in: productIds },
      status: "COMPLETED",
    },
    include: {
      product: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Top 5 products by sales
  const topProducts = [...products]
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title,
      totalSales: p.totalSales,
      averageRating: Number(p.averageRating),
      reviewCount: p.reviewCount,
    }));

  return NextResponse.json({
    stats: {
      totalProducts,
      totalSales,
      totalRevenue,
      avgRating: Math.round(avgRating * 100) / 100,
    },
    recentPurchases: recentPurchases.map((p) => ({
      id: p.id,
      createdAt: p.createdAt,
      amount: Number(p.amount),
      currency: p.currency,
      product: p.product,
      buyer: p.user,
    })),
    topProducts,
  });
}

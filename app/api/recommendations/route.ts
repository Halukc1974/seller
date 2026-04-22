import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPersonalizedRecommendations,
  getAlsoBought,
  getTrendingInCategory,
  mapRecommendedProduct,
} from "@/lib/recommendations";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const type = url.searchParams.get("type") ?? "personalized";
    const productId = url.searchParams.get("productId") ?? undefined;
    const categorySlug = url.searchParams.get("categorySlug") ?? undefined;
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") ?? "6", 10),
      12
    );

    // Optional auth — personalized if logged in
    const session = await auth();
    const userId = session?.user?.id ?? null;

    let products: ReturnType<typeof mapRecommendedProduct>[] = [];

    if (type === "also-bought") {
      if (!productId) {
        return Response.json(
          { error: "productId is required for also-bought" },
          { status: 400 }
        );
      }
      const raw = await getAlsoBought(productId, limit);
      products = raw.map(mapRecommendedProduct);
    } else if (type === "trending") {
      if (categorySlug) {
        const raw = await getTrendingInCategory(categorySlug, limit);
        products = raw.map(mapRecommendedProduct);
      } else {
        // Global trending
        const raw = await db.product.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { totalSales: "desc" },
          take: limit,
          include: {
            creator: { select: { storeName: true, slug: true, verified: true } },
            categories: {
              select: { category: { select: { name: true, slug: true } } },
            },
            tags: { select: { tag: { select: { name: true, slug: true } } } },
          },
        });
        products = raw.map(mapRecommendedProduct);
      }
    } else {
      // personalized (default)
      if (userId) {
        const raw = await getPersonalizedRecommendations(userId, limit);
        products = raw.map(mapRecommendedProduct);
      } else {
        // Anonymous fallback: trending
        const raw = await db.product.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { totalSales: "desc" },
          take: limit,
          include: {
            creator: {
              select: { storeName: true, slug: true, verified: true },
            },
            categories: {
              select: { category: { select: { name: true, slug: true } } },
            },
            tags: { select: { tag: { select: { name: true, slug: true } } } },
          },
        });
        products = raw.map(mapRecommendedProduct);
      }
    }

    return Response.json({ products });
  } catch (err) {
    console.error("[recommendations] error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

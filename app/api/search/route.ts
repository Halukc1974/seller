import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const q = searchParams.get("q") ?? "";
  const limitParam = searchParams.get("limit");
  const category = searchParams.get("category") ?? "";
  const type = searchParams.get("type") ?? "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") ?? "newest";
  const pageParam = searchParams.get("page") ?? "1";

  const limit = Math.min(parseInt(limitParam ?? "20", 10) || 20, 100);
  const page = Math.max(parseInt(pageParam, 10) || 1, 1);
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = {
    status: "PUBLISHED" as const,
  };

  if (q.trim()) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
    ];
  }

  if (category) {
    where.categories = {
      some: { category: { slug: category } },
    };
  }

  if (type) {
    where.type = type;
  }

  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
      ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
    };
  }

  // Build orderBy
  type OrderByClause = Record<string, "asc" | "desc">;
  let orderBy: OrderByClause;
  switch (sort) {
    case "popular":
      orderBy = { totalSales: "desc" };
      break;
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "rating":
      orderBy = { averageRating: "desc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  try {
    const [rawProducts, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        take: limit,
        skip,
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          type: true,
          price: true,
          currency: true,
          compareAtPrice: true,
          images: true,
          featured: true,
          totalSales: true,
          averageRating: true,
          reviewCount: true,
          creator: {
            select: {
              storeName: true,
              slug: true,
              verified: true,
            },
          },
          categories: {
            select: {
              category: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
          tags: {
            select: {
              tag: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    const products = rawProducts.map((p) => {
      const priceNum = parseFloat(p.price.toString());
      const compareAtPriceNum = p.compareAtPrice
        ? parseFloat(p.compareAtPrice.toString())
        : null;

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        type: p.type,
        price: priceNum,
        currency: p.currency,
        compareAtPrice: compareAtPriceNum,
        formattedPrice: formatPrice(priceNum, p.currency),
        formattedCompareAtPrice: compareAtPriceNum
          ? formatPrice(compareAtPriceNum, p.currency)
          : null,
        images: p.images,
        featured: p.featured,
        totalSales: p.totalSales,
        averageRating: parseFloat(p.averageRating.toString()),
        reviewCount: p.reviewCount,
        creator: p.creator,
        categories: p.categories.map((c) => c.category),
        tags: p.tags.map((t) => t.tag),
      };
    });

    const totalPages = Math.ceil(total / limit);

    return Response.json({
      products,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("[search API]", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

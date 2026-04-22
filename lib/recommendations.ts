import { db } from "./db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const productInclude = {
  creator: { select: { storeName: true, slug: true, verified: true } },
  categories: { select: { category: { select: { name: true, slug: true } } } },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
} as const;

// ---------------------------------------------------------------------------
// Fallbacks
// ---------------------------------------------------------------------------

async function getTrendingProducts(limit: number) {
  return db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { totalSales: "desc" },
    take: limit,
    include: productInclude,
  });
}

async function getRelatedByTags(productId: string, limit: number) {
  const tags = await db.tagsOnProducts.findMany({
    where: { productId },
    select: { tagId: true },
  });
  const tagIds = tags.map((t) => t.tagId);

  if (tagIds.length === 0) {
    return getTrendingProducts(limit);
  }

  return db.product.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: productId },
      tags: { some: { tagId: { in: tagIds } } },
    },
    orderBy: { totalSales: "desc" },
    take: limit,
    include: productInclude,
  });
}

// ---------------------------------------------------------------------------
// "Recommended for you" — content-based filtering via tags/categories
// ---------------------------------------------------------------------------

export async function getPersonalizedRecommendations(userId: string, limit = 6) {
  // 1. Get user's recent product interactions (purchases + views + wishlist)
  const interactions = await db.userEvent.findMany({
    where: { userId, event: { in: ["PURCHASE", "VIEW", "WISHLIST_ADD"] } },
    select: { productId: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const interactedIds = [
    ...new Set(interactions.map((e) => e.productId).filter(Boolean)),
  ] as string[];

  if (interactedIds.length === 0) {
    // Fallback: return popular products
    return getTrendingProducts(limit);
  }

  // 2. Get tags from interacted products
  const tags = await db.tagsOnProducts.findMany({
    where: { productId: { in: interactedIds } },
    select: { tagId: true },
  });
  const tagIds = [...new Set(tags.map((t) => t.tagId))];

  // 3. Get categories from interacted products
  const cats = await db.categoriesOnProducts.findMany({
    where: { productId: { in: interactedIds } },
    select: { categoryId: true },
  });
  const categoryIds = [...new Set(cats.map((c) => c.categoryId))];

  // 4. Find products with matching tags or categories, excluding already interacted
  const recommended = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      id: { notIn: interactedIds },
      OR: [
        ...(tagIds.length > 0
          ? [{ tags: { some: { tagId: { in: tagIds } } } }]
          : []),
        ...(categoryIds.length > 0
          ? [{ categories: { some: { categoryId: { in: categoryIds } } } }]
          : []),
      ],
    },
    orderBy: { totalSales: "desc" },
    take: limit,
    include: productInclude,
  });

  // If not enough results, fill with trending
  if (recommended.length < limit) {
    const existing = new Set(recommended.map((p) => p.id));
    const fallback = await db.product.findMany({
      where: {
        status: "PUBLISHED",
        id: { notIn: [...interactedIds, ...Array.from(existing)] },
      },
      orderBy: { totalSales: "desc" },
      take: limit - recommended.length,
      include: productInclude,
    });
    return [...recommended, ...fallback];
  }

  return recommended;
}

// ---------------------------------------------------------------------------
// "Users also bought" — co-purchase analysis
// ---------------------------------------------------------------------------

export async function getAlsoBought(productId: string, limit = 4) {
  // Find users who bought this product
  const buyers = await db.purchase.findMany({
    where: { productId, status: "COMPLETED" },
    select: { userId: true },
    take: 100,
  });
  const buyerIds = buyers.map((b) => b.userId);

  if (buyerIds.length === 0) {
    return getRelatedByTags(productId, limit);
  }

  // Find other products those users bought
  const alsoBought = await db.purchase.findMany({
    where: {
      userId: { in: buyerIds },
      productId: { not: productId },
      status: "COMPLETED",
    },
    select: { productId: true },
  });

  if (alsoBought.length === 0) {
    return getRelatedByTags(productId, limit);
  }

  // Count frequency
  const freq: Record<string, number> = {};
  alsoBought.forEach((p) => {
    freq[p.productId] = (freq[p.productId] || 0) + 1;
  });
  const topIds = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topIds.length === 0) return getRelatedByTags(productId, limit);

  const products = await db.product.findMany({
    where: { id: { in: topIds }, status: "PUBLISHED" },
    include: productInclude,
  });

  // Return in frequency order
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  return topIds.map((id) => byId[id]).filter(Boolean);
}

// ---------------------------------------------------------------------------
// "Trending in category"
// ---------------------------------------------------------------------------

export async function getTrendingInCategory(categorySlug: string, limit = 6) {
  return db.product.findMany({
    where: {
      status: "PUBLISHED",
      categories: { some: { category: { slug: categorySlug } } },
    },
    orderBy: { totalSales: "desc" },
    take: limit,
    include: productInclude,
  });
}

// ---------------------------------------------------------------------------
// Shape helper — normalise DB product to ProductCard-compatible shape
// ---------------------------------------------------------------------------

export function mapRecommendedProduct(
  product: Awaited<ReturnType<typeof getTrendingProducts>>[number]
) {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    shortDescription: (product as { shortDescription?: string | null })
      .shortDescription ?? null,
    type: product.type as string,
    price: Number(product.price).toFixed(2),
    compareAtPrice: (product as { compareAtPrice?: { toString(): string } | null })
      .compareAtPrice
      ? Number((product as { compareAtPrice?: { toString(): string } | null }).compareAtPrice).toFixed(2)
      : null,
    images: product.images as string[],
    featured: product.featured,
    totalSales: product.totalSales,
    averageRating: Number(product.averageRating),
    reviewCount: product.reviewCount,
    creator: {
      storeName: product.creator.storeName,
      slug: product.creator.slug,
      verified: product.creator.verified,
    },
  };
}

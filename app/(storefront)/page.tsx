import Link from "next/link";
import {
  Search,
  Star,
  TrendingUp,
  Layout,
  Code,
  Palette,
  GraduationCap,
  Key,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Data-fetching helpers
// ---------------------------------------------------------------------------

async function getFeaturedProducts() {
  const products = await db.product.findMany({
    where: { featured: true, status: "PUBLISHED" },
    orderBy: { totalSales: "desc" },
    take: 6,
    include: {
      creator: true,
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });
  return products.map(mapProduct);
}

async function getTrendingProducts() {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { totalSales: "desc" },
    take: 6,
    include: {
      creator: true,
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });
  return products.map(mapProduct);
}

async function getCategories() {
  return db.category.findMany({
    where: { parentId: null },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

async function getPopularTags() {
  return db.tag.findMany({
    orderBy: { products: { _count: "desc" } },
    take: 12,
  });
}

async function getStats() {
  const [productCount, creatorCount, salesAggregate] = await Promise.all([
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.creatorProfile.count(),
    db.product.aggregate({ _sum: { totalSales: true } }),
  ]);
  return {
    productCount,
    creatorCount,
    totalSales: salesAggregate._sum.totalSales ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Mapping helper: DB product → ProductCard prop shape
// ---------------------------------------------------------------------------

function mapProduct(
  product: Awaited<ReturnType<typeof db.product.findMany>>[number] & {
    creator: { storeName: string; slug: string; verified: boolean };
  }
) {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    type: product.type,
    price: formatPrice(Number(product.price), product.currency ?? "USD"),
    compareAtPrice: product.compareAtPrice
      ? formatPrice(Number(product.compareAtPrice), product.currency ?? "USD")
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

// ---------------------------------------------------------------------------
// Category icon map
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  templates: <Layout className="h-6 w-6" />,
  software: <Code className="h-6 w-6" />,
  assets: <Palette className="h-6 w-6" />,
  courses: <GraduationCap className="h-6 w-6" />,
  licenses: <Key className="h-6 w-6" />,
};

function getCategoryIcon(slug: string) {
  const key = Object.keys(CATEGORY_ICONS).find((k) =>
    slug.toLowerCase().includes(k)
  );
  return key ? CATEGORY_ICONS[key] : <Layout className="h-6 w-6" />;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
  const [featured, trending, categories, tags, stats] = await Promise.all([
    getFeaturedProducts(),
    getTrendingProducts(),
    getCategories(),
    getPopularTags(),
    getStats(),
  ]);

  return (
    <div className="flex flex-col gap-0">
      {/* ------------------------------------------------------------------ */}
      {/* 1. Hero — Search-First                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find the perfect{" "}
            <span className="text-primary">digital product</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Premium templates, software, assets, courses, and licenses from
            verified creators.
          </p>

          {/* Search bar */}
          <form
            action="/products"
            className="mt-8 flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 shadow-sm focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
          >
            <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <input
              name="q"
              type="search"
              placeholder="Search products, templates, software…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>

          {/* Popular tags */}
          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {tags.slice(0, 8).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/products?q=${encodeURIComponent(tag.name)}`}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground hover:border-primary/60 hover:bg-primary/5 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Categories                                                        */}
      {/* ------------------------------------------------------------------ */}
      {categories.length > 0 && (
        <section className="py-14 px-4">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-2xl font-bold">Browse Categories</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.slug)}`}
                  className="group flex flex-col items-center gap-3 rounded-md border border-border bg-card p-6 text-center hover:border-primary/60 hover:shadow-md transition-all duration-200"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {getCategoryIcon(cat.slug)}
                  </span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {cat._count.products} products
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. Featured Products                                                 */}
      {/* ------------------------------------------------------------------ */}
      {featured.length > 0 && (
        <section className="py-14 px-4 border-t border-border">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Featured Products</h2>
                  <p className="text-sm text-muted-foreground">
                    Hand-picked by our team
                  </p>
                </div>
              </div>
              <Link
                href="/products?featured=true"
                className="text-sm text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. Trending Now                                                      */}
      {/* ------------------------------------------------------------------ */}
      {trending.length > 0 && (
        <section className="bg-secondary/30 py-14 px-4 border-t border-border">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Trending Now</h2>
                  <p className="text-sm text-muted-foreground">
                    Most popular this week
                  </p>
                </div>
              </div>
              <Link
                href="/products"
                className="text-sm text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. Stats / Social Proof                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-14 px-4 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            <div>
              <p className="text-4xl font-bold text-foreground">
                {stats.productCount.toLocaleString()}+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Digital Products
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-foreground">
                {stats.creatorCount.toLocaleString()}+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Verified Creators
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-foreground">
                {Number(stats.totalSales).toLocaleString()}+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Products Sold
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. CTA                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Start selling your digital products
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Join thousands of creators who are already selling on Seller.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard/become-creator">
              <button className="inline-flex h-12 items-center justify-center rounded-sm bg-white px-6 text-base font-medium text-primary shadow-sm hover:bg-white/90 transition-all duration-200 active:scale-[0.98]">
                Become a Creator
              </button>
            </Link>
            <Link href="/about">
              <button className="inline-flex h-12 items-center justify-center rounded-sm border border-primary-foreground/40 bg-transparent px-6 text-base font-medium text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200 active:scale-[0.98]">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

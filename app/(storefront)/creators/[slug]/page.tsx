import { notFound } from "next/navigation";
import { CheckCircle, Package } from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product/product-card";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const creator = await db.creatorProfile.findUnique({
    where: { slug },
    select: { storeName: true, bio: true },
  });
  if (!creator) return {};
  return {
    title: `${creator.storeName} — Seller`,
    description: creator.bio ?? `Browse products by ${creator.storeName}`,
  };
}

export default async function CreatorStorefrontPage({ params }: PageProps) {
  const { slug } = await params;

  const creator = await db.creatorProfile.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          type: true,
          price: true,
          compareAtPrice: true,
          images: true,
          featured: true,
          totalSales: true,
          averageRating: true,
          reviewCount: true,
        },
      },
    },
  });

  if (!creator) {
    notFound();
  }

  const totalSales = creator.products.reduce((sum, p) => sum + p.totalSales, 0);

  // Format products for ProductCard
  const formattedProducts = creator.products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    type: p.type as string,
    price: p.price.toString(),
    compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toString() : null,
    images: p.images,
    featured: p.featured,
    totalSales: p.totalSales,
    averageRating: Number(p.averageRating),
    reviewCount: p.reviewCount,
    creator: {
      storeName: creator.storeName,
      slug: creator.slug,
      verified: creator.verified,
    },
  }));

  const initials = creator.storeName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div
        className="h-48 w-full bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/20"
        style={
          creator.banner
            ? {
                backgroundImage: `url(${creator.banner})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      />

      {/* Creator info */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative -mt-12 flex items-end gap-5 pb-6">
          {/* Avatar */}
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
            {creator.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={creator.avatar}
                alt={creator.storeName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          {/* Name + badge */}
          <div className="mb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {creator.storeName}
              </h1>
              {creator.verified && (
                <CheckCircle
                  className="h-5 w-5 text-primary"
                  aria-label="Verified creator"
                />
              )}
            </div>
            {creator.bio && (
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {creator.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 border-t border-border py-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            <span>
              <span className="font-semibold text-foreground">
                {creator.products.length}
              </span>{" "}
              {creator.products.length === 1 ? "product" : "products"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-foreground">{totalSales}</span>{" "}
            total {totalSales === 1 ? "sale" : "sales"}
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="mx-auto max-w-5xl px-4 pb-20">
        {formattedProducts.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Package className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">No products yet</p>
            <p className="mt-1 text-sm">
              Check back later — this creator is working on something great.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {formattedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

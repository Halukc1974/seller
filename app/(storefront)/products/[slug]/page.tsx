import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Shield,
  Clock,
  Users,
  Heart,
  FileText,
} from "lucide-react";

import { db } from "@/lib/db";
import { formatPrice, timeAgo } from "@/lib/utils";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductCard } from "@/components/product/product-card";
import { ProductTypeBadge } from "@/components/product/product-type-badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaddleCheckout } from "@/components/checkout/paddle-checkout";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getProduct(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      creator: {
        select: {
          storeName: true,
          slug: true,
          verified: true,
          bio: true,
          avatar: true,
        },
      },
      categories: {
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
      },
      tags: {
        include: {
          tag: {
            select: { name: true, slug: true },
          },
        },
      },
      reviews: {
        include: {
          user: {
            select: { name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      files: {
        select: {
          id: true,
          fileName: true,
          fileSize: true,
          version: true,
        },
      },
    },
  });

  if (!product || product.status !== "PUBLISHED") return null;
  return product;
}

async function getRelatedProducts(productId: string, categorySlug: string | null) {
  const where = categorySlug
    ? {
        id: { not: productId },
        status: "PUBLISHED" as const,
        categories: { some: { category: { slug: categorySlug } } },
      }
    : {
        id: { not: productId },
        status: "PUBLISHED" as const,
      };

  const products = await db.product.findMany({
    where,
    orderBy: { totalSales: "desc" },
    take: 3,
    include: {
      creator: {
        select: { storeName: true, slug: true, verified: true },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    type: p.type as string,
    price: p.price.toString(),
    compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toString() : null,
    images: p.images as string[],
    featured: p.featured,
    totalSales: p.totalSales,
    averageRating: Number(p.averageRating),
    reviewCount: p.reviewCount,
    creator: {
      storeName: p.creator.storeName,
      slug: p.creator.slug,
      verified: p.creator.verified,
    },
  }));
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProduct(slug);
  if (!product) notFound();

  // Derived data
  const price = Number(product.price);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  const firstCategorySlug = product.categories[0]?.category.slug ?? null;
  const relatedProducts = await getRelatedProducts(product.id, firstCategorySlug);

  const metadata =
    product.metadata && typeof product.metadata === "object" && !Array.isArray(product.metadata)
      ? (product.metadata as Record<string, unknown>)
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left column — Gallery */}
        <div>
          <ProductGallery images={product.images as string[]} title={product.title} />
        </div>

        {/* Right column — Info */}
        <div className="flex flex-col gap-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <ProductTypeBadge type={product.type} />
            {product.featured && (
              <Badge variant="default" className="text-xs">
                Featured
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight text-foreground">{product.title}</h1>

          {/* Rating + sales */}
          <div className="flex flex-wrap items-center gap-4">
            <RatingStars rating={Number(product.averageRating)} count={product.reviewCount} size="md" />
            <span className="text-sm text-muted-foreground">{product.totalSales.toLocaleString()} sold</span>
          </div>

          {/* Creator info */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {product.creator.storeName.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/creators/${product.creator.slug}`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {product.creator.storeName}
              </Link>
              {product.creator.verified && (
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" aria-label="Verified creator" />
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-3xl font-mono font-bold text-foreground">{formatPrice(price)}</span>
            {compareAtPrice && (
              <span className="text-lg font-mono text-muted-foreground line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
            {discountPercent && (
              <Badge variant="default" className="mb-0.5 text-xs bg-green-600 text-white border-0">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <PaddleCheckout
              productId={product.id}
              productTitle={product.title}
              price={formatPrice(price)}
            />
            <Button variant="outline" size="lg" className="w-full">
              <Heart className="h-5 w-5" />
              Add to Wishlist
            </Button>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-sm border border-border bg-card p-3">
              <Download className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="text-xs text-muted-foreground">Instant download</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm border border-border bg-card p-3">
              <Shield className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="text-xs text-muted-foreground">Secure checkout</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm border border-border bg-card p-3">
              <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="text-xs text-muted-foreground">Lifetime access</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm border border-border bg-card p-3">
              <Users className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="text-xs text-muted-foreground">
                {product.licenseType ?? "Standard"} license
              </span>
            </div>
          </div>

          {/* License info */}
          {product.licenseType && (
            <div className="rounded-sm border border-border bg-secondary/50 p-4">
              <h3 className="mb-1 text-sm font-semibold text-foreground">
                {product.licenseType} License
              </h3>
              {product.licenseTerms && (
                <p className="text-xs text-muted-foreground leading-relaxed">{product.licenseTerms}</p>
              )}
            </div>
          )}

          {/* Files list */}
          {product.files.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Included Files</h3>
              <ul className="flex flex-col gap-2">
                {product.files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center gap-3 rounded-sm border border-border bg-card px-3 py-2"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                      {file.fileName}
                    </span>
                    <span className="flex-shrink-0 text-xs text-muted-foreground">
                      {formatFileSize(file.fileSize)}
                    </span>
                    <span className="flex-shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                      v{file.version}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metadata */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Details</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </dt>
                    <dd className="text-xs font-medium text-foreground">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(({ tag }) => (
                <Link
                  key={tag.slug}
                  href={`/products?q=${encodeURIComponent(tag.name)}`}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Below columns */}
      <div className="mt-16 flex flex-col gap-16">
        {/* Description */}
        {product.description && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-foreground">Description</h2>
            <div className="max-w-3xl">
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          </section>
        )}

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <section>
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              Reviews{" "}
              <span className="text-base font-normal text-muted-foreground">
                ({product.reviewCount})
              </span>
            </h2>
            <div className="flex flex-col gap-6">
              {product.reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-md border border-border bg-card p-5"
                >
                  <div className="mb-3 flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                      {review.user.image ? (
                        <Image
                          src={review.user.image}
                          alt={review.user.name ?? "Reviewer"}
                          width={36}
                          height={36}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        (review.user.name ?? "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {review.user.name ?? "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(new Date(review.createdAt))}
                        </span>
                      </div>
                      <div className="mt-1">
                        <RatingStars rating={review.rating} />
                      </div>
                    </div>
                  </div>
                  {review.title && (
                    <p className="mb-1 text-sm font-medium text-foreground">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="mb-6 text-xl font-semibold text-foreground">Related Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

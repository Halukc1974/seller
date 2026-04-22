import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getCollection(slug: string) {
  return db.collection.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          product: {
            include: {
              creator: { select: { storeName: true, slug: true, verified: true } },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Mapping helper: DB product → ProductCard shape
// ---------------------------------------------------------------------------

function mapProduct(
  p: NonNullable<Awaited<ReturnType<typeof getCollection>>>["products"][number]["product"]
) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    type: p.type,
    price: formatPrice(Number(p.price), p.currency ?? "USD"),
    compareAtPrice: p.compareAtPrice
      ? formatPrice(Number(p.compareAtPrice), p.currency ?? "USD")
      : null,
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
  };
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await db.collection.findUnique({ where: { slug }, select: { title: true, description: true } });
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.title,
    description: collection.description ?? `Browse the ${collection.title} collection`,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection) notFound();

  const products = collection.products.map((cop) => mapProduct(cop.product));

  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/collections"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All Collections
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <FolderOpen className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{collection.title}</h1>
                {collection.featured && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                    Featured
                  </span>
                )}
              </div>
              {collection.description && (
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl">{collection.description}</p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                {products.length} {products.length === 1 ? "product" : "products"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="py-14 px-4">
        <div className="mx-auto max-w-7xl">
          {products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-16 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No products in this collection yet.</p>
              <Link href="/products" className="mt-4 inline-block text-sm text-primary hover:underline">
                Browse all products →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

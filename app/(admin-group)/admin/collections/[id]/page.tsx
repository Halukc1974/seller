import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { CollectionForm } from "@/components/admin/collection-form";
import { CollectionProductManager } from "./collection-product-manager";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCollectionEditPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [collection, allProducts] = await Promise.all([
    db.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: {
                creator: { select: { storeName: true } },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    db.product.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        price: true,
        currency: true,
        creator: { select: { storeName: true } },
      },
      orderBy: { title: "asc" },
    }),
  ]);

  if (!collection) notFound();

  const currentProductIds = collection.products.map((p) => p.productId);
  const currentProducts = collection.products.map((p) => ({
    id: p.product.id,
    title: p.product.title,
    slug: p.product.slug,
    images: p.product.images as string[],
    creatorName: p.product.creator.storeName,
    sortOrder: p.sortOrder,
  }));

  const availableProducts = allProducts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    images: p.images as string[],
    creatorName: p.creator.storeName,
  }));

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/admin/collections" className="hover:text-foreground transition-colors">
          Collections
        </a>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{collection.title}</span>
      </div>

      {/* Details section */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Edit Collection</h1>
        <p className="text-sm text-muted-foreground">
          Public URL:{" "}
          <a
            href={`/collections/${collection.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-mono"
          >
            /collections/{collection.slug}
          </a>
        </p>
      </div>

      <div className="rounded-lg border border-border p-6">
        <h2 className="text-base font-semibold mb-4">Collection Details</h2>
        <CollectionForm
          collection={{
            id: collection.id,
            title: collection.title,
            slug: collection.slug,
            description: collection.description,
            featured: collection.featured,
            sortOrder: collection.sortOrder,
          }}
        />
      </div>

      {/* Product management section */}
      <div className="rounded-lg border border-border p-6">
        <h2 className="text-base font-semibold mb-1">Products</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {currentProducts.length} product{currentProducts.length !== 1 ? "s" : ""} in this collection
        </p>
        <CollectionProductManager
          collectionId={id}
          currentProducts={currentProducts}
          availableProducts={availableProducts}
          initialProductIds={currentProductIds}
        />
      </div>
    </div>
  );
}

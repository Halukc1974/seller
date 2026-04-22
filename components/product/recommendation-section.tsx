"use client";

import { useEffect, useState } from "react";
import { ProductCard, type ProductCardProps } from "@/components/product/product-card";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ProductCardSkeleton() {
  return (
    <div className="rounded-md border border-border bg-card overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 rounded bg-muted w-3/4" />
        <div className="h-3 rounded bg-muted w-1/2" />
        <div className="h-3 rounded bg-muted w-1/3 mt-1" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RecommendationSectionProps {
  title: string;
  type: "personalized" | "also-bought" | "trending";
  productId?: string;
  categorySlug?: string;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RecommendationSection({
  title,
  type,
  productId,
  categorySlug,
  limit = 6,
}: RecommendationSectionProps) {
  const [products, setProducts] = useState<ProductCardProps["product"][] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ type, limit: String(limit) });
    if (productId) params.set("productId", productId);
    if (categorySlug) params.set("categorySlug", categorySlug);

    fetch(`/api/recommendations?${params.toString()}`)
      .then((res) => res.json())
      .then((data: { products?: ProductCardProps["product"][] }) => {
        setProducts(data.products ?? []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [type, productId, categorySlug, limit]);

  // Don't render the section if loading is done and there are no results
  if (!loading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-6 text-xl font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : products!.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}

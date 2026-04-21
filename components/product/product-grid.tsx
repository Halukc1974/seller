"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Array<{
    id: string;
    title: string;
    slug: string;
    shortDescription?: string | null;
    type: string;
    price: string;
    compareAtPrice?: string | null;
    images: string[];
    featured: boolean;
    totalSales: number;
    averageRating: number;
    reviewCount: number;
    creator: { storeName: string; slug: string; verified: boolean };
  }>;
  total?: number;
}

function ProductGrid({ products, total }: ProductGridProps) {
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {total !== undefined ? (
            <>Showing <span className="font-medium text-foreground">{products.length}</span> of <span className="font-medium text-foreground">{total}</span> products</>
          ) : (
            <><span className="font-medium text-foreground">{products.length}</span> products</>
          )}
        </p>
        <div className="flex items-center gap-1 rounded-sm border border-border p-0.5">
          <button
            onClick={() => setLayout("grid")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-sm transition-colors",
              layout === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setLayout("list")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-sm transition-colors",
              layout === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium text-foreground">No products found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <motion.div
          layout
          className={cn(
            layout === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-3"
          )}
        >
          <AnimatePresence mode="popLayout">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <ProductCard product={product} layout={layout} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export { ProductGrid };

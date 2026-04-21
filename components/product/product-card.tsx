"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Eye, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { ProductTypeBadge } from "@/components/product/product-type-badge";
import { cn, formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
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
  };
  layout?: "grid" | "list";
}

function ProductCard({ product, layout = "grid" }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const imageSrc = product.images[0] ?? "/placeholder-product.png";

  if (layout === "list") {
    return (
      <Link href={`/products/${product.slug}`} className="block group">
        <div className="flex items-center gap-4 p-3 rounded-md border border-border bg-card hover:border-primary/40 transition-colors">
          <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-sm">
            <Image
              src={imageSrc}
              alt={product.title}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {product.creator.storeName}
            </p>
            {product.shortDescription && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.shortDescription}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <ProductTypeBadge type={product.type} />
              <RatingStars rating={product.averageRating} count={product.reviewCount} />
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="font-mono font-semibold text-sm text-foreground">{formatPrice(product.price)}</p>
            {product.compareAtPrice && (
              <p className="font-mono text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
      <Link href={`/products/${product.slug}`} className="block group">
        <div
          className="rounded-md border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Image area */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.div
              className="absolute inset-0"
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={imageSrc}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </motion.div>

            {/* Hover overlay */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  className="absolute inset-0 bg-black/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>

            {/* Quick action buttons */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    onClick={(e) => { e.preventDefault(); }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md hover:bg-white transition-colors"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md hover:bg-white transition-colors"
                    aria-label="Quick view"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Featured badge */}
            {product.featured && (
              <div className="absolute top-2 left-2">
                <Badge variant="default" className="text-xs">Featured</Badge>
              </div>
            )}

            {/* Type badge */}
            <div className={cn("absolute bottom-2 left-2", product.featured ? "" : "")}>
              <ProductTypeBadge type={product.type} />
            </div>
          </div>

          {/* Content area */}
          <div className="p-4">
            <h3 className="font-medium text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">
              {product.title}
            </h3>

            <div className="flex items-center gap-1 mb-3">
              <span className="text-xs text-muted-foreground">{product.creator.storeName}</span>
              {product.creator.verified && (
                <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-semibold text-sm text-foreground">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="font-mono text-xs text-muted-foreground line-through ml-1.5">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{product.totalSales} sold</span>
            </div>

            <div className="mt-2">
              <RatingStars rating={product.averageRating} count={product.reviewCount} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export { ProductCard };
export type { ProductCardProps };

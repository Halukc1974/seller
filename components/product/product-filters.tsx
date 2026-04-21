"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  categories: { label: string; value: string; count?: number }[];
  tags: { label: string; value: string }[];
}

const SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Highest Rated", value: "rating" },
];

const PRODUCT_TYPES = [
  { label: "Template", value: "TEMPLATE" },
  { label: "Software", value: "SOFTWARE" },
  { label: "Asset", value: "ASSET" },
  { label: "Course", value: "COURSE" },
  { label: "License", value: "LICENSE" },
];

const PRICE_RANGES = [
  { label: "Under $25", value: "0-25" },
  { label: "$25 – $50", value: "25-50" },
  { label: "$50 – $100", value: "50-100" },
  { label: "$100+", value: "100-" },
];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function get(key: string) {
    return searchParams.get(key) ?? "";
  }

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function toggle(key: string, value: string) {
    updateParams({ [key]: get(key) === value ? null : value });
  }

  const activeFilters: { key: string; label: string; value: string }[] = [];
  const sort = get("sort");
  const type = get("type");
  const category = get("category");
  const price = get("price");

  if (sort) {
    const opt = SORT_OPTIONS.find((o) => o.value === sort);
    if (opt) activeFilters.push({ key: "sort", label: `Sort: ${opt.label}`, value: sort });
  }
  if (type) {
    const opt = PRODUCT_TYPES.find((o) => o.value === type);
    if (opt) activeFilters.push({ key: "type", label: `Type: ${opt.label}`, value: type });
  }
  if (category) {
    const opt = categories.find((o) => o.value === category);
    if (opt) activeFilters.push({ key: "category", label: `Category: ${opt.label}`, value: category });
  }
  if (price) {
    const opt = PRICE_RANGES.find((o) => o.value === price);
    if (opt) activeFilters.push({ key: "price", label: `Price: ${opt.label}`, value: price });
  }

  function clearAll() {
    router.push("?", { scroll: false });
  }

  return (
    <div className="w-full">
      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Filters</span>
            <button onClick={clearAll} className="text-xs text-primary hover:underline">
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence>
              {activeFilters.map((f) => (
                <motion.button
                  key={f.key}
                  onClick={() => toggle(f.key, f.value)}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  {f.label}
                  <X className="h-3 w-3" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Sort By */}
      <FilterSection title="Sort By">
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggle("sort", opt.value)}
              className={cn(
                "w-full text-left text-sm px-2 py-1.5 rounded-sm transition-colors",
                sort === opt.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-accent"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Product Type */}
      <FilterSection title="Product Type">
        <div className="space-y-1">
          {PRODUCT_TYPES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggle("type", opt.value)}
              className={cn(
                "w-full text-left text-sm px-2 py-1.5 rounded-sm transition-colors",
                type === opt.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-accent"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      {categories.length > 0 && (
        <FilterSection title="Category">
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggle("category", cat.value)}
                className={cn(
                  "w-full text-left text-sm px-2 py-1.5 rounded-sm transition-colors flex items-center justify-between",
                  category === cat.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-accent"
                )}
              >
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span className="text-xs text-muted-foreground">{cat.count}</span>
                )}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-1">
          {PRICE_RANGES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggle("price", opt.value)}
              className={cn(
                "w-full text-left text-sm px-2 py-1.5 rounded-sm transition-colors",
                price === opt.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-accent"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

export { ProductFilters };

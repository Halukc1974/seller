"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import Image from "next/image";
import { X, Plus, Search } from "lucide-react";

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  images: string[];
  creatorName: string;
  sortOrder?: number;
}

interface Props {
  collectionId: string;
  currentProducts: ProductItem[];
  availableProducts: ProductItem[];
  initialProductIds: string[];
}

export function CollectionProductManager({
  collectionId,
  currentProducts,
  availableProducts,
  initialProductIds,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedIds, setSelectedIds] = useState<string[]>(initialProductIds);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedSet = new Set(selectedIds);

  const filteredAvailable = useMemo(() => {
    const q = search.toLowerCase().trim();
    return availableProducts.filter(
      (p) =>
        !selectedSet.has(p.id) &&
        (q === "" || p.title.toLowerCase().includes(q) || p.creatorName.toLowerCase().includes(q))
    );
  }, [availableProducts, selectedSet, search]);

  const selectedProducts = useMemo(
    () => selectedIds.map((id) => availableProducts.find((p) => p.id === id)).filter(Boolean) as ProductItem[],
    [selectedIds, availableProducts]
  );

  function addProduct(productId: string) {
    setSelectedIds((prev) => [...prev, productId]);
  }

  function removeProduct(productId: string) {
    setSelectedIds((prev) => prev.filter((id) => id !== productId));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/collections/${collectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Save failed", "error");
        return;
      }
      toast("Products saved", "success");
      router.refresh();
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Current products */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">
          In Collection ({selectedProducts.length})
        </h3>
        {selectedProducts.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No products yet. Add some from the list below.
          </div>
        ) : (
          <div className="space-y-1.5">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-md border border-border bg-card p-2"
              >
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{product.creatorName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="flex-shrink-0 p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Remove from collection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search & add products */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">Add Products</h3>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search published products…"
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1.5 rounded-md border border-border p-2">
          {filteredAvailable.length === 0 ? (
            <p className="text-center py-4 text-sm text-muted-foreground">
              {search ? "No products match your search." : "All published products are already in this collection."}
            </p>
          ) : (
            filteredAvailable.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors"
              >
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{product.creatorName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addProduct(product.id)}
                  className="flex-shrink-0 flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save Products"}
        </button>
        <span className="text-xs text-muted-foreground">
          {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
        </span>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface ProductActionsProps {
  productId: string;
  status: ProductStatus;
  featured: boolean;
}

export function ProductActions({ productId, status, featured }: ProductActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function update(payload: { status?: ProductStatus; featured?: boolean }) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to update product");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1 flex-wrap">
      {/* Approve: DRAFT → PUBLISHED */}
      {status === "DRAFT" && (
        <button
          onClick={() => update({ status: "PUBLISHED" })}
          disabled={loading}
          className="rounded-md bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50"
        >
          Approve
        </button>
      )}

      {/* Archive */}
      {status !== "ARCHIVED" && (
        <button
          onClick={() => update({ status: "ARCHIVED" })}
          disabled={loading}
          className="rounded-md bg-muted text-muted-foreground hover:bg-muted/80 px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50"
        >
          Archive
        </button>
      )}

      {/* Restore archived → DRAFT */}
      {status === "ARCHIVED" && (
        <button
          onClick={() => update({ status: "DRAFT" })}
          disabled={loading}
          className="rounded-md bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20 px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50"
        >
          Restore
        </button>
      )}

      {/* Feature toggle */}
      <button
        onClick={() => update({ featured: !featured })}
        disabled={loading}
        className={`rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
          featured
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        {featured ? "Unfeature" : "Feature"}
      </button>
    </div>
  );
}

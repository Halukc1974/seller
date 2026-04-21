"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ProductActionsProps {
  productId: string;
  productTitle: string;
}

export function ProductActions({ productId, productTitle }: ProductActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/creator/products/${productId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Delete failed");
      }
      toast("Product deleted", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/creator/products/${productId}/edit`}
        className="rounded p-1.5 hover:bg-accent transition-colors"
        aria-label={`Edit ${productTitle}`}
      >
        <Edit className="h-4 w-4 text-muted-foreground" />
      </Link>

      {showConfirm ? (
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded px-2 py-1 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors"
          >
            {deleting ? "..." : "Yes"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="rounded px-2 py-1 text-xs border border-border hover:bg-accent transition-colors"
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="rounded p-1.5 hover:bg-accent transition-colors"
          aria-label={`Delete ${productTitle}`}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </button>
      )}
    </div>
  );
}

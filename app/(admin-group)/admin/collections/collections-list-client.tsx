"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { CollectionForm } from "@/components/admin/collection-form";

interface Props {
  showCreateButton?: boolean;
  inline?: boolean;
  deleteId?: string;
  deleteTitle?: string;
}

export function CollectionsListClient({ showCreateButton, inline, deleteId, deleteTitle }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    if (!confirm(`Delete collection "${deleteTitle}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/collections/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error ?? "Delete failed", "error");
        return;
      }
      toast("Collection deleted", "success");
      router.refresh();
    } catch {
      toast("Network error", "error");
    } finally {
      setDeleting(false);
    }
  }

  // Delete button mode
  if (deleteId) {
    return (
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex h-7 items-center rounded-md border border-destructive/40 bg-background px-2.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
      >
        {deleting ? "…" : "Delete"}
      </button>
    );
  }

  // Create button mode
  if (showCreateButton) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={
            inline
              ? "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              : "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          }
        >
          New Collection
        </button>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl">
              <h2 className="text-lg font-semibold mb-4">New Collection</h2>
              <CollectionForm
                onSuccess={() => setShowModal(false)}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

interface CollectionFormProps {
  /** If provided, we're editing an existing collection */
  collection?: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    featured: boolean;
    sortOrder: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CollectionForm({ collection, onSuccess, onCancel }: CollectionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!collection;

  const [title, setTitle] = useState(collection?.title ?? "");
  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [description, setDescription] = useState(collection?.description ?? "");
  const [featured, setFeatured] = useState(collection?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(collection?.sortOrder ?? 0);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(isEditing);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      toast("Title and slug are required", "error");
      return;
    }

    setSaving(true);
    try {
      const url = isEditing
        ? `/api/admin/collections/${collection.id}`
        : "/api/admin/collections";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, featured, sortOrder }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Something went wrong", "error");
        return;
      }

      toast(isEditing ? "Collection updated" : "Collection created", "success");
      router.refresh();
      if (onSuccess) onSuccess();
      else if (!isEditing) {
        router.push(`/admin/collections/${data.id}`);
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g. Best Sellers"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Slug <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
          placeholder="best-sellers"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Public URL: /collections/{slug || "…"}
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Optional description shown on the collection page"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
        />
      </div>

      {/* Sort order */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Sort Order
        </label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <p className="mt-1 text-xs text-muted-foreground">Lower numbers appear first</p>
      </div>

      {/* Featured */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
        />
        <label htmlFor="featured" className="text-sm font-medium text-foreground cursor-pointer">
          Featured collection
        </label>
        <span className="text-xs text-muted-foreground">(shown on homepage)</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Collection"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

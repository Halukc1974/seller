"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Loader2 } from "lucide-react";

interface ReviewShape {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  helpful: number;
  createdAt: string;
  user: { id: string; email: string | null; name: string | null };
  product: { title: string; slug: string };
}

export function AdminReviewRow({ review }: { review: ReviewShape }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      setDeleted(true);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  if (deleted) return null;

  return (
    <li className="rounded-md border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600">
              <Star className="h-3 w-3 fill-current" /> {review.rating}
            </span>
            <Link
              href={`/products/${review.product.slug}`}
              className="truncate font-medium text-foreground hover:text-primary"
            >
              {review.product.title}
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link
              href={`/admin/users/${review.user.id}`}
              className="truncate hover:text-primary"
            >
              {review.user.name ?? review.user.email}
            </Link>
            <span className="ml-auto shrink-0">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          {review.title && (
            <p className="mt-2 text-sm font-medium">{review.title}</p>
          )}
          {review.body && (
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {review.body}
            </p>
          )}
          {review.helpful > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {review.helpful} people found this helpful
            </p>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={loading}
          aria-label="Delete review"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        </button>
      </div>
    </li>
  );
}

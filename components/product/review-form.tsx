"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  productId: string;
  existingReview?: {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
  };
}

export function ReviewForm({ productId, existingReview }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title: title || null, body: body || null }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || "Failed to submit review.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-border bg-card p-5 flex flex-col gap-4"
    >
      <h3 className="text-sm font-semibold text-foreground">
        {isEditing ? "Update Your Review" : "Write a Review"}
      </h3>

      {/* Star selector */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            className="rounded transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                (hoverRating || rating) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-none text-muted-foreground"
              )}
            />
          </button>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">
          {rating > 0
            ? ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]
            : "Select a rating"}
        </span>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label htmlFor="review-title" className="text-xs font-medium text-foreground">
          Title <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={120}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1">
        <label htmlFor="review-body" className="text-xs font-medium text-foreground">
          Review <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell others what you think about this product..."
          rows={4}
          maxLength={2000}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="self-start inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : isEditing ? "Update Review" : "Submit Review"}
      </button>
    </form>
  );
}

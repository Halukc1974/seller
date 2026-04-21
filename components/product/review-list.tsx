"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  helpful: number;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ReviewListProps {
  reviews: Review[];
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3.5 w-3.5",
            star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}

function HelpfulButton({ reviewId, initialCount }: { reviewId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleHelpful() {
    if (voted || pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/reviews/helpful", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.helpful);
        setVoted(true);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleHelpful}
      disabled={voted || pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors",
        voted
          ? "bg-primary/10 text-primary cursor-default"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
      )}
    >
      <ThumbsUp className="h-3.5 w-3.5" />
      Helpful ({count})
    </button>
  );
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-md border border-border bg-card p-5">
          <div className="mb-3 flex items-start gap-3">
            {/* Avatar */}
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground overflow-hidden">
              {review.user.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.name ?? "Reviewer"}
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
              ) : (
                (review.user.name ?? "U").charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {review.user.name ?? "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(new Date(review.createdAt))}
                </span>
              </div>
              <div className="mt-1">
                <StarDisplay rating={review.rating} />
              </div>
            </div>
          </div>

          {review.title && (
            <p className="mb-1 text-sm font-semibold text-foreground">{review.title}</p>
          )}
          {review.body && (
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">{review.body}</p>
          )}

          <HelpfulButton reviewId={review.id} initialCount={review.helpful} />
        </div>
      ))}
    </div>
  );
}

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: "sm" | "md";
}

function RatingStars({ rating, count, size = "sm" }: RatingStarsProps) {
  const numRating = typeof rating === "string" ? parseFloat(rating) : rating;
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "fill-current",
              size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5",
              star <= Math.round(numRating) ? "text-warning" : "text-muted/30"
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>({count})</span>
      )}
    </div>
  );
}
export { RatingStars };

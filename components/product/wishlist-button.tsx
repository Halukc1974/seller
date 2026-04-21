"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
  className?: string;
  /** When true, renders as a round icon-only button (for cards) */
  iconOnly?: boolean;
}

export function WishlistButton({
  productId,
  initialWishlisted = false,
  className,
  iconOnly = false,
}: WishlistButtonProps) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (pending) return;

    // Optimistic update
    const next = !wishlisted;
    setWishlisted(next);
    setPending(true);

    try {
      const res = await fetch("/api/wishlist", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        // Revert and redirect to login
        setWishlisted(!next);
        router.push("/login");
        return;
      }

      if (!res.ok) {
        // Revert on any other error
        setWishlisted(!next);
      }
    } catch {
      // Revert on network error
      setWishlisted(!next);
    } finally {
      setPending(false);
    }
  }

  if (iconOnly) {
    return (
      <button
        onClick={toggle}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md hover:bg-white transition-colors",
          className
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={wishlisted ? "filled" : "empty"}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center justify-center"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                wishlisted ? "fill-red-500 text-red-500" : "text-foreground"
              )}
            />
          </motion.span>
        </AnimatePresence>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={wishlisted ? "filled" : "empty"}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center gap-2"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              wishlisted ? "fill-red-500 text-red-500" : ""
            )}
          />
          {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

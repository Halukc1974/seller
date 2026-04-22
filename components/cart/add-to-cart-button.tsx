"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useCart, type CartLine } from "@/stores/cart";
import { cn } from "@/lib/utils";

interface Props {
  line: Omit<CartLine, "quantity">;
  variant?: "full" | "icon";
  onAddedRedirect?: "cart" | "none";
}

export function AddToCartButton({ line, variant = "full", onAddedRedirect = "none" }: Props) {
  const router = useRouter();
  const { status } = useSession();
  const addItem = useCart((s) => s.addItem);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      addItem(line, 1);
      if (status === "authenticated") {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: line.productId, quantity: 1 }),
        });
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
      if (onAddedRedirect === "cart") router.push("/cart");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleAdd}
        disabled={loading}
        aria-label="Add to cart"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md hover:bg-white transition-colors disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : added ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors",
        "hover:bg-primary/90 disabled:opacity-60",
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : added ? (
        <>
          <Check className="h-4 w-4" /> Added to cart
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" /> Add to cart
        </>
      )}
    </button>
  );
}

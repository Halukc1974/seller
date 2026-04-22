"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const { status } = useSession();
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const removeItem = useCart((s) => s.removeItem);
  const setQuantity = useCart((s) => s.setQuantity);

  if (!hydrated) {
    return (
      <div className="rounded-md border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-border bg-card p-12 text-center">
        <ShoppingCart className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <h2 className="text-lg font-semibold">Your cart is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse our catalog and add items to get started.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function handleRemove(productId: string) {
    removeItem(productId);
    if (status === "authenticated") {
      await fetch(`/api/cart/${productId}`, { method: "DELETE" });
    }
  }

  async function handleQuantity(productId: string, quantity: number) {
    setQuantity(productId, quantity);
    if (status === "authenticated") {
      await fetch(`/api/cart/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      {/* Items */}
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex items-center gap-4 rounded-md border border-border bg-card p-3"
          >
            <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-muted">
              {item.image ? (
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${item.slug}`}
                className="block truncate text-sm font-medium text-foreground hover:text-primary"
              >
                {item.title}
              </Link>
              {item.creatorName && (
                <p className="truncate text-xs text-muted-foreground">by {item.creatorName}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleQuantity(item.productId, Math.max(1, Number(e.target.value) || 1))}
                  className="h-7 w-16 rounded-sm border border-border bg-background px-2 text-xs"
                />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-mono text-sm font-semibold">
                {formatPrice(item.price * item.quantity)}
              </span>
              <button
                onClick={() => handleRemove(item.productId)}
                aria-label="Remove"
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Summary */}
      <aside className="h-fit rounded-md border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Order summary</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Taxes and fees are calculated at checkout.
        </p>
        <Link
          href="/checkout"
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Proceed to checkout
        </Link>
        <Link
          href="/products"
          className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-border text-sm font-medium text-foreground hover:bg-accent h-10"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}

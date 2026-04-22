"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/stores/cart";

export function CartIcon() {
  const { data: session, status } = useSession();
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const replaceAll = useCart((s) => s.replaceAll);
  const [mergedForUser, setMergedForUser] = useState<string | null>(null);

  // After login: merge guest cart into DB, then refetch as source of truth.
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || !hydrated) return;
    if (mergedForUser === session.user.id) return;

    const guestItems = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));

    (async () => {
      try {
        if (guestItems.length > 0) {
          await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: guestItems }),
          });
        }
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = (await res.json()) as {
            items: Array<{
              productId: string;
              quantity: number;
              product: {
                id: string;
                slug: string;
                title: string;
                price: string;
                currency: string;
                images: string[];
                creator: { storeName: string } | null;
              };
            }>;
          };
          replaceAll(
            data.items.map((i) => ({
              productId: i.productId,
              slug: i.product.slug,
              title: i.product.title,
              price: Number(i.product.price),
              currency: i.product.currency,
              image: i.product.images[0] ?? null,
              creatorName: i.product.creator?.storeName ?? null,
              quantity: i.quantity,
            })),
          );
        }
        setMergedForUser(session.user.id!);
      } catch {
        // ignore; cart will sync next interaction
      }
    })();
  }, [status, session?.user?.id, hydrated, items, mergedForUser, replaceAll]);

  const count = hydrated ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <Link
      href="/cart"
      aria-label={`Cart (${count} items)`}
      className="relative flex h-9 w-9 items-center justify-center rounded-sm hover:bg-accent transition-colors"
    >
      <ShoppingCart className="h-4.5 w-4.5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";

declare global {
  interface Window {
    Paddle?: {
      Initialize: (options: { token: string }) => void;
      Checkout: {
        open: (options: {
          transactionId?: string;
          items?: Array<{ priceId: string; quantity: number }>;
          customData?: Record<string, string>;
          settings?: Record<string, unknown>;
        }) => void;
      };
    };
  }
}

function loadPaddleScript(clientToken: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Paddle) {
      window.Paddle.Initialize({ token: clientToken });
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      window.Paddle?.Initialize({ token: clientToken });
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function CheckoutView() {
  const router = useRouter();
  const { status } = useSession();
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const clear = useCart((s) => s.clear);

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  useEffect(() => {
    if (hydrated && items.length === 0 && !loading) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, loading, router]);

  async function handlePurchase() {
    if (!accepted || loading) return;
    setLoading(true);
    setError(null);

    if (status === "unauthenticated") {
      router.push("/login?next=/checkout");
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepted: true }),
      });

      if (res.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }

      const data = (await res.json()) as
        | { mode: "paddle"; transactionId: string; customData: Record<string, string> }
        | { mode: "demo"; purchaseIds: string[] }
        | { error: string };

      if ("error" in data) {
        throw new Error(data.error);
      }

      if (data.mode === "demo") {
        clear();
        router.push("/checkout/success");
        return;
      }

      if (!clientToken) {
        throw new Error("Payment is not configured. Set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN.");
      }

      await loadPaddleScript(clientToken);
      window.Paddle?.Checkout.open({
        transactionId: data.transactionId,
        customData: data.customData,
        settings: {
          successUrl: `${window.location.origin}/checkout/success`,
        },
      });
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
      <section className="flex flex-col gap-6">
        {/* Order review */}
        <div className="rounded-md border border-border bg-card">
          <header className="border-b border-border px-5 py-3 text-sm font-semibold">
            Order review
          </header>
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  {item.creatorName && (
                    <p className="truncate text-xs text-muted-foreground">by {item.creatorName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <span className="font-mono text-sm">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal acceptance */}
        <div className="rounded-md border border-border bg-card p-5">
          <div className="mb-3 flex items-start gap-2 rounded-sm bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">
              All items in this order are <strong>digital products</strong>{" "}
              delivered as instant downloads. Once a file is downloaded, the
              sale is final and <strong>no refunds will be issued</strong>.
            </p>
          </div>
          <label className="flex items-start gap-3 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            <span className="leading-relaxed">
              I have read and agree to the{" "}
              <Link href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </Link>
              ,{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/refund-policy" className="underline hover:text-foreground">
                Refund Policy
              </Link>
              . I understand that digital products are non-refundable once
              downloaded and I expressly consent to the start of immediate
              performance, waiving any statutory right of withdrawal that may
              otherwise apply.
            </span>
          </label>
        </div>
      </section>

      {/* Summary */}
      <aside className="h-fit rounded-md border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Summary</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Taxes</span>
          <span>Calculated at payment</span>
        </div>
        <button
          onClick={handlePurchase}
          disabled={!accepted || loading || items.length === 0}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            `Complete purchase · ${formatPrice(subtotal)}`
          )}
        </button>
        {error && (
          <p className="mt-3 text-xs text-destructive">{error}</p>
        )}
        {!accepted && (
          <p className="mt-3 text-xs text-muted-foreground">
            You must accept the policies above to complete your purchase.
          </p>
        )}
      </aside>
    </div>
  );
}

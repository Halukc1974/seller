"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaddleCheckoutProps {
  productId: string;
  productTitle: string;
  price: string;
}

declare global {
  interface Window {
    Paddle?: {
      Initialize: (options: { token: string }) => void;
      Checkout: {
        open: (options: {
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

export function PaddleCheckout({
  productId,
  productTitle,
  price,
}: PaddleCheckoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  async function handleBuyNow() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Checkout failed");
      }

      const data = await res.json() as {
        product: { id: string; title: string; price: string; currency: string };
        customData: { userId: string; productId: string };
      };

      if (clientToken) {
        // Real Paddle overlay checkout
        await loadPaddleScript(clientToken);

        window.Paddle?.Checkout.open({
          customData: data.customData,
          settings: {
            successUrl: `${window.location.origin}/checkout/success`,
          },
        });
      } else {
        // Demo purchase mode — create purchase directly for testing
        const demoRes = await fetch("/api/checkout/demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (demoRes.ok) {
          router.push("/checkout/success");
        } else {
          throw new Error("Demo purchase failed");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleBuyNow}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ShoppingCart className="h-5 w-5" />
        )}
        {loading ? "Processing…" : `Buy Now — ${price}`}
      </Button>

      {!clientToken && (
        <p className="text-center text-xs text-muted-foreground">
          Demo mode — no Paddle credentials configured
        </p>
      )}

      {error && (
        <p className="text-center text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

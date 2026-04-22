"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "seller-cookie-consent";
type ConsentValue = "essential" | "all";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage unavailable (SSR/sandbox) — do nothing
    }
  }, []);

  function persist(value: ConsentValue) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ value, timestamp: Date.now() }),
      );
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[60] pointer-events-none px-4 pb-4 md:pb-6"
    >
      <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-4 rounded-lg border border-border bg-background/95 p-4 shadow-lg backdrop-blur md:flex-row md:items-center md:p-5">
        <button
          onClick={() => persist("essential")}
          aria-label="Dismiss and keep essential cookies only"
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground md:hidden"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p id="cookie-consent-title" className="text-sm font-medium text-foreground">
            We use cookies
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Essential cookies keep you signed in and remember your cart.
            Optional analytics cookies help us understand how the site is used.
            Read our{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              privacy policy
            </Link>{" "}
            for details.
          </p>
        </div>
        <div className="flex flex-col-reverse items-stretch gap-2 md:flex-row md:items-center">
          <button
            onClick={() => persist("essential")}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground hover:bg-accent"
          >
            Essential only
          </button>
          <button
            onClick={() => persist("all")}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

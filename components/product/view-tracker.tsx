"use client";

import { useEffect, useRef } from "react";

interface ViewTrackerProps {
  productId: string;
}

/**
 * Fires a single VIEW event on mount.
 * Must be rendered inside the product detail page (client boundary).
 */
export function ViewTracker({ productId }: ViewTrackerProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "VIEW", productId }),
    }).catch(() => {
      // best-effort — never throw on analytics
    });
  }, [productId]);

  return null;
}

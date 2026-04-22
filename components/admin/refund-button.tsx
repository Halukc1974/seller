"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Undo2 } from "lucide-react";

interface Props {
  purchaseId: string;
  disabled?: boolean;
}

export function RefundButton({ purchaseId, disabled }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (disabled || loading) return;
    if (!confirm("Mark this order as refunded? This cannot be undone from the UI.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/purchases/${purchaseId}/refund`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo2 className="h-3 w-3" />}
      Refund
    </button>
  );
}

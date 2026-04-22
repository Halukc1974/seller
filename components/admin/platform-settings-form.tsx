"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Initial {
  creatorRevenueShare: number;
  allowNewCreators: boolean;
  allowNewPurchases: boolean;
  maintenanceMessage: string;
}

export function PlatformSettingsForm({ initial }: { initial: Initial }) {
  const [share, setShare] = useState(initial.creatorRevenueShare);
  const [allowCreators, setAllowCreators] = useState(initial.allowNewCreators);
  const [allowPurchases, setAllowPurchases] = useState(initial.allowNewPurchases);
  const [message, setMessage] = useState(initial.maintenanceMessage);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorRevenueShare: share,
          allowNewCreators: allowCreators,
          allowNewPurchases: allowPurchases,
          maintenanceMessage: message.trim() === "" ? null : message,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("Saved");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-6 rounded-md border border-border bg-card p-6"
    >
      <div>
        <label className="block text-sm font-medium">Creator revenue share</label>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={share}
            onChange={(e) => setShare(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-16 text-right font-mono text-sm">
            {Math.round(share * 100)}%
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Creator keeps {Math.round(share * 100)}%, platform keeps{" "}
          {Math.round((1 - share) * 100)}%. Applies to new completed sales only.
        </p>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={allowCreators}
            onChange={(e) => setAllowCreators(e.target.checked)}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            <span className="font-medium">Allow new creators</span>
            <span className="block text-xs text-muted-foreground">
              When off, the /become-creator registration is temporarily
              disabled.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={allowPurchases}
            onChange={(e) => setAllowPurchases(e.target.checked)}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            <span className="font-medium">Allow new purchases</span>
            <span className="block text-xs text-muted-foreground">
              Emergency kill switch — rejects new checkouts across the site.
            </span>
          </span>
        </label>
      </div>

      <div className="border-t border-border pt-4">
        <label className="block text-sm font-medium">Maintenance message</label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional banner shown at the top of the storefront."
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        {status && (
          <span className="text-xs text-muted-foreground">{status}</span>
        )}
        <button
          type="submit"
          disabled={loading}
          className="ml-auto inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          Save settings
        </button>
      </div>
    </form>
  );
}

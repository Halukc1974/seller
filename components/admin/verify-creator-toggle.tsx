"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2 } from "lucide-react";

interface Props {
  userId: string;
  verified: boolean;
}

export function VerifyCreatorToggle({ userId, verified }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(verified);

  async function handleClick() {
    if (loading) return;
    const next = !value;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify-creator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: next }),
      });
      if (!res.ok) throw new Error(await res.text());
      setValue(next);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        value
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-accent"
      }`}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <BadgeCheck className="h-3 w-3" />
      )}
      {value ? "Verified" : "Verify"}
    </button>
  );
}

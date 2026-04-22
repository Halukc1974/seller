"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BadgeCheck, AlertOctagon, Undo2 } from "lucide-react";

interface Props {
  creatorId: string;
  verified: boolean;
  suspended: boolean;
}

export function CreatorAdminActions({
  creatorId,
  verified,
  suspended,
}: Props) {
  const router = useRouter();
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);

  async function handleVerify() {
    setVerifyLoading(true);
    try {
      const res = await fetch(`/api/admin/users/by-creator/${creatorId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !verified }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Verify failed");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleSuspend() {
    const nextValue = !suspended;
    const reason = nextValue ? prompt("Optional suspension reason (shown in audit log)?") ?? null : null;
    if (nextValue && !confirm("Suspend creator? Their published products will be archived.")) return;
    setSuspendLoading(true);
    try {
      const res = await fetch(`/api/admin/creators/${creatorId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: nextValue, reason }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Suspend failed");
    } finally {
      setSuspendLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleVerify}
        disabled={verifyLoading}
        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
          verified
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:bg-accent"
        }`}
      >
        {verifyLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <BadgeCheck className="h-3 w-3" />
        )}
        {verified ? "Verified" : "Verify"}
      </button>
      <button
        onClick={handleSuspend}
        disabled={suspendLoading}
        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
          suspended
            ? "border-border text-muted-foreground hover:bg-accent"
            : "border-orange-500/40 bg-orange-500/5 text-orange-700 hover:bg-orange-500/10 dark:text-orange-300"
        }`}
      >
        {suspendLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : suspended ? (
          <Undo2 className="h-3 w-3" />
        ) : (
          <AlertOctagon className="h-3 w-3" />
        )}
        {suspended ? "Unsuspend" : "Suspend"}
      </button>
    </div>
  );
}

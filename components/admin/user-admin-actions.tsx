"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ban, Undo2 } from "lucide-react";

interface Props {
  userId: string;
  currentRole: "BUYER" | "CREATOR" | "ADMIN";
  status: "ACTIVE" | "BANNED";
  isSuperAdminTarget: boolean;
  canManageAdmins: boolean;
}

export function UserAdminActions({
  userId,
  currentRole,
  status,
  isSuperAdminTarget,
  canManageAdmins,
}: Props) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [banning, setBanning] = useState(false);

  async function handleRoleChange(next: typeof role) {
    if (next === role) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Update failed");
      }
      setRole(next);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleBanToggle() {
    if (isSuperAdminTarget) return;
    const nextStatus = status === "BANNED" ? "ACTIVE" : "BANNED";
    const reason =
      nextStatus === "BANNED"
        ? prompt("Optional reason (internal)?") ?? null
        : null;
    if (nextStatus === "BANNED" && !confirm("Ban this user? All sessions will be terminated.")) {
      return;
    }
    setBanning(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Update failed");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBanning(false);
    }
  }

  if (isSuperAdminTarget) {
    return (
      <div className="text-xs text-muted-foreground">
        Super-admin — immutable from the UI
      </div>
    );
  }

  const options: typeof role[] = canManageAdmins
    ? ["BUYER", "CREATOR", "ADMIN"]
    : role === "ADMIN"
      ? ["ADMIN"]
      : ["BUYER", "CREATOR"];

  return (
    <div className="flex flex-col items-end gap-2">
      <select
        value={role}
        disabled={loading || options.length === 1}
        onChange={(e) => handleRoleChange(e.target.value as typeof role)}
        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
      >
        {options.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <button
        onClick={handleBanToggle}
        disabled={banning}
        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
          status === "BANNED"
            ? "border-border text-muted-foreground hover:bg-accent"
            : "border-red-500/40 bg-red-500/5 text-red-700 hover:bg-red-500/10 dark:text-red-400"
        }`}
      >
        {banning ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : status === "BANNED" ? (
          <Undo2 className="h-3 w-3" />
        ) : (
          <Ban className="h-3 w-3" />
        )}
        {status === "BANNED" ? "Unban user" : "Ban user"}
      </button>
    </div>
  );
}

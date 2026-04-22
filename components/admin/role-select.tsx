"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = ["BUYER", "CREATOR", "ADMIN"] as const;
type Role = (typeof ROLES)[number];

interface RoleSelectProps {
  userId: string;
  currentRole: Role;
}

export function RoleSelect({ userId, currentRole }: RoleSelectProps) {
  const [role, setRole] = useState<Role>(currentRole);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(newRole: Role) {
    if (newRole === role) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setRole(newRole);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to update role");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value as Role)}
      disabled={loading}
      className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}

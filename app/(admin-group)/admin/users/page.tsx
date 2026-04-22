import Link from "next/link";
import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { RoleSelect } from "@/components/admin/role-select";
import { VerifyCreatorToggle } from "@/components/admin/verify-creator-toggle";

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-600 dark:text-red-400",
  CREATOR: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  BUYER: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      creatorProfile: { select: { verified: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {users.length} {users.length === 1 ? "user" : "users"} registered
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                Role
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                Joined
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                {/* Avatar + name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name ?? ""}
                        className="h-8 w-8 rounded-full object-cover shrink-0 border border-border"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                        {((user.name ?? user.email ?? "?")[0]).toUpperCase()}
                      </div>
                    )}
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-medium truncate max-w-[150px] hover:text-primary"
                    >
                      {user.name ?? "—"}
                    </Link>
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground truncate max-w-[200px]">
                  {user.email}
                </td>

                {/* Role badge */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[user.role] ?? ""}`}
                  >
                    {user.role}
                  </span>
                </td>

                {/* Joined */}
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    {user.creatorProfile && (
                      <VerifyCreatorToggle
                        userId={user.id}
                        verified={user.creatorProfile.verified}
                      />
                    )}
                    <RoleSelect userId={user.id} currentRole={user.role} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

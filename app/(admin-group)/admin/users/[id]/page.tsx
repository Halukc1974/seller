import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { isSuperAdminEmail } from "@/lib/admin";
import { UserAdminActions } from "@/components/admin/user-admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      creatorProfile: { select: { id: true, slug: true, storeName: true, verified: true, suspended: true } },
      purchases: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { product: { select: { title: true, slug: true } } },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { product: { select: { title: true, slug: true } } },
      },
    },
  });

  if (!user) notFound();

  const completedPurchases = user.purchases.filter((p) => p.status === "COMPLETED");
  const lifetimeValue = completedPurchases.reduce((sum, p) => sum + Number(p.amount), 0);

  const actorIsSuperAdmin = isSuperAdminEmail(session.user.email);
  const targetIsSuperAdmin = isSuperAdminEmail(user.email);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to users
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
            {((user.name ?? user.email ?? "?")[0]).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.name ?? "—"}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{user.role}</span>
              {user.status === "BANNED" && (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-600">
                  Banned
                </span>
              )}
              {targetIsSuperAdmin && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600">
                  Super-admin
                </span>
              )}
              {user.creatorProfile?.verified && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  Verified creator
                </span>
              )}
              {user.creatorProfile?.suspended && (
                <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-600">
                  Creator suspended
                </span>
              )}
            </div>
          </div>
        </div>

        <UserAdminActions
          userId={user.id}
          currentRole={user.role}
          status={user.status}
          isSuperAdminTarget={targetIsSuperAdmin}
          canManageAdmins={actorIsSuperAdmin}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat label="Lifetime value" value={formatPrice(lifetimeValue)} />
        <MiniStat label="Completed orders" value={completedPurchases.length.toString()} />
        <MiniStat label="Reviews posted" value={user.reviews.length.toString()} />
        <MiniStat
          label="Joined"
          value={user.createdAt.toLocaleDateString()}
        />
      </div>

      {user.bannedReason && (
        <div className="rounded-md border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-300">
          <strong>Ban reason:</strong> {user.bannedReason}
          {user.bannedAt && (
            <span className="ml-2 text-xs opacity-80">
              ({user.bannedAt.toLocaleString()})
            </span>
          )}
        </div>
      )}

      {user.creatorProfile && (
        <div className="rounded-md border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Creator profile</h2>
          <p className="mt-1 text-sm">
            <Link
              href={`/admin/creators/${user.creatorProfile.id}`}
              className="text-primary hover:underline"
            >
              {user.creatorProfile.storeName}
            </Link>{" "}
            <span className="text-xs text-muted-foreground">
              /creators/{user.creatorProfile.slug}
            </span>
          </p>
        </div>
      )}

      <div className="rounded-md border border-border bg-card">
        <header className="border-b border-border px-4 py-3 text-sm font-semibold">
          Recent purchases
        </header>
        {user.purchases.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No purchases yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Product</th>
                <th className="px-4 py-2 font-medium text-right">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {user.purchases.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-none">
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {p.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/admin/orders/${p.id}`} className="hover:text-primary">
                      {p.product.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {formatPrice(Number(p.amount))}
                  </td>
                  <td className="px-4 py-2 text-xs">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-md border border-border bg-card">
        <header className="border-b border-border px-4 py-3 text-sm font-semibold">
          Recent reviews
        </header>
        {user.reviews.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No reviews.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {user.reviews.map((r) => (
              <li key={r.id} className="px-4 py-3 text-sm">
                <Link
                  href={`/products/${r.product.slug}`}
                  className="font-medium hover:text-primary"
                >
                  {r.product.title}
                </Link>
                <span className="ml-2 text-xs text-muted-foreground">
                  {r.rating}★ · {r.createdAt.toLocaleDateString()}
                </span>
                {r.body && (
                  <p className="mt-1 line-clamp-2 text-muted-foreground">{r.body}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold">{value}</p>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, AlertOctagon } from "lucide-react";
import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { getPlatformSettings } from "@/lib/admin";
import { CreatorAdminActions } from "@/components/admin/creator-admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminCreatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const profile = await db.creatorProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, status: true } },
      products: {
        orderBy: { totalSales: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          totalSales: true,
          price: true,
        },
      },
      acceptances: {
        orderBy: { acceptedAt: "asc" },
      },
    },
  });

  if (!profile) notFound();

  const [settings, salesAgg, recentPurchases] = await Promise.all([
    getPlatformSettings(),
    db.purchase.aggregate({
      _sum: { amount: true },
      _count: { _all: true },
      where: {
        product: { creatorId: id },
        status: "COMPLETED",
      },
    }),
    db.purchase.findMany({
      where: { product: { creatorId: id } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        product: { select: { title: true, slug: true } },
        user: { select: { email: true } },
      },
    }),
  ]);

  const share = Number(settings.creatorRevenueShare);
  const grossRevenue = Number(salesAgg._sum.amount ?? 0);
  const creatorPayoutDue = grossRevenue * share;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/creators"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to creators
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{profile.storeName}</h1>
          <p className="text-sm text-muted-foreground">
            <Link
              href={`/admin/users/${profile.userId}`}
              className="hover:text-primary"
            >
              {profile.user.email}
            </Link>{" "}
            · <span className="font-mono">/creators/{profile.slug}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            )}
            {profile.suspended && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-600">
                <AlertOctagon className="h-3 w-3" /> Suspended
              </span>
            )}
            {profile.user.status === "BANNED" && (
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-600">
                Owner banned
              </span>
            )}
          </div>
        </div>

        <CreatorAdminActions
          creatorId={profile.id}
          verified={profile.verified}
          suspended={profile.suspended}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat label="Products" value={profile.products.length.toString()} />
        <MiniStat label="Completed sales" value={salesAgg._count._all.toString()} />
        <MiniStat label="Gross revenue" value={formatPrice(grossRevenue)} />
        <MiniStat
          label={`Creator share (${Math.round(share * 100)}%)`}
          value={formatPrice(creatorPayoutDue)}
        />
      </div>

      {profile.suspendedReason && (
        <div className="rounded-md border border-orange-500/40 bg-orange-500/5 p-4 text-sm text-orange-800 dark:text-orange-200">
          <strong>Suspension reason:</strong> {profile.suspendedReason}
          {profile.suspendedAt && (
            <span className="ml-2 text-xs opacity-80">
              ({profile.suspendedAt.toLocaleString()})
            </span>
          )}
        </div>
      )}

      {/* Legal acceptances audit */}
      <div className="rounded-md border border-border bg-card">
        <header className="border-b border-border px-4 py-3 text-sm font-semibold">
          Legal acceptances
        </header>
        {profile.acceptances.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No records (pre-audit creator).
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Document</th>
                <th className="px-4 py-2 font-medium">Version</th>
                <th className="px-4 py-2 font-medium">When</th>
                <th className="px-4 py-2 font-medium">IP</th>
                <th className="px-4 py-2 font-medium">User agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profile.acceptances.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2 text-xs font-mono">{a.documentKey}</td>
                  <td className="px-4 py-2 text-xs">{a.documentVersion}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {a.acceptedAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-xs font-mono">{a.ipAddress ?? "—"}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground truncate max-w-[280px]">
                    {a.userAgent ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-md border border-border bg-card">
        <header className="border-b border-border px-4 py-3 text-sm font-semibold">
          Products
        </header>
        {profile.products.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            None
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {profile.products.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/products/${p.slug}`}
                    className="truncate text-sm font-medium hover:text-primary"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {p.status} · {p.totalSales} sold · {formatPrice(Number(p.price))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-border bg-card">
        <header className="border-b border-border px-4 py-3 text-sm font-semibold">
          Recent sales
        </header>
        {recentPurchases.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            None
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Product</th>
                <th className="px-4 py-2 font-medium">Buyer</th>
                <th className="px-4 py-2 font-medium text-right">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentPurchases.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {p.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/admin/orders/${p.id}`} className="hover:text-primary">
                      {p.product.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {p.user.email}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs">
                    {formatPrice(Number(p.amount))}
                  </td>
                  <td className="px-4 py-2 text-xs">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

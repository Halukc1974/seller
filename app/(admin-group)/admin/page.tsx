import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { loadDashboardMetrics } from "@/lib/admin-metrics";
import { DashboardChart } from "@/components/admin/dashboard-chart";

export const dynamic = "force-dynamic";

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) {
    return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">—</span>;
  }
  const up = pct > 0;
  const flat = pct === 0;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  const color = flat
    ? "text-muted-foreground"
    : up
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const metrics = await loadDashboardMetrics();

  const [recentPurchases, recentUsers, topProducts] = await Promise.all([
    db.purchase.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { title: true, slug: true } },
      },
    }),
    db.user.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    }),
    db.product.findMany({
      take: 6,
      orderBy: { totalSales: "desc" },
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        totalSales: true,
        price: true,
        creator: { select: { storeName: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marketplace overview. Today: {metrics.kpis.today.orders} order
          {metrics.kpis.today.orders === 1 ? "" : "s"},{" "}
          {formatPrice(metrics.kpis.today.revenue)} revenue.
        </p>
      </div>

      {/* Period KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label={metrics.kpis.revenue7d.label}
          value={formatPrice(metrics.kpis.revenue7d.value)}
          previous={`vs ${formatPrice(metrics.kpis.revenue7d.previous)}`}
          delta={metrics.kpis.revenue7d.deltaPct}
        />
        <KpiCard
          label={metrics.kpis.orders7d.label}
          value={metrics.kpis.orders7d.value.toLocaleString()}
          previous={`vs ${metrics.kpis.orders7d.previous}`}
          delta={metrics.kpis.orders7d.deltaPct}
        />
        <KpiCard
          label={metrics.kpis.revenue30d.label}
          value={formatPrice(metrics.kpis.revenue30d.value)}
          previous={`vs ${formatPrice(metrics.kpis.revenue30d.previous)}`}
          delta={metrics.kpis.revenue30d.deltaPct}
        />
        <KpiCard
          label={metrics.kpis.orders30d.label}
          value={metrics.kpis.orders30d.value.toLocaleString()}
          previous={`vs ${metrics.kpis.orders30d.previous}`}
          delta={metrics.kpis.orders30d.deltaPct}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniCard label="AOV (30d)" value={formatPrice(metrics.kpis.aov30d)} />
        <MiniCard
          label="Refund rate (30d)"
          value={`${metrics.kpis.refundRate30d.toFixed(1)}%`}
        />
        <MiniCard
          label="Active creators"
          value={metrics.totals.activeCreators.toLocaleString()}
        />
        <MiniCard
          label="Active buyers (30d)"
          value={metrics.totals.activeBuyers30.toLocaleString()}
        />
      </div>

      {/* Chart */}
      <div className="rounded-md border border-border bg-card p-5">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Revenue — last 30 days</h2>
          <Link
            href="/admin/analytics"
            className="text-xs text-primary hover:underline"
          >
            View analytics →
          </Link>
        </header>
        <DashboardChart data={metrics.timeSeries} />
      </div>

      {/* Lifetime totals strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniCard
          label="Total users"
          value={metrics.totals.totalUsers.toLocaleString()}
        />
        <MiniCard
          label="Total products"
          value={metrics.totals.totalProducts.toLocaleString()}
        />
        <MiniCard
          label="Total completed orders"
          value={metrics.totals.totalOrders.toLocaleString()}
        />
        <MiniCard
          label="Total revenue"
          value={formatPrice(metrics.totals.totalRevenue)}
        />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ListCard title="Recent orders" viewAllHref="/admin/orders">
          {recentPurchases.map((p) => (
            <Link
              key={p.id}
              href={`/admin/orders/${p.id}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/40"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.product.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.user.name ?? p.user.email}
                </p>
              </div>
              <span className="shrink-0 font-mono text-sm">
                {formatPrice(Number(p.amount))}
              </span>
            </Link>
          ))}
        </ListCard>

        <ListCard title="New users" viewAllHref="/admin/users">
          {recentUsers.map((u) => (
            <Link
              key={u.id}
              href={`/admin/users/${u.id}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {((u.name ?? u.email ?? "?")[0]).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.name ?? u.email}</p>
                <p className="text-xs text-muted-foreground">{u.role}</p>
              </div>
              {u.status === "BANNED" && (
                <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-600">
                  Banned
                </span>
              )}
            </Link>
          ))}
        </ListCard>

        <ListCard title="Top products" viewAllHref="/admin/products">
          {topProducts.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/40"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.creator.storeName}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {p.totalSales} sold
              </span>
            </Link>
          ))}
        </ListCard>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  previous,
  delta,
}: {
  label: string;
  value: string;
  previous: string;
  delta: number | null;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold">{value}</p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{previous}</span>
        <Delta pct={delta} />
      </div>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold">{value}</p>
    </div>
  );
}

function ListCard({
  title,
  viewAllHref,
  children,
}: {
  title: string;
  viewAllHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link href={viewAllHref} className="text-xs text-primary hover:underline">
          View all →
        </Link>
      </header>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

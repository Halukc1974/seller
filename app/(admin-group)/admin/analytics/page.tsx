import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [timeSeries, typeBreakdown, topProducts, topCreators, funnel30d] = await Promise.all([
    db.$queryRawUnsafe<Array<{ day: Date; revenue: string | null; orders: bigint }>>(
      `SELECT date_trunc('day', "createdAt")::date as day,
              SUM("amount")::text                 as revenue,
              COUNT(*)::bigint                    as orders
         FROM "Purchase"
        WHERE "status" = 'COMPLETED'
          AND "createdAt" >= NOW() - INTERVAL '90 days'
        GROUP BY day
        ORDER BY day ASC`,
    ),
    db.$queryRawUnsafe<Array<{ type: string; revenue: string | null; sales: bigint }>>(
      `SELECT p."type"::text as type,
              SUM(pu."amount")::text as revenue,
              COUNT(*)::bigint as sales
         FROM "Purchase" pu
         JOIN "Product" p ON p."id" = pu."productId"
        WHERE pu."status" = 'COMPLETED'
        GROUP BY p."type"
        ORDER BY revenue DESC NULLS LAST`,
    ),
    db.product.findMany({
      orderBy: { totalSales: "desc" },
      take: 10,
      where: { totalSales: { gt: 0 } },
      select: {
        id: true,
        title: true,
        slug: true,
        totalSales: true,
        price: true,
        creator: { select: { storeName: true } },
      },
    }),
    // Top creators: aggregate via raw SQL
    db.$queryRawUnsafe<
      Array<{ id: string; storeName: string; slug: string; revenue: string | null; sales: bigint }>
    >(
      `SELECT cp."id" as id, cp."storeName" as "storeName", cp."slug" as slug,
              SUM(pu."amount")::text                              as revenue,
              COUNT(*)::bigint                                    as sales
         FROM "Purchase" pu
         JOIN "Product" p         ON p."id" = pu."productId"
         JOIN "CreatorProfile" cp ON cp."id" = p."creatorId"
        WHERE pu."status" = 'COMPLETED'
        GROUP BY cp."id", cp."storeName", cp."slug"
        ORDER BY revenue DESC NULLS LAST
        LIMIT 10`,
    ),
    // Basic funnel: views, wishlist adds, completed purchases in last 30d
    db.userEvent.groupBy({
      by: ["event"],
      where: { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
      _count: { _all: true },
    }),
  ]);

  const timeseriesPoints = timeSeries.map((row) => ({
    day: row.day.toISOString().slice(0, 10),
    revenue: Number(row.revenue ?? 0),
    orders: Number(row.orders),
  }));

  const typePoints = typeBreakdown.map((row) => ({
    type: row.type,
    revenue: Number(row.revenue ?? 0),
    sales: Number(row.sales),
  }));

  const creatorRows = topCreators.map((row) => ({
    id: row.id,
    storeName: row.storeName,
    slug: row.slug,
    revenue: Number(row.revenue ?? 0),
    sales: Number(row.sales),
  }));

  const funnelMap = new Map(funnel30d.map((f) => [f.event, f._count._all]));
  const funnel = {
    views: funnelMap.get("VIEW") ?? 0,
    wishlist: funnelMap.get("WISHLIST_ADD") ?? 0,
    purchases: funnelMap.get("PURCHASE") ?? 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          90-day performance — revenue trend, category mix, top performers, activity funnel.
        </p>
      </div>

      <AnalyticsCharts
        timeSeries={timeseriesPoints}
        typeBreakdown={typePoints}
        funnel={funnel}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card">
          <header className="border-b border-border px-4 py-3 text-sm font-semibold">
            Top products (by units sold)
          </header>
          {topProducts.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {topProducts.map((p, idx) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <span className="w-6 text-right font-mono text-xs text-muted-foreground">
                    {idx + 1}.
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.creator.storeName}</p>
                  </div>
                  <span className="font-mono text-xs">{p.totalSales} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-md border border-border bg-card">
          <header className="border-b border-border px-4 py-3 text-sm font-semibold">
            Top creators (by revenue)
          </header>
          {creatorRows.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {creatorRows.map((c, idx) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <span className="w-6 text-right font-mono text-xs text-muted-foreground">
                    {idx + 1}.
                  </span>
                  <div className="min-w-0 flex-1">
                    <a
                      href={`/admin/creators/${c.id}`}
                      className="truncate font-medium hover:text-primary"
                    >
                      {c.storeName}
                    </a>
                    <p className="truncate text-xs text-muted-foreground">{c.sales} sales</p>
                  </div>
                  <span className="font-mono text-xs font-semibold">
                    {formatPrice(c.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

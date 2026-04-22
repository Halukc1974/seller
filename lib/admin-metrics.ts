import { db } from "@/lib/db";

export interface PeriodKpi {
  label: string;
  value: number;
  previous: number;
  deltaPct: number | null;
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export async function loadDashboardMetrics() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueAgg,
    last7,
    prev7,
    last30,
    prev30,
    dayOrders,
    dayRevenueAgg,
    refundsLast30,
    ordersLast30Count,
    timeSeries,
    activeCreators,
    activeBuyers30,
  ] = await Promise.all([
    db.user.count(),
    db.product.count(),
    db.purchase.count({ where: { status: "COMPLETED" } }),
    db.purchase.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    }),

    db.purchase.aggregate({
      _sum: { amount: true },
      _count: { _all: true },
      where: { status: "COMPLETED", createdAt: { gte: weekAgo } },
    }),
    db.purchase.aggregate({
      _sum: { amount: true },
      _count: { _all: true },
      where: {
        status: "COMPLETED",
        createdAt: { gte: twoWeeksAgo, lt: weekAgo },
      },
    }),
    db.purchase.aggregate({
      _sum: { amount: true },
      _count: { _all: true },
      where: { status: "COMPLETED", createdAt: { gte: monthAgo } },
    }),
    db.purchase.aggregate({
      _sum: { amount: true },
      _count: { _all: true },
      where: {
        status: "COMPLETED",
        createdAt: { gte: twoMonthsAgo, lt: monthAgo },
      },
    }),

    db.purchase.count({
      where: { status: "COMPLETED", createdAt: { gte: dayAgo } },
    }),
    db.purchase.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED", createdAt: { gte: dayAgo } },
    }),

    db.purchase.count({
      where: { status: "REFUNDED", updatedAt: { gte: monthAgo } },
    }),
    db.purchase.count({
      where: { createdAt: { gte: monthAgo } },
    }),

    // Daily time series for last 30 days — one row per day
    db.$queryRawUnsafe<
      Array<{ day: Date; revenue: string | null; orders: bigint }>
    >(
      `SELECT date_trunc('day', "createdAt")::date as day,
              SUM("amount")::text                 as revenue,
              COUNT(*)::bigint                    as orders
         FROM "Purchase"
        WHERE "status" = 'COMPLETED'
          AND "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY day
        ORDER BY day ASC`,
    ),

    // active creators: had a published product or a sale in last 30 days
    db.creatorProfile.count({
      where: {
        OR: [
          { products: { some: { status: "PUBLISHED" } } },
          {
            products: {
              some: {
                purchases: { some: { createdAt: { gte: monthAgo } } },
              },
            },
          },
        ],
      },
    }),
    db.user.count({
      where: {
        purchases: { some: { createdAt: { gte: monthAgo } } },
      },
    }),
  ]);

  const revenue7 = Number(last7._sum.amount ?? 0);
  const revenuePrev7 = Number(prev7._sum.amount ?? 0);
  const revenue30 = Number(last30._sum.amount ?? 0);
  const revenuePrev30 = Number(prev30._sum.amount ?? 0);
  const orders7 = last7._count._all;
  const ordersPrev7 = prev7._count._all;
  const orders30 = last30._count._all;
  const ordersPrev30 = prev30._count._all;

  const refundRate =
    ordersLast30Count === 0 ? 0 : (refundsLast30 / ordersLast30Count) * 100;
  const aov30 = orders30 === 0 ? 0 : revenue30 / orders30;

  return {
    totals: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Number(revenueAgg._sum.amount ?? 0),
      activeCreators,
      activeBuyers30,
    },
    kpis: {
      revenue7d: {
        label: "Revenue (7d)",
        value: revenue7,
        previous: revenuePrev7,
        deltaPct: pctDelta(revenue7, revenuePrev7),
      },
      orders7d: {
        label: "Orders (7d)",
        value: orders7,
        previous: ordersPrev7,
        deltaPct: pctDelta(orders7, ordersPrev7),
      },
      revenue30d: {
        label: "Revenue (30d)",
        value: revenue30,
        previous: revenuePrev30,
        deltaPct: pctDelta(revenue30, revenuePrev30),
      },
      orders30d: {
        label: "Orders (30d)",
        value: orders30,
        previous: ordersPrev30,
        deltaPct: pctDelta(orders30, ordersPrev30),
      },
      today: {
        orders: dayOrders,
        revenue: Number(dayRevenueAgg._sum.amount ?? 0),
      },
      aov30d: aov30,
      refundRate30d: refundRate,
    },
    timeSeries: timeSeries.map((row) => ({
      day: row.day.toISOString().slice(0, 10),
      revenue: Number(row.revenue ?? 0),
      orders: Number(row.orders),
    })),
  };
}

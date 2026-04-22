"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TimeSeriesPoint {
  day: string;
  revenue: number;
  orders: number;
}

interface TypePoint {
  type: string;
  revenue: number;
  sales: number;
}

interface FunnelPoint {
  views: number;
  wishlist: number;
  purchases: number;
}

const TYPE_COLORS = [
  "hsl(var(--primary))",
  "#a855f7",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#06b6d4",
];

export function AnalyticsCharts({
  timeSeries,
  typeBreakdown,
  funnel,
}: {
  timeSeries: TimeSeriesPoint[];
  typeBreakdown: TypePoint[];
  funnel: FunnelPoint;
}) {
  const funnelPoints = [
    { stage: "Views", count: funnel.views },
    { stage: "Wishlist", count: funnel.wishlist },
    { stage: "Purchases", count: funnel.purchases },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold">Revenue — last 90 days</h2>
        <div className="h-[280px] w-full">
          {timeSeries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No completed sales in the last 90 days.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev90" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 10 }} width={44} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value, name) => {
                    const num = typeof value === "number" ? value : Number(value);
                    return name === "revenue"
                      ? [`$${num.toFixed(2)}`, "Revenue"]
                      : [num, "Orders"];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#rev90)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Revenue by product type</h2>
          <div className="h-[240px] w-full">
            {typeBreakdown.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="type" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={44} />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value) => {
                      const num = typeof value === "number" ? value : Number(value);
                      return [`$${num.toFixed(2)}`, "Revenue"];
                    }}
                  />
                  <Bar dataKey="revenue">
                    {typeBreakdown.map((_, idx) => (
                      <Cell key={idx} fill={TYPE_COLORS[idx % TYPE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-md border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Activity funnel (30 days)</h2>
          <div className="h-[240px] w-full">
            {funnelPoints.every((p) => p.count === 0) ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No tracked activity yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelPoints} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Views from product-page impressions (tracked via ViewTracker), wishlist
            adds, and completed purchases.
          </p>
        </section>
      </div>
    </div>
  );
}

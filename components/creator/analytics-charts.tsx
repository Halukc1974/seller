"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface RevenuePoint {
  date: string;
  revenue: number;
}

interface TypePoint {
  name: string;
  value: number;
}

interface AnalyticsChartsProps {
  revenueData: RevenuePoint[];
  typeData: TypePoint[];
}

const TYPE_COLORS: Record<string, string> = {
  TEMPLATE: "#2563eb",
  SOFTWARE: "#7c3aed",
  ASSET: "#059669",
  COURSE: "#d97706",
  LICENSE: "#dc2626",
  OTHER: "#6b7280",
};

const DEFAULT_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#6b7280",
];

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function TypeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{payload[0].name}</p>
      <p className="text-muted-foreground">{payload[0].value} sales</p>
    </div>
  );
}

export function AnalyticsCharts({ revenueData, typeData }: AnalyticsChartsProps) {
  const hasRevenue = revenueData.length > 0;
  const hasTypes = typeData.length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Revenue Chart */}
      <Card>
        <CardHeader className="pb-4">
          <h3 className="text-base font-semibold">Revenue (Last 30 Days)</h3>
          <p className="text-sm text-muted-foreground">Daily completed purchase revenue</p>
        </CardHeader>
        <CardContent>
          {!hasRevenue ? (
            <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No revenue data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={revenueData}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                  width={48}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#2563eb" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Sales by Product Type Chart */}
      <Card>
        <CardHeader className="pb-4">
          <h3 className="text-base font-semibold">Sales by Product Type</h3>
          <p className="text-sm text-muted-foreground">Distribution of total sales</p>
        </CardHeader>
        <CardContent>
          {!hasTypes ? (
            <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No sales data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={TYPE_COLORS[entry.name] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<TypeTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

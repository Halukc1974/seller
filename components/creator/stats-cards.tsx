import { Package, ShoppingCart, DollarSign, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    totalProducts: number;
    totalSales: number;
    totalRevenue: number;
    avgRating: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Products",
      value: stats.totalProducts.toString(),
      icon: Package,
    },
    {
      label: "Total Sales",
      value: stats.totalSales.toString(),
      icon: ShoppingCart,
    },
    {
      label: "Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
    },
    {
      label: "Avg Rating",
      value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—",
      icon: Star,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      ))}
    </div>
  );
}

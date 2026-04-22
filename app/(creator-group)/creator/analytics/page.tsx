import { requireCreator } from "@/lib/middleware";
import { db } from "@/lib/db";
import { StatsCards } from "@/components/creator/stats-cards";
import { formatPrice } from "@/lib/utils";

export default async function CreatorAnalyticsPage() {
  const session = await requireCreator();

  const profile = await db.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Creator profile not found.</p>
      </div>
    );
  }

  const products = await db.product.findMany({
    where: { creatorId: profile.id },
    select: {
      id: true,
      title: true,
      totalSales: true,
      averageRating: true,
      reviewCount: true,
    },
  });

  const productIds = products.map((p) => p.id);

  const revenueResult = await db.purchase.aggregate({
    where: {
      productId: { in: productIds },
      status: "COMPLETED",
    },
    _sum: { amount: true },
  });

  const totalRevenue = Number(revenueResult._sum.amount ?? 0);

  const ratedProducts = products.filter((p) => p.reviewCount > 0);
  const avgRating =
    ratedProducts.length > 0
      ? ratedProducts.reduce((sum, p) => sum + Number(p.averageRating), 0) /
        ratedProducts.length
      : 0;

  const stats = {
    totalProducts: products.length,
    totalSales: products.reduce((sum, p) => sum + p.totalSales, 0),
    totalRevenue,
    avgRating: Math.round(avgRating * 100) / 100,
  };

  const recentPurchases = await db.purchase.findMany({
    where: {
      productId: { in: productIds },
      status: "COMPLETED",
    },
    include: {
      product: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const topProducts = [...products]
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your store performance
        </p>
      </div>

      {/* Stats row */}
      <StatsCards stats={stats} />

      {/* Recent Sales */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Sales</h2>
        {recentPurchases.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No sales yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Buyer
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentPurchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(purchase.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium truncate max-w-[180px]">
                      {purchase.product.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell truncate max-w-[160px]">
                      {purchase.user.name ?? purchase.user.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(Number(purchase.amount), purchase.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Top Products */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Top Products</h2>
        {topProducts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No products yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Sales
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium truncate max-w-[200px]">
                      {product.title}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {product.totalSales}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                      {product.reviewCount > 0
                        ? `${Number(product.averageRating).toFixed(1)} (${product.reviewCount})`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

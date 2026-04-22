import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [userCount, productCount, orderCount, revenueAgg, recentPurchases, recentUsers, recentProducts] =
    await Promise.all([
      db.user.count(),
      db.product.count(),
      db.purchase.count(),
      db.purchase.aggregate({ _sum: { amount: true } }),
      db.purchase.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { title: true } },
        },
      }),
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      db.product.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { storeName: true } },
        },
      }),
    ]);

  const totalRevenue = Number(revenueAgg._sum.amount ?? 0);

  const STAT_CARDS = [
    { label: "Total Users", value: userCount.toLocaleString() },
    { label: "Total Products", value: productCount.toLocaleString() },
    { label: "Total Orders", value: orderCount.toLocaleString() },
    { label: "Total Revenue", value: formatPrice(totalRevenue) },
  ];

  const ROLE_STYLES: Record<string, string> = {
    ADMIN: "bg-red-500/10 text-red-600 dark:text-red-400",
    CREATOR: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    BUYER: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  const STATUS_STYLES: Record<string, string> = {
    DRAFT: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    PUBLISHED: "bg-green-500/10 text-green-600 dark:text-green-400",
    ARCHIVED: "bg-muted text-muted-foreground",
  };

  const PURCHASE_STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    COMPLETED: "bg-green-500/10 text-green-600 dark:text-green-400",
    REFUNDED: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your marketplace</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold">Recent Orders</h2>
          </div>
          <div className="divide-y divide-border">
            {recentPurchases.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No orders yet</p>
            ) : (
              recentPurchases.map((p) => (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.product.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.user.name ?? p.user.email}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium">{formatPrice(Number(p.amount))}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PURCHASE_STATUS_STYLES[p.status] ?? ""}`}
                    >
                      {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent users */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold">New Users</h2>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No users yet</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                    {((u.name ?? u.email ?? "?")[0]).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{u.name ?? u.email}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[u.role] ?? ""}`}
                    >
                      {u.role}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent products */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold">New Products</h2>
          </div>
          <div className="divide-y divide-border">
            {recentProducts.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No products yet</p>
            ) : (
              recentProducts.map((p) => (
                <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="h-8 w-8 rounded object-cover shrink-0 border border-border"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-muted shrink-0 border border-border" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[p.status] ?? ""}`}
                      >
                        {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        by {p.creator.storeName}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

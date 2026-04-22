import Link from "next/link";
import { BadgeCheck, AlertOctagon } from "lucide-react";
import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCreatorsPage() {
  await requireAdmin();

  const creators = await db.creatorProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, status: true } },
      _count: { select: { products: true } },
    },
  });

  // Sum revenue per creator via aggregate query
  const revenueRows = await db.purchase.groupBy({
    by: ["productId"],
    where: { status: "COMPLETED" },
    _sum: { amount: true },
    _count: { _all: true },
  });
  const productToCreator = new Map<string, string>();
  const productList = await db.product.findMany({
    select: { id: true, creatorId: true },
  });
  for (const p of productList) productToCreator.set(p.id, p.creatorId);

  const revenueByCreator = new Map<string, { revenue: number; sales: number }>();
  for (const row of revenueRows) {
    const creatorId = productToCreator.get(row.productId);
    if (!creatorId) continue;
    const existing = revenueByCreator.get(creatorId) ?? { revenue: 0, sales: 0 };
    existing.revenue += Number(row._sum.amount ?? 0);
    existing.sales += row._count._all;
    revenueByCreator.set(creatorId, existing);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Creators</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {creators.length} store{creators.length === 1 ? "" : "s"}. Click a row
          to open the creator detail view.
        </p>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Store</th>
              <th className="px-4 py-2 font-medium hidden md:table-cell">Owner</th>
              <th className="px-4 py-2 font-medium text-right">Products</th>
              <th className="px-4 py-2 font-medium text-right">Sales</th>
              <th className="px-4 py-2 font-medium text-right">Revenue</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {creators.map((c) => {
              const stats = revenueByCreator.get(c.id) ?? { revenue: 0, sales: 0 };
              return (
                <tr key={c.id} className="hover:bg-muted/40">
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/creators/${c.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {c.storeName}
                    </Link>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      /creators/{c.slug}
                    </div>
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell text-xs text-muted-foreground">
                    {c.user.email}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs">
                    {c._count.products}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs">
                    {stats.sales}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs font-semibold">
                    {formatPrice(stats.revenue)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {c.verified && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                          <BadgeCheck className="h-3 w-3" /> Verified
                        </span>
                      )}
                      {c.suspended && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] text-orange-600">
                          <AlertOctagon className="h-3 w-3" /> Suspended
                        </span>
                      )}
                      {c.user.status === "BANNED" && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-600">
                          Owner banned
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

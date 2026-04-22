import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

type StatusFilter = "ALL" | "PENDING" | "COMPLETED" | "REFUNDED";

const PURCHASE_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  COMPLETED: "bg-green-500/10 text-green-600 dark:text-green-400",
  REFUNDED: "bg-red-500/10 text-red-600 dark:text-red-400",
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdmin();

  const params = await searchParams;
  const rawStatus = (params.status ?? "ALL").toUpperCase() as StatusFilter;
  const statusFilter: StatusFilter = ["ALL", "PENDING", "COMPLETED", "REFUNDED"].includes(rawStatus)
    ? rawStatus
    : "ALL";

  const purchases = await db.purchase.findMany({
    where: statusFilter === "ALL" ? {} : { status: statusFilter },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const TABS: StatusFilter[] = ["ALL", "PENDING", "COMPLETED", "REFUNDED"];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {purchases.length} {purchases.length === 1 ? "order" : "orders"}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <a
            key={tab}
            href={`/admin/orders${tab === "ALL" ? "" : `?status=${tab}`}`}
            className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === tab
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </a>
        ))}
      </div>

      {/* Table */}
      {purchases.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                  Buyer
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  Product
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">
                  Transaction ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  {/* Date */}
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  {/* Buyer */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="font-medium truncate max-w-[150px]">
                      {p.user.name ?? p.user.email}
                    </p>
                    {p.user.name && (
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {p.user.email}
                      </p>
                    )}
                  </td>

                  {/* Product */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="truncate max-w-[180px]">{p.product.title}</p>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {formatPrice(Number(p.amount), p.currency)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PURCHASE_STATUS_STYLES[p.status] ?? ""}`}
                    >
                      {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                    </span>
                  </td>

                  {/* Transaction ID */}
                  <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground font-mono text-xs truncate max-w-[180px]">
                    {p.paddleTransactionId ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

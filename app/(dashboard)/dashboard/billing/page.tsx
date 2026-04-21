import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  REFUNDED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const purchases = await db.purchase.findMany({
    where: { userId: session.user.id },
    include: {
      product: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground text-sm mt-1">Your transaction history and invoices.</p>
      </div>

      {purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No billing records</h2>
          <p className="text-muted-foreground text-sm mt-1">Your transactions will appear here once you make a purchase.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchases.map((purchase) => {
                const date = new Date(purchase.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                const amount = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: purchase.currency,
                }).format(Number(purchase.amount));

                return (
                  <tr key={purchase.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{date}</td>
                    <td className="px-4 py-3 font-medium truncate max-w-[200px]">{purchase.product.title}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          STATUS_STYLES[purchase.status] ?? "bg-muted text-muted-foreground"
                        )}
                      >
                        {purchase.status.charAt(0) + purchase.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {purchase.paddleTransactionId ? (
                        <code className="text-xs font-mono text-muted-foreground">{purchase.paddleTransactionId}</code>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

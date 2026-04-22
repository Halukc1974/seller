import { redirect } from "next/navigation";
import { DollarSign, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function creatorShare(): number {
  const raw = Number(process.env.CREATOR_REVENUE_SHARE);
  if (Number.isFinite(raw) && raw > 0 && raw <= 1) return raw;
  return 0.8;
}

export default async function CreatorEarningsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await db.creatorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, payoutEmail: true, storeName: true },
  });
  if (!profile) redirect("/become-creator");

  const share = creatorShare();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const purchases = await db.purchase.findMany({
    where: {
      product: { creatorId: profile.id },
    },
    include: {
      product: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const earnedCompleted = purchases
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const refundedAmount = purchases
    .filter((p) => p.status === "REFUNDED")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const last30Sales = purchases.filter(
    (p) => p.status === "COMPLETED" && p.createdAt >= thirtyDaysAgo,
  );
  const last30Amount = last30Sales.reduce((sum, p) => sum + Number(p.amount), 0);

  const grossEarned = earnedCompleted * share;
  const refundedShare = refundedAmount * share;
  const last30Net = last30Amount * share;
  const pendingPayout = grossEarned;

  const currency = purchases[0]?.currency ?? "USD";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revenue share: <strong>{Math.round(share * 100)}%</strong> creator ·{" "}
          {Math.round((1 - share) * 100)}% platform fee. Payouts are
          processed manually while the platform is in early access.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          icon={<DollarSign className="h-4 w-4" />}
          label="Total earned"
          value={formatPrice(grossEarned)}
          hint="80% share of all completed sales"
          currency={currency}
        />
        <Metric
          icon={<Clock className="h-4 w-4" />}
          label="Pending payout"
          value={formatPrice(pendingPayout)}
          hint="Awaiting clearance / transfer"
          currency={currency}
        />
        <Metric
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Paid out"
          value={formatPrice(0)}
          hint="No payouts processed yet"
          currency={currency}
        />
        <Metric
          icon={<TrendingUp className="h-4 w-4" />}
          label="Last 30 days"
          value={formatPrice(last30Net)}
          hint={`${last30Sales.length} sale${last30Sales.length === 1 ? "" : "s"}`}
          currency={currency}
        />
      </div>

      {profile.payoutEmail ? (
        <p className="text-xs text-muted-foreground">
          Payout email on file: <strong>{profile.payoutEmail}</strong>. Update it
          from <a href="/creator/settings" className="underline">Settings</a>.
        </p>
      ) : (
        <p className="text-xs text-amber-600">
          No payout email set. Add one from{" "}
          <a href="/creator/settings" className="underline">Settings</a> so we
          can pay you when payouts start.
        </p>
      )}

      <div className="rounded-md border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">Recent sales</h2>
          <span className="text-xs text-muted-foreground">
            Showing last {purchases.length}
          </span>
        </header>
        {purchases.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No sales yet. Once buyers complete a purchase, they will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-2 font-medium">Date</th>
                  <th className="px-5 py-2 font-medium">Product</th>
                  <th className="px-5 py-2 font-medium text-right">Gross</th>
                  <th className="px-5 py-2 font-medium text-right">
                    Your share
                  </th>
                  <th className="px-5 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-none">
                    <td className="px-5 py-2 text-xs text-muted-foreground">
                      {p.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-5 py-2">
                      <a
                        href={`/products/${p.product.slug}`}
                        className="text-foreground hover:text-primary"
                      >
                        {p.product.title}
                      </a>
                    </td>
                    <td className="px-5 py-2 text-right font-mono text-xs">
                      {formatPrice(Number(p.amount))}
                    </td>
                    <td className="px-5 py-2 text-right font-mono text-xs font-semibold">
                      {formatPrice(Number(p.amount) * share)}
                    </td>
                    <td className="px-5 py-2">
                      <StatusPill status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Refunded transactions have been deducted.{" "}
        {refundedShare > 0 && (
          <>
            Refunds so far have reduced your balance by{" "}
            <strong>{formatPrice(refundedShare)}</strong>.
          </>
        )}
      </p>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  currency: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-2 font-mono text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    REFUNDED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
        styles[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { RefundButton } from "@/components/admin/refund-button";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const purchase = await db.purchase.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          type: true,
          creator: {
            select: { id: true, storeName: true, slug: true },
          },
        },
      },
    },
  });

  if (!purchase) notFound();

  // Sibling orders from the same Paddle transaction
  const sibling = purchase.paddleTransactionId
    ? await db.purchase.findMany({
        where: {
          paddleTransactionId: purchase.paddleTransactionId,
          id: { not: id },
        },
        include: { product: { select: { title: true, slug: true } } },
      })
    : [];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to orders
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Order #{purchase.id.slice(-8)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {purchase.createdAt.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={purchase.status} />
          <RefundButton
            purchaseId={purchase.id}
            disabled={purchase.status === "REFUNDED"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Line item">
          <Link
            href={`/admin/creators/${purchase.product.creator.id}`}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            {purchase.product.creator.storeName}
          </Link>
          <Link
            href={`/products/${purchase.product.slug}`}
            className="mt-1 block text-sm font-medium hover:text-primary"
          >
            {purchase.product.title}
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">Product type</p>
          <p className="text-sm">{purchase.product.type}</p>
        </Card>

        <Card title="Buyer">
          <Link
            href={`/admin/users/${purchase.user.id}`}
            className="text-sm font-medium hover:text-primary"
          >
            {purchase.user.name ?? purchase.user.email}
          </Link>
          <p className="text-xs text-muted-foreground">{purchase.user.email}</p>
        </Card>

        <Card title="Payment">
          <p className="font-mono text-xl font-semibold">
            {formatPrice(Number(purchase.amount))}
          </p>
          <p className="text-xs text-muted-foreground">{purchase.currency}</p>
          <p className="mt-3 text-xs text-muted-foreground">Paddle transaction</p>
          <p className="truncate font-mono text-xs">
            {purchase.paddleTransactionId ?? "— (demo / manual)"}
          </p>
        </Card>
      </div>

      {purchase.licenseKey && (
        <Card title="License key">
          <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
            {purchase.licenseKey}
          </code>
        </Card>
      )}

      <Card title="Fulfilment">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Downloads used</dt>
            <dd>
              {purchase.downloadCount} / {purchase.maxDownloads}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Expires</dt>
            <dd>{purchase.expiresAt?.toLocaleString() ?? "Never"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Last updated</dt>
            <dd>{purchase.updatedAt.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd>{purchase.status}</dd>
          </div>
        </dl>
      </Card>

      {sibling.length > 0 && (
        <Card title={`Siblings on the same transaction (${sibling.length})`}>
          <ul className="divide-y divide-border">
            {sibling.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <Link
                  href={`/admin/orders/${s.id}`}
                  className="truncate hover:text-primary"
                >
                  {s.product.title}
                </Link>
                <span className="font-mono text-xs">
                  {formatPrice(Number(s.amount))}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </p>
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    COMPLETED: "bg-green-500/10 text-green-600 dark:text-green-400",
    PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    REFUNDED: "bg-red-500/10 text-red-600 dark:text-red-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  REFUNDED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default async function PurchasesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const purchases = await db.purchase.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: { id: true, title: true, images: true, type: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Purchases</h1>
        <p className="text-muted-foreground text-sm mt-1">All your purchased products in one place.</p>
      </div>

      {purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No purchases yet</h2>
          <p className="text-muted-foreground text-sm mt-1 mb-6">Browse our marketplace and find something you love.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const thumb = purchase.product.images[0] ?? null;
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
              <div
                key={purchase.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                {/* Thumbnail */}
                <div className="h-16 w-16 shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={purchase.product.title}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${purchase.product.slug}`}
                    className="font-medium truncate hover:underline block"
                  >
                    {purchase.product.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{date}</span>
                    <span>{amount}</span>
                    <span className="capitalize text-xs">{purchase.product.type.toLowerCase()}</span>
                  </div>
                </div>

                {/* Status + action */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      STATUS_STYLES[purchase.status] ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    {purchase.status.charAt(0) + purchase.status.slice(1).toLowerCase()}
                  </span>

                  {purchase.status === "COMPLETED" && (
                    <Link
                      href="/dashboard/downloads"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

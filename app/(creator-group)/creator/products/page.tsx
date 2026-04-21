import Link from "next/link";
import { Plus } from "lucide-react";
import { requireCreator } from "@/lib/middleware";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductActions } from "./product-actions";

const TYPE_LABELS: Record<string, string> = {
  TEMPLATE: "Template",
  SOFTWARE: "Software",
  ASSET: "Asset",
  COURSE: "Course",
  LICENSE: "License",
  OTHER: "Other",
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  PUBLISHED: "bg-green-500/10 text-green-600 dark:text-green-400",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default async function CreatorProductsPage() {
  const session = await requireCreator();

  const profile = await db.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  const products = profile
    ? await db.product.findMany({
        where: { creatorId: profile.id },
        include: {
          _count: { select: { purchases: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
        <Link
          href="/creator/products/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Product
        </Link>
      </div>

      {/* Empty state */}
      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No products yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Create your first product to start selling.
          </p>
          <Link
            href="/creator/products/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Sales</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                  {/* Product title + thumbnail */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="h-10 w-10 rounded object-cover shrink-0 border border-border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted shrink-0 border border-border" />
                      )}
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{product.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.slug}</p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                      {TYPE_LABELS[product.type] ?? product.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[product.status] ?? STATUS_STYLES.DRAFT}`}
                    >
                      {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-right font-medium">
                    {formatPrice(Number(product.price))}
                  </td>

                  {/* Sales */}
                  <td className="px-4 py-3 text-right hidden lg:table-cell text-muted-foreground">
                    {product._count.purchases}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-right hidden lg:table-cell text-muted-foreground">
                    {new Date(product.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <ProductActions productId={product.id} productTitle={product.title} />
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

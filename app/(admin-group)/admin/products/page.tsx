import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductActions } from "@/components/admin/product-actions";

type StatusFilter = "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED";

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

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  await requireAdmin();

  const params = await searchParams;
  const rawStatus = (params.status ?? "ALL").toUpperCase() as StatusFilter;
  const statusFilter: StatusFilter = ["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"].includes(rawStatus)
    ? rawStatus
    : "ALL";

  const products = await db.product.findMany({
    where: statusFilter === "ALL" ? {} : { status: statusFilter },
    include: {
      creator: { select: { storeName: true } },
      _count: { select: { purchases: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const TABS: StatusFilter[] = ["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <a
            key={tab}
            href={`/admin/products${tab === "ALL" ? "" : `?status=${tab}`}`}
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
      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No products found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                  Creator
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  Type
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                  Sales
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                  {/* Thumbnail + title */}
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
                        <p className="font-medium truncate max-w-[180px]">{product.title}</p>
                        {product.featured && (
                          <span className="text-xs text-primary font-medium">Featured</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Creator */}
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground truncate max-w-[120px]">
                    {product.creator.storeName}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                      {TYPE_LABELS[product.type] ?? product.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[product.status] ?? ""}`}
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

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <ProductActions
                      productId={product.id}
                      status={product.status}
                      featured={product.featured}
                    />
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

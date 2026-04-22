import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { CollectionsListClient } from "./collections-list-client";

export default async function AdminCollectionsPage() {
  await requireAdmin();

  const collections = await db.collection.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {collections.length} {collections.length === 1 ? "collection" : "collections"}
          </p>
        </div>
        <CollectionsListClient showCreateButton />
      </div>

      {/* Table */}
      {collections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">No collections yet.</p>
          <CollectionsListClient showCreateButton inline />
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Collection</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                  Slug
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  Products
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                  Featured
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Sort</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {collections.map((col) => (
                <tr key={col.id} className="hover:bg-muted/20 transition-colors">
                  {/* Name + image */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {col.image ? (
                        <img
                          src={col.image}
                          alt={col.title}
                          className="h-10 w-10 rounded object-cover shrink-0 border border-border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted shrink-0 border border-border flex items-center justify-center text-muted-foreground text-xs font-bold">
                          {col.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium truncate max-w-[180px]">{col.title}</p>
                        {col.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {col.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground font-mono text-xs">
                    {col.slug}
                  </td>

                  {/* Products count */}
                  <td className="px-4 py-3 text-right hidden md:table-cell text-muted-foreground">
                    {col._count.products}
                  </td>

                  {/* Featured */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {col.featured ? (
                      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                        Featured
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>

                  {/* Sort order */}
                  <td className="px-4 py-3 text-right text-muted-foreground">{col.sortOrder}</td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/admin/collections/${col.id}`}
                        className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium hover:bg-accent transition-colors"
                      >
                        Edit
                      </a>
                      <a
                        href={`/collections/${col.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium hover:bg-accent transition-colors"
                      >
                        View
                      </a>
                      <CollectionsListClient deleteId={col.id} deleteTitle={col.title} />
                    </div>
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

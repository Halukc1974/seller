import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Download, FileText, Package } from "lucide-react";
import { CopyButton } from "@/components/dashboard/copy-button";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DownloadsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const purchases = await db.purchase.findMany({
    where: { userId: session.user.id, status: "COMPLETED" },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          files: {
            select: { id: true, fileName: true, fileSize: true, mimeType: true, version: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Downloads</h1>
        <p className="text-muted-foreground text-sm mt-1">Access files for all your completed purchases.</p>
      </div>

      {purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No downloads available</h2>
          <p className="text-muted-foreground text-sm mt-1 mb-6">Complete a purchase to access downloadable files.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => {
            const remaining = purchase.maxDownloads - purchase.downloadCount;
            const pct = Math.min((purchase.downloadCount / purchase.maxDownloads) * 100, 100);

            return (
              <div key={purchase.id} className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Product header */}
                <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
                  <Link
                    href={`/products/${purchase.product.slug}`}
                    className="font-medium hover:underline truncate"
                  >
                    {purchase.product.title}
                  </Link>

                  {/* Download usage bar */}
                  <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                    <span>{purchase.downloadCount}/{purchase.maxDownloads} downloads</span>
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* License key */}
                {purchase.licenseKey && (
                  <div className="px-4 py-2 border-b border-border bg-primary/5 flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground">License Key:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{purchase.licenseKey}</code>
                      <CopyButton value={purchase.licenseKey} />
                    </div>
                  </div>
                )}

                {/* Files list */}
                <div className="divide-y divide-border">
                  {purchase.product.files.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-muted-foreground">No files attached to this product.</p>
                  ) : (
                    purchase.product.files.map((file) => {
                      const downloadUrl = `/api/downloads/${purchase.id}?fileId=${file.id}`;
                      return (
                        <div key={file.id} className="flex items-center gap-3 px-4 py-3">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatBytes(file.fileSize)} · v{file.version}
                            </p>
                          </div>
                          {remaining > 0 ? (
                            <a
                              href={downloadUrl}
                              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </a>
                          ) : (
                            <span className="text-xs text-destructive shrink-0">Limit reached</span>
                          )}
                        </div>
                      );
                    })
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

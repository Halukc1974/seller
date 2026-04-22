import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  "user.role.update": "Role change",
  "user.ban": "User banned",
  "user.unban": "User unbanned",
  "creator.verify": "Creator verified",
  "creator.unverify": "Creator unverified",
  "creator.suspend": "Creator suspended",
  "creator.unsuspend": "Creator unsuspended",
  "review.delete": "Review deleted",
  "product.archive": "Product archived",
  "platform.settings.update": "Platform settings updated",
  "purchase.refund": "Order refunded",
};

export default async function AdminAuditPage() {
  await requireAdmin();

  const logs = await db.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every privileged action by an admin. Newest first, up to 200.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No admin actions yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">When</th>
                <th className="px-4 py-2 font-medium">Who</th>
                <th className="px-4 py-2 font-medium">Action</th>
                <th className="px-4 py-2 font-medium">Target</th>
                <th className="px-4 py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">
                    {log.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {log.actorEmail ?? log.actorId.slice(0, 8)}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <span className="rounded-full bg-muted px-2 py-0.5 font-mono">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs font-mono text-muted-foreground">
                    {log.targetType ?? "—"}
                    {log.targetId && (
                      <span className="ml-1 text-[10px]">
                        {log.targetId.slice(0, 8)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {log.metadata ? (
                      <code className="block max-w-[320px] truncate font-mono">
                        {JSON.stringify(log.metadata)}
                      </code>
                    ) : (
                      "—"
                    )}
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

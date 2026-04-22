import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * The email that bootstraps the super-admin role. Hardcoded in the repo so it
 * is always present, but overridable via SUPER_ADMIN_EMAIL env var in other
 * environments.
 */
export const SUPER_ADMIN_EMAIL = (
  process.env.SUPER_ADMIN_EMAIL || "celebi.haluk@gmail.com"
).toLowerCase();

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === SUPER_ADMIN_EMAIL;
}

export async function requireSuperAdmin() {
  const session = await auth();
  const email = session?.user?.email ?? null;
  if (!email || !isSuperAdminEmail(email) || session?.user?.role !== "ADMIN") {
    throw new Response("Forbidden", { status: 403 });
  }
  return session;
}

/**
 * Record a privileged action in the audit log. Never throws — failures are
 * logged but must not block the primary action.
 */
export async function logAdminAction(input: {
  actorId: string;
  actorEmail?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.adminAuditLog.create({
      data: {
        actorId: input.actorId,
        actorEmail: input.actorEmail ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        metadata: (input.metadata ?? null) as never,
      },
    });
  } catch (err) {
    console.error("[admin-audit] failed to log action", input.action, err);
  }
}

/**
 * Read + cache the singleton PlatformSettings row. Creates it on first call if
 * the migration seed did not run yet.
 */
export async function getPlatformSettings() {
  const existing = await db.platformSettings.findUnique({
    where: { id: "singleton" },
  });
  if (existing) return existing;

  return db.platformSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlatformSettings, logAdminAction } from "@/lib/admin";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const settings = await getPlatformSettings();
  return NextResponse.json({
    ...settings,
    creatorRevenueShare: Number(settings.creatorRevenueShare),
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    creatorRevenueShare?: number;
    allowNewCreators?: boolean;
    allowNewPurchases?: boolean;
    maintenanceMessage?: string | null;
  };

  const data: Record<string, unknown> = { updatedBy: session.user.id };

  if (typeof body.creatorRevenueShare === "number") {
    if (body.creatorRevenueShare < 0 || body.creatorRevenueShare > 1) {
      return NextResponse.json(
        { error: "creatorRevenueShare must be between 0 and 1" },
        { status: 400 },
      );
    }
    data.creatorRevenueShare = body.creatorRevenueShare;
  }
  if (typeof body.allowNewCreators === "boolean") data.allowNewCreators = body.allowNewCreators;
  if (typeof body.allowNewPurchases === "boolean") data.allowNewPurchases = body.allowNewPurchases;
  if (typeof body.maintenanceMessage === "string" || body.maintenanceMessage === null) {
    data.maintenanceMessage = body.maintenanceMessage;
  }

  const updated = await db.platformSettings.update({
    where: { id: "singleton" },
    data,
  });

  await logAdminAction({
    actorId: session.user.id!,
    actorEmail: session.user.email,
    action: "platform.settings.update",
    targetType: "PlatformSettings",
    targetId: "singleton",
    metadata: body as Record<string, unknown>,
  });

  return NextResponse.json({
    ...updated,
    creatorRevenueShare: Number(updated.creatorRevenueShare),
  });
}

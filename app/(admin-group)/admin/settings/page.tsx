import { requireAdmin } from "@/lib/middleware";
import { getPlatformSettings } from "@/lib/admin";
import { PlatformSettingsForm } from "@/components/admin/platform-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getPlatformSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Global switches that affect every seller and buyer on the marketplace.
          Changes are recorded in the audit log.
        </p>
      </div>

      <PlatformSettingsForm
        initial={{
          creatorRevenueShare: Number(settings.creatorRevenueShare),
          allowNewCreators: settings.allowNewCreators,
          allowNewPurchases: settings.allowNewPurchases,
          maintenanceMessage: settings.maintenanceMessage ?? "",
        }}
      />
    </div>
  );
}

import { requireAdmin } from "@/lib/middleware";
import { Header } from "@/components/layout/header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminGlobalSearch } from "@/components/admin/admin-global-search";
import { ToastProvider } from "@/components/ui/toast";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin console
            </h2>
            <AdminGlobalSearch />
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <AdminSidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

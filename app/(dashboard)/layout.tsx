import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { ToastProvider } from "@/components/ui/toast";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <SidebarNav />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

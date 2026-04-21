import { requireCreator } from "@/lib/middleware";
import { Header } from "@/components/layout/header";
import { CreatorSidebar } from "@/components/creator/creator-sidebar";
import { ToastProvider } from "@/components/ui/toast";

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  await requireCreator();

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <CreatorSidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

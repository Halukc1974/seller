"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  MessageSquare,
  FolderOpen,
  BarChart3,
  ScrollText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS: { heading: string; items: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    heading: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Creators", href: "/admin/creators", icon: Store },
    ],
  },
  {
    heading: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Collections", href: "/admin/collections", icon: FolderOpen },
      { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    ],
  },
  {
    heading: "Commerce",
    items: [{ label: "Orders", href: "/admin/orders", icon: ShoppingCart }],
  },
  {
    heading: "System",
    items: [
      { label: "Audit log", href: "/admin/audit", icon: ScrollText },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop grouped sidebar */}
      <nav className="hidden md:flex w-60 shrink-0 flex-col gap-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading} className="flex flex-col gap-0.5">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.heading}
            </p>
            {group.items.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(pathname, href)
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Mobile: flat horizontal scroll */}
      <nav className="flex md:hidden items-center gap-1 overflow-x-auto pb-2 border-b border-border">
        {NAV_GROUPS.flatMap((g) => g.items).map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(pathname, href)
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}

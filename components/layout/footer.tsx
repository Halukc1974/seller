import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const FOOTER_LINKS = {
  Products: [
    { label: "Templates", href: "/products?type=TEMPLATE" },
    { label: "Software", href: "/products?type=SOFTWARE" },
    { label: "Assets", href: "/products?type=ASSET" },
    { label: "Courses", href: "/products?type=COURSE" },
    { label: "Licenses", href: "/licenses" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span>Seller.</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover and purchase premium digital products for creators and developers.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright bar */}
        <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Seller. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for creators worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import {
  Rocket,
  CreditCard,
  Download,
  Shield,
  Store,
  Wrench,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_LINKS = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Learn the basics of buying and selling",
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    description: "Payment methods, invoices, refunds",
  },
  {
    icon: Download,
    title: "Downloads",
    description: "Access your purchased files",
  },
  {
    icon: Shield,
    title: "Account & Security",
    description: "Manage your profile and settings",
  },
  {
    icon: Store,
    title: "Selling on Seller",
    description: "Creator guides and best practices",
  },
  {
    icon: Wrench,
    title: "Technical Support",
    description: "Bug reports and troubleshooting",
  },
];

const FAQS = [
  {
    q: "How do I download my purchased products?",
    a: "After completing a purchase, visit your Dashboard → Purchases. Each order has a Download button that gives you instant access to your files. Downloads are available for 12 months from the purchase date.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex), PayPal, and various local payment methods depending on your region. All payments are processed securely via Paddle.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes — we offer a 30-day money-back guarantee on most digital products. If you're not satisfied with a purchase, contact support@onedollarsell.com with your order details and we'll process a refund promptly. See our Refund Policy for full details.",
  },
  {
    q: "How do I become a creator?",
    a: "Head to your Dashboard and click 'Become a Creator'. Fill in your store details, verify your identity, and connect a payout method. Once approved (usually within 24 hours), you can start listing products.",
  },
  {
    q: "What file formats are supported?",
    a: "Creators can upload any file format — ZIP, PDF, MP4, PSD, Figma, Sketch, and more. There is a 2 GB per-file limit. We recommend bundling related files into a single ZIP archive for a better buyer experience.",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. Seller never stores your card details. All payment information is handled by Paddle, a PCI DSS Level 1 certified payment processor. Your data is encrypted end-to-end.",
  },
  {
    q: "How do I contact support?",
    a: "Email us at support@onedollarsell.com and we'll respond within one business day. For urgent issues, mention 'URGENT' in the subject line and we'll prioritise your ticket.",
  },
  {
    q: "Can I use products for commercial projects?",
    a: "Licensing varies by product. Each listing clearly states whether it includes a personal licence, an extended commercial licence, or both. Check the licence tab on any product page before purchasing for commercial use.",
  },
  {
    q: "Do products receive updates?",
    a: "Creators can push updates to their products at any time. If you've purchased a product, you'll receive all future updates from that creator at no extra cost — just re-download from your Purchases page.",
  },
  {
    q: "What happens if a creator removes a product?",
    a: "If a product is removed after you've purchased it, you retain access to the version you downloaded. We recommend downloading your files promptly after purchase.",
  },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium text-primary uppercase tracking-widest">
            Support
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Help Center
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Find answers to common questions about buying, selling, and using
            Seller.
          </p>

          {/* Search bar — links to products as decorative search */}
          <form
            action="/products"
            className="mt-8 flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 shadow-sm focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
          >
            <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <input
              name="q"
              type="search"
              placeholder="Search for help articles…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-2xl font-bold">Browse by topic</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group flex items-start gap-4 rounded-md border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary/30 py-16 px-4 border-t border-border">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold">Frequently asked questions</h2>
            <p className="mt-3 text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Email us at{" "}
              <a
                href="mailto:support@onedollarsell.com"
                className="text-primary hover:underline"
              >
                support@onedollarsell.com
              </a>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-md border border-border bg-card open:border-primary/30"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-medium text-foreground list-none">
                  <span>{q}</span>
                  <span className="flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 border-t border-border">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Still need help?</h2>
          <p className="mt-4 text-muted-foreground">
            Our support team is here for you. We typically respond within one
            business day.
          </p>
          <div className="mt-8">
            <a href="mailto:support@onedollarsell.com">
              <Button size="lg">
                Email support@onedollarsell.com
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Shield, BarChart3, Store, Loader2, ExternalLink } from "lucide-react";
import { CREATOR_LEGAL_REQUIREMENTS } from "@/lib/creator-legal";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const BENEFITS = [
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Sell your digital products to customers worldwide. No geographical limits — your store is open 24/7.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description:
      "Payments are processed securely via Paddle. Get paid reliably with automatic tax handling.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track your sales, revenue, and customer insights with a powerful analytics dashboard built for creators.",
  },
];

export function BecomeCreatorForm() {
  const router = useRouter();

  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [bio, setBio] = useState("");
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(storeName));
  }, [storeName, slugEdited]);

  const allAccepted = CREATOR_LEGAL_REQUIREMENTS.every((r) => accepted[r.key]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAccepted) {
      setError("Please acknowledge every statement below before continuing.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/creator/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          slug,
          bio,
          acceptances: CREATOR_LEGAL_REQUIREMENTS.map((r) => ({
            key: r.key,
            version: r.version,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/creator/products");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg">
            <Store className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Start Selling on Seller
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Turn your digital creations into income. Set up your store in
            minutes and reach customers around the globe.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-20">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Create your store
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="storeName" className="mb-1.5 block text-sm font-medium">
                  Store name <span className="text-destructive">*</span>
                </label>
                <input
                  id="storeName"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="My Awesome Store"
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label htmlFor="slug" className="mb-1.5 block text-sm font-medium">
                  Store URL <span className="text-destructive">*</span>
                </label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  }}
                  placeholder="my-awesome-store"
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {slug && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Your store will be at:{" "}
                    <span className="font-mono font-medium text-foreground">
                      onedollarsell.com/creators/{slug}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">
                  Bio{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell customers a little about yourself and what you create..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Legal acceptances */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Before we open your store
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Every creator must confirm each of the following. Your acceptance
                is recorded with a timestamp, IP address and browser fingerprint
                for our records.
              </p>

              <ul className="mt-4 space-y-4">
                {CREATOR_LEGAL_REQUIREMENTS.map((req) => {
                  const checked = Boolean(accepted[req.key]);
                  return (
                    <li key={req.key} className="flex items-start gap-3">
                      <input
                        id={`accept-${req.key}`}
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setAccepted((prev) => ({ ...prev, [req.key]: e.target.checked }))
                        }
                        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-border"
                      />
                      <label htmlFor={`accept-${req.key}`} className="flex-1 cursor-pointer">
                        <span className="block text-sm font-medium text-foreground">
                          {req.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {req.description}
                        </span>
                        {req.link && (
                          <Link
                            href={req.link.href}
                            target="_blank"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> {req.link.label}
                          </Link>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !allAccepted}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating your store…
                </>
              ) : (
                "Create your store"
              )}
            </button>
            {!allAccepted && (
              <p className="text-center text-xs text-muted-foreground">
                All acknowledgements above are required.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

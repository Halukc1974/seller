"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface Results {
  users: Array<{ id: string; name: string | null; email: string | null; role: string }>;
  creators: Array<{ id: string; storeName: string; slug: string }>;
  products: Array<{ id: string; title: string; slug: string; status: string }>;
  orders: Array<{
    id: string;
    amount: number;
    currency: string;
    user: { email: string | null };
  }>;
}

export function AdminGlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q.trim())}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        setResults(await res.json());
        setOpen(true);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  const isEmpty =
    results &&
    results.users.length === 0 &&
    results.creators.length === 0 &&
    results.products.length === 0 &&
    results.orders.length === 0;

  return (
    <div className="relative w-full max-w-sm" ref={ref}>
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results && setOpen(true)}
          placeholder="Search users, creators, products, orders…"
          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>

      {open && results && !isEmpty && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[400px] overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
          {results.users.length > 0 && (
            <Section title="Users">
              {results.users.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/users/${u.id}`}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-1.5 text-xs hover:bg-accent"
                >
                  {u.name ?? u.email}{" "}
                  <span className="text-muted-foreground">({u.role})</span>
                </Link>
              ))}
            </Section>
          )}
          {results.creators.length > 0 && (
            <Section title="Creators">
              {results.creators.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/creators/${c.id}`}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-1.5 text-xs hover:bg-accent"
                >
                  {c.storeName}{" "}
                  <span className="text-muted-foreground">/{c.slug}</span>
                </Link>
              ))}
            </Section>
          )}
          {results.products.length > 0 && (
            <Section title="Products">
              {results.products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-1.5 text-xs hover:bg-accent"
                >
                  {p.title}{" "}
                  <span className="text-muted-foreground">({p.status})</span>
                </Link>
              ))}
            </Section>
          )}
          {results.orders.length > 0 && (
            <Section title="Orders">
              {results.orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-1.5 text-xs hover:bg-accent"
                >
                  <span className="font-mono">{o.id.slice(-8)}</span>{" "}
                  <span className="text-muted-foreground">
                    · {o.user.email} · ${o.amount.toFixed(2)}
                  </span>
                </Link>
              ))}
            </Section>
          )}
        </div>
      )}

      {open && isEmpty && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-border bg-popover px-3 py-2 text-xs text-muted-foreground shadow-lg">
          No matches for “{q}”
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatPrice } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  type: string;
  price: number;
  currency: string;
  images: { url: string; alt: string }[];
}

interface SearchResponse {
  products: SearchResult[];
  total: number;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`);
      if (res.ok) {
        const data: SearchResponse = await res.json();
        setResults(data.products ?? []);
        setOpen(true);
      }
    } catch {
      // ignore fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleResultClick(slug: string) {
    setOpen(false);
    setQuery("");
    router.push(`/products/${slug}`);
  }

  function handleClear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative">
      <motion.form
        onSubmit={handleSubmit}
        animate={{ width: focused ? 400 : 300 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden md:flex"
        style={{ width: focused ? 400 : 300 }}
      >
        <div className="relative w-full flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setFocused(true);
              if (results.length > 0) setOpen(true);
            }}
            placeholder="Search products..."
            className={cn(
              "w-full rounded-md border border-input bg-background py-2 pl-9 pr-9 text-sm",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "transition-colors"
            )}
          />
          {loading && (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {!loading && query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.form>

      {/* Mobile search */}
      <form onSubmit={handleSubmit} className="flex md:hidden w-full">
        <div className="relative w-full flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setFocused(true);
              if (results.length > 0) setOpen(true);
            }}
            placeholder="Search products..."
            className={cn(
              "w-full rounded-md border border-input bg-background py-2 pl-9 pr-9 text-sm",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "transition-colors"
            )}
          />
          {loading && (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {!loading && query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown results */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border border-border bg-background shadow-lg overflow-hidden"
          >
            <ul>
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => handleResultClick(result.slug)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{result.type.toLowerCase()}</p>
                    </div>
                    <span className="text-sm font-medium text-primary shrink-0">
                      {formatPrice(result.price, result.currency)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-border px-3 py-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`/products?q=${encodeURIComponent(query.trim())}`);
                }}
                className="text-xs text-primary hover:underline"
              >
                View all results for &ldquo;{query}&rdquo;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

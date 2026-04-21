import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{
        animation: "fadeUp 0.5s ease both",
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Large 404 */}
      <p
        className="select-none text-[8rem] font-bold leading-none text-foreground/10 sm:text-[12rem]"
        aria-hidden="true"
      >
        404
      </p>

      {/* Heading */}
      <h1 className="-mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>

      {/* Subtitle */}
      <p className="mt-4 max-w-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      {/* Search bar */}
      <form
        action="/products"
        className="mt-8 flex w-full max-w-sm items-center gap-2 rounded-md border border-border bg-card px-4 py-2 shadow-sm focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
      >
        <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <input
          name="q"
          type="search"
          placeholder="Try searching for what you need…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button size="lg">Go Home</Button>
        </Link>
        <Link href="/products">
          <Button size="lg" variant="outline">
            Browse Products
          </Button>
        </Link>
      </div>
    </div>
  );
}

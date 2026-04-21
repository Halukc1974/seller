import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Post {
  slug: string;
  category: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  gradient: string;
}

const featuredPost = {
  slug: "introducing-seller-2",
  title: "Introducing Seller 2.0",
  date: "April 15, 2026",
  excerpt:
    "We've rebuilt Seller from the ground up with a new creator dashboard, instant payouts, AI-powered product descriptions, and a revamped discovery feed that puts your products in front of the right buyers.",
  author: "The Seller Team",
  gradient: "from-blue-500 to-violet-600",
};

const posts: Post[] = [
  {
    slug: "10-tips-selling-digital-products",
    category: "Guides",
    title: "10 Tips for Selling Digital Products",
    date: "April 10, 2026",
    excerpt:
      "From pricing to SEO-friendly descriptions, here are ten battle-tested tactics creators use to boost their sales.",
    author: "Priya Nair",
    gradient: "from-emerald-400 to-teal-600",
  },
  {
    slug: "how-to-price-your-templates",
    category: "Strategy",
    title: "How to Price Your Templates",
    date: "April 3, 2026",
    excerpt:
      "Pricing digital goods is part science, part art. Learn how to find the sweet spot that maximises both volume and revenue.",
    author: "Alex Kim",
    gradient: "from-orange-400 to-red-500",
  },
  {
    slug: "rise-of-ai-powered-design-tools",
    category: "Trends",
    title: "The Rise of AI-Powered Design Tools",
    date: "March 28, 2026",
    excerpt:
      "AI is reshaping creative workflows. We look at the tools gaining traction and what they mean for digital product creators.",
    author: "James Liu",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    slug: "passive-income-digital-assets",
    category: "Guides",
    title: "Building a Passive Income with Digital Assets",
    date: "March 20, 2026",
    excerpt:
      "A step-by-step guide to building a catalogue of digital assets that earns while you sleep.",
    author: "Sara Müller",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    slug: "creator-spotlight-sarah-kim",
    category: "Spotlight",
    title: "Creator Spotlight: Sarah Kim",
    date: "March 12, 2026",
    excerpt:
      "Sarah went from freelance designer to six-figure digital product creator in 18 months. Here's her story.",
    author: "Priya Nair",
    gradient: "from-cyan-400 to-blue-600",
  },
  {
    slug: "2026-design-trends-report",
    category: "Report",
    title: "2026 Design Trends Report",
    date: "March 1, 2026",
    excerpt:
      "Our annual analysis of the design trends shaping product aesthetics, type choices, and motion design this year.",
    author: "James Liu",
    gradient: "from-rose-400 to-fuchsia-600",
  },
];

const CATEGORY_COLORS: Record<string, "default" | "secondary" | "outline"> = {
  Guides: "default",
  Strategy: "secondary",
  Trends: "outline",
  Spotlight: "secondary",
  Report: "outline",
};

export default function BlogPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium text-primary uppercase tracking-widest">
            Blog
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Insights, tutorials, and updates
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            From the Seller team — everything you need to grow as a creator.
          </p>
        </div>
      </section>

      {/* Featured post */}
      <section className="py-14 px-4 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-xl font-semibold">Featured</h2>
          <Link href={`/blog/${featuredPost.slug}`} className="group block">
            <div className="rounded-md border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div
                className={`h-64 bg-gradient-to-br ${featuredPost.gradient} flex items-center justify-center`}
              >
                <span className="text-white/20 text-8xl font-black select-none">S</span>
              </div>
              <div className="p-8">
                <p className="text-xs text-muted-foreground mb-3">{featuredPost.date}</p>
                <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
                  {featuredPost.excerpt}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">By {featuredPost.author}</span>
                  <span className="text-sm font-medium text-primary group-hover:underline">
                    Read more →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Post grid */}
      <section className="py-14 px-4 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-xl font-semibold">Latest posts</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <div className="h-full rounded-md border border-border bg-card overflow-hidden hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col">
                  <div
                    className={`h-40 bg-gradient-to-br ${post.gradient} flex-shrink-0`}
                  />
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={CATEGORY_COLORS[post.category] ?? "outline"}>
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>
                    <p className="text-xs text-muted-foreground mt-auto">By {post.author}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-secondary/30 py-20 px-4 border-t border-border">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold">Stay in the loop</h2>
          <p className="mt-3 text-muted-foreground">
            Get our best articles, creator spotlights, and product updates delivered to your inbox.
          </p>
          <form
            action="#"
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 rounded-sm border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button type="submit" size="md">
              Subscribe
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}

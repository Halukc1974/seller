import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilters } from "@/components/product/product-filters";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchParams {
  q?: string;
  category?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  price?: string; // combined range e.g. "25-50" or "100-"
  sort?: string;
  page?: string;
}

const LIMIT = 12;

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

async function getProducts(params: SearchParams) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const offset = (page - 1) * LIMIT;

  // Build price range from either combined `price` param or individual params
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  if (params.price) {
    const [lo, hi] = params.price.split("-");
    if (lo) minPrice = parseFloat(lo);
    if (hi) maxPrice = parseFloat(hi);
  } else {
    if (params.minPrice) minPrice = parseFloat(params.minPrice);
    if (params.maxPrice) maxPrice = parseFloat(params.maxPrice);
  }

  // Build where clause
  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
  };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { shortDescription: { contains: params.q, mode: "insensitive" } },
      { tags: { some: { tag: { name: { contains: params.q, mode: "insensitive" } } } } },
    ];
  }

  if (params.category) {
    where.categories = { some: { category: { slug: params.category } } };
  }

  if (params.type) {
    where.type = params.type as Prisma.EnumProductTypeFilter | undefined;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Prisma.DecimalFilter = {};
    if (minPrice !== undefined) priceFilter.gte = minPrice;
    if (maxPrice !== undefined) priceFilter.lte = maxPrice;
    where.price = priceFilter;
  }

  // Build orderBy
  let orderBy: Prisma.ProductOrderByWithRelationInput = { totalSales: "desc" };
  switch (params.sort) {
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "rating":
      orderBy = { averageRating: "desc" };
      break;
    default:
      orderBy = { totalSales: "desc" };
  }

  const include = {
    creator: true,
    categories: { include: { category: true } },
    tags: { include: { tag: true } },
  } as const;

  const [products, total] = await Promise.all([
    db.product.findMany({ where, orderBy, take: LIMIT, skip: offset, include }),
    db.product.count({ where }),
  ]);

  const mapped = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    type: p.type,
    price: formatPrice(Number(p.price), p.currency ?? "USD"),
    compareAtPrice: p.compareAtPrice
      ? formatPrice(Number(p.compareAtPrice), p.currency ?? "USD")
      : null,
    images: p.images as string[],
    featured: p.featured,
    totalSales: p.totalSales,
    averageRating: Number(p.averageRating),
    reviewCount: p.reviewCount,
    creator: {
      storeName: p.creator.storeName,
      slug: p.creator.slug,
      verified: p.creator.verified,
    },
  }));

  return {
    products: mapped,
    total,
    totalPages: Math.ceil(total / LIMIT),
    page,
  };
}

async function getFilterData() {
  const [categories, tags] = await Promise.all([
    db.category.findMany({
      where: { parentId: null },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    db.tag.findMany({
      orderBy: { products: { _count: "desc" } },
      take: 20,
    }),
  ]);

  return {
    categories: categories.map((c) => ({
      label: c.name,
      value: c.slug,
      count: c._count.products,
    })),
    tags: tags.map((t) => ({ label: t.name, value: t.slug })),
  };
}

// ---------------------------------------------------------------------------
// Pagination link builder
// ---------------------------------------------------------------------------

function buildHref(params: SearchParams, page: number): string {
  const p = new URLSearchParams();
  if (params.q) p.set("q", params.q);
  if (params.category) p.set("category", params.category);
  if (params.type) p.set("type", params.type);
  if (params.price) p.set("price", params.price);
  if (params.minPrice) p.set("minPrice", params.minPrice);
  if (params.maxPrice) p.set("maxPrice", params.maxPrice);
  if (params.sort) p.set("sort", params.sort);
  p.set("page", String(page));
  return `/products?${p.toString()}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawParams = await searchParams;

  // Normalise to single string values
  const params: SearchParams = {
    q: Array.isArray(rawParams.q) ? rawParams.q[0] : rawParams.q,
    category: Array.isArray(rawParams.category) ? rawParams.category[0] : rawParams.category,
    type: Array.isArray(rawParams.type) ? rawParams.type[0] : rawParams.type,
    minPrice: Array.isArray(rawParams.minPrice) ? rawParams.minPrice[0] : rawParams.minPrice,
    maxPrice: Array.isArray(rawParams.maxPrice) ? rawParams.maxPrice[0] : rawParams.maxPrice,
    price: Array.isArray(rawParams.price) ? rawParams.price[0] : rawParams.price,
    sort: Array.isArray(rawParams.sort) ? rawParams.sort[0] : rawParams.sort,
    page: Array.isArray(rawParams.page) ? rawParams.page[0] : rawParams.page,
  };

  const [{ products, total, totalPages, page }, filterData] = await Promise.all([
    getProducts(params),
    getFilterData(),
  ]);

  // Pagination pages to show (simple: show all up to 7, else clamp)
  const pageNumbers: number[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    // Always show first, last, current ± 2
    const set = new Set<number>();
    set.add(1);
    set.add(totalPages);
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) set.add(i);
    pageNumbers.push(...Array.from(set).sort((a, b) => a - b));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {params.q ? `Results for "${params.q}"` : "All Products"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total === 0
            ? "No products found"
            : `${total.toLocaleString()} product${total !== 1 ? "s" : ""} available`}
        </p>
      </div>

      {/* Filters + grid */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full flex-shrink-0 lg:w-64">
          <ProductFilters
            categories={filterData.categories}
            tags={filterData.tags}
          />
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <ProductGrid products={products} total={total} />

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
            >
              {page > 1 && (
                <a
                  href={buildHref(params, page - 1)}
                  className="inline-flex h-9 items-center justify-center rounded-sm border border-border px-3 text-sm hover:bg-accent transition-colors"
                >
                  ← Prev
                </a>
              )}

              {pageNumbers.map((num, idx) => {
                const prev = pageNumbers[idx - 1];
                const showEllipsis = prev !== undefined && num - prev > 1;
                return (
                  <span key={num} className="flex items-center gap-2">
                    {showEllipsis && (
                      <span className="text-sm text-muted-foreground px-1">…</span>
                    )}
                    <a
                      href={buildHref(params, num)}
                      aria-current={num === page ? "page" : undefined}
                      className={
                        num === page
                          ? "inline-flex h-9 w-9 items-center justify-center rounded-sm bg-primary text-sm font-medium text-primary-foreground"
                          : "inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-sm hover:bg-accent transition-colors"
                      }
                    >
                      {num}
                    </a>
                  </span>
                );
              })}

              {page < totalPages && (
                <a
                  href={buildHref(params, page + 1)}
                  className="inline-flex h-9 items-center justify-center rounded-sm border border-border px-3 text-sm hover:bg-accent transition-colors"
                >
                  Next →
                </a>
              )}
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}

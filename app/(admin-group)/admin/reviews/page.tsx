import { requireAdmin } from "@/lib/middleware";
import { db } from "@/lib/db";
import { AdminReviewRow } from "@/components/admin/admin-review-row";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ rating?: string }>;
}

export default async function AdminReviewsPage({ searchParams }: Props) {
  await requireAdmin();

  const params = await searchParams;
  const ratingFilter = params.rating ? Number(params.rating) : null;
  const validFilter = ratingFilter && ratingFilter >= 1 && ratingFilter <= 5 ? ratingFilter : null;

  const reviews = await db.review.findMany({
    where: validFilter ? { rating: validFilter } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, email: true, name: true } },
      product: { select: { title: true, slug: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Newest first. Showing up to 100.
        </p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto">
        <a
          href="/admin/reviews"
          className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            !validFilter
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          All
        </a>
        {[1, 2, 3, 4, 5].map((r) => (
          <a
            key={r}
            href={`/admin/reviews?rating=${r}`}
            className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              validFilter === r
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {r}★
          </a>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No reviews match this filter.
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <AdminReviewRow
              key={review.id}
              review={{
                id: review.id,
                rating: review.rating,
                title: review.title,
                body: review.body,
                helpful: review.helpful,
                createdAt: review.createdAt.toISOString(),
                user: review.user,
                product: review.product,
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

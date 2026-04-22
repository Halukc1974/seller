import Link from "next/link";
import { redirect } from "next/navigation";
import { Star, MessageSquare } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RatingStars } from "@/components/ui/rating-stars";

export const dynamic = "force-dynamic";

export default async function BuyerReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const reviews = await db.review.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: { id: true, title: true, slug: true, images: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reviews you have posted on products you purchased. Edit or delete a
          review from the product page.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-card p-12 text-center">
          <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold">No reviews yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            After buying a product you can leave a review from its page.
          </p>
          <Link
            href="/dashboard/purchases"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            View purchases
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-md border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${review.product.slug}`}
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {review.product.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <RatingStars rating={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {review.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/products/${review.product.slug}#review`}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent"
                >
                  <Star className="h-3 w-3" /> Edit
                </Link>
              </div>
              {review.title && (
                <p className="mt-3 text-sm font-medium">{review.title}</p>
              )}
              {review.body && (
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                  {review.body}
                </p>
              )}
              {review.helpful > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {review.helpful}{" "}
                  {review.helpful === 1 ? "person" : "people"} found this
                  helpful
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

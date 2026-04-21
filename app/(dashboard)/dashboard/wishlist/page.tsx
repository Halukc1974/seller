import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const wishlist = await db.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: { id: true, title: true, images: true, price: true, currency: true, slug: true, type: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground text-sm mt-1">Products you have saved for later.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">Your wishlist is empty</h2>
          <p className="text-muted-foreground text-sm mt-1 mb-6">Save products you like to revisit them later.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map(({ product }) => {
            const thumb = product.images[0] ?? null;
            const price = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: product.currency,
            }).format(Number(product.price));

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={product.title}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium truncate group-hover:text-primary transition-colors">{product.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold">{price}</span>
                    <span className="text-xs text-muted-foreground capitalize">{product.type.toLowerCase()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

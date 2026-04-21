import { requireCreator } from "@/lib/middleware";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/creator/product-form";

export default async function NewProductPage() {
  await requireCreator();

  const categories = await db.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Product</h1>
        <p className="text-sm text-muted-foreground mt-1">Fill in the details to create your product.</p>
      </div>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}

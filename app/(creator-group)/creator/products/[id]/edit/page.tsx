import { notFound } from "next/navigation";
import { requireCreator } from "@/lib/middleware";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/creator/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const session = await requireCreator();

  const profile = await db.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) notFound();

  const product = await db.product.findFirst({
    where: { id, creatorId: profile.id },
    include: {
      categories: { select: { categoryId: true } },
      tags: { include: { tag: true } },
      files: { select: { fileName: true, fileSize: true } },
    },
  });

  if (!product) notFound();

  const categories = await db.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const productData = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    type: product.type,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : null,
    shortDescription: product.shortDescription ?? undefined,
    description: product.description ?? undefined,
    licenseType: product.licenseType ?? undefined,
    licenseTerms: product.licenseTerms ?? undefined,
    categoryIds: product.categories.map((c) => c.categoryId),
    tags: product.tags.map((t) => t.tag.name),
    status: product.status,
    images: product.images,
    files: product.files.map((f) => ({ fileName: f.fileName, fileSize: f.fileSize })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-sm text-muted-foreground mt-1">Update your product details.</p>
      </div>
      <ProductForm mode="edit" product={productData} categories={categories} />
    </div>
  );
}

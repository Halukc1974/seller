"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { slugify } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { FileUpload } from "./file-upload";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ExistingFile {
  fileName: string;
  fileSize: number;
}

interface ProductData {
  id?: string;
  title?: string;
  slug?: string;
  type?: string;
  price?: number | string;
  compareAtPrice?: number | string | null;
  shortDescription?: string;
  description?: string;
  licenseType?: string;
  licenseTerms?: string;
  categoryIds?: string[];
  tags?: string[];
  status?: string;
  images?: string[];
  files?: ExistingFile[];
}

interface ProductFormProps {
  product?: ProductData;
  mode: "create" | "edit";
  categories: Category[];
}

export function ProductForm({ product, mode, categories }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!product?.slug);
  const [type, setType] = useState(product?.type ?? "OTHER");
  const [price, setPrice] = useState(String(product?.price ?? "0"));
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice != null ? String(product.compareAtPrice) : ""
  );
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [licenseType, setLicenseType] = useState(product?.licenseType ?? "");
  const [licenseTerms, setLicenseTerms] = useState(product?.licenseTerms ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryIds?.[0] ?? "");
  const [tagsInput, setTagsInput] = useState((product?.tags ?? []).join(", "));
  const [status, setStatus] = useState(product?.status ?? "DRAFT");
  const [images, setImages] = useState<string[]>(product?.images ?? [""]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  function handleSlugChange(val: string) {
    setSlugManual(true);
    setSlug(val);
  }

  function addImageInput() {
    setImages((prev) => [...prev, ""]);
  }

  function removeImageInput(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function updateImage(index: number, val: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? val : img)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload new files first if any
      let uploadedFiles: { fileName: string; filePath: string; fileSize: number; mimeType: string }[] = [];
      if (newFiles.length > 0) {
        const formData = new FormData();
        for (const f of newFiles) {
          formData.append("files", f);
        }
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.error ?? "File upload failed");
        }
        uploadedFiles = await uploadRes.json();
      }

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const body = {
        title: title.trim(),
        slug: slug.trim(),
        type,
        price: parseFloat(price) || 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        shortDescription: shortDescription.trim() || null,
        description: description.trim() || null,
        licenseType: licenseType.trim() || null,
        licenseTerms: licenseTerms.trim() || null,
        categoryIds: categoryId ? [categoryId] : [],
        tags,
        status,
        images: images.filter((img) => img.trim() !== ""),
        files: uploadedFiles,
      };

      const url = mode === "create" ? "/api/creator/products" : `/api/creator/products/${product?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Something went wrong");
      }

      const saved = await res.json();
      toast(mode === "create" ? "Product created!" : "Product updated!", "success");
      router.push("/creator/products");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">Basic Information</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Awesome Product"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Slug <span className="text-destructive">*</span></label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="my-awesome-product"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground">Auto-generated from title. Edit to customize.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="TEMPLATE">Template</option>
              <option value="SOFTWARE">Software</option>
              <option value="ASSET">Asset</option>
              <option value="COURSE">Course</option>
              <option value="LICENSE">License</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">Pricing</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Price <span className="text-destructive">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-border bg-background pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Compare At Price <span className="text-muted-foreground text-xs">(optional)</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-border bg-background pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">Description</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Short Description</label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="One-line summary shown in listings"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Full Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            placeholder="Detailed product description, features, requirements..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
          />
        </div>
      </section>

      {/* License */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">License</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">License Type</label>
          <input
            type="text"
            value={licenseType}
            onChange={(e) => setLicenseType(e.target.value)}
            placeholder="Personal, Commercial, Extended..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">License Terms</label>
          <textarea
            value={licenseTerms}
            onChange={(e) => setLicenseTerms(e.target.value)}
            rows={4}
            placeholder="Describe what buyers can and cannot do..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
          />
        </div>
      </section>

      {/* Taxonomy */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">Category & Tags</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">— No category —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="react, ui, dashboard, dark-mode"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
        </div>
      </section>

      {/* Images */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">Images</h2>
        <p className="text-sm text-muted-foreground">Paste image URLs (CDN, S3, etc.)</p>

        <div className="space-y-2">
          {images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="url"
                value={img}
                onChange={(e) => updateImage(i, e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageInput(i)}
                  className="rounded-md border border-border px-2 py-2 hover:bg-accent transition-colors"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageInput}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add another image
          </button>
        </div>
      </section>

      {/* Files */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">Product Files</h2>
        <p className="text-sm text-muted-foreground">Upload the files buyers will receive after purchase.</p>
        <FileUpload
          onFilesChange={setNewFiles}
          existingFiles={product?.files}
        />
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
        </button>
      </div>
    </form>
  );
}

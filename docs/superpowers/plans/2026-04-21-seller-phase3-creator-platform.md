# Seller Phase 3 — Creator Platform Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add multi-vendor creator platform — creator registration, product management dashboard, admin panel, curated collections, and public creator storefront pages.

**Architecture:** Builds on Phase 1+2. Role-based middleware for CREATOR and ADMIN routes. File upload via FormData API. Server components for data display, client components for forms.

---

## Task 1: Creator Registration & Profile

**Files:**
- Create: `app/(storefront)/become-creator/page.tsx` — Registration page
- Create: `app/api/creator/register/route.ts` — Creator registration API
- Create: `app/(storefront)/creators/[slug]/page.tsx` — Public creator storefront
- Create: `lib/middleware.ts` — Role-checking helpers

### lib/middleware.ts
Role-based auth helpers:
```ts
import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireCreator() {
  const session = await requireAuth();
  if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
    redirect("/become-creator");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}
```

### app/api/creator/register/route.ts
POST handler:
- Require auth
- Accept: `{ storeName, slug, bio }`
- Validate slug is unique and URL-safe
- Create CreatorProfile linked to user
- Update user role to CREATOR
- Return 201

### app/(storefront)/become-creator/page.tsx
Client component:
- Hero: "Start Selling on Seller" heading
- Benefits section: 3 cards (Global Reach, Secure Payments, Analytics)
- Registration form: Store Name, Store URL slug (auto-generated from name, editable), Bio textarea
- Submit → POST /api/creator/register → redirect to /creator/products

### app/(storefront)/creators/[slug]/page.tsx
Server component — public creator profile:
- Creator banner/avatar area, store name, bio, verified badge
- Stats: product count, total sales
- Product grid (published products by this creator)

### Commit
```bash
git commit -m "feat: creator registration, public storefront, role middleware"
```

---

## Task 2: Creator Dashboard — Product Management

**Files:**
- Create: `app/(creator)/layout.tsx` — Creator dashboard layout
- Create: `app/(creator)/products/page.tsx` — Product list
- Create: `app/(creator)/products/new/page.tsx` — Create product form
- Create: `app/(creator)/products/[id]/edit/page.tsx` — Edit product form
- Create: `app/api/creator/products/route.ts` — CRUD API
- Create: `app/api/creator/products/[id]/route.ts` — Single product API
- Create: `app/api/upload/route.ts` — File upload API
- Create: `components/creator/product-form.tsx` — Shared product form component
- Create: `components/creator/file-upload.tsx` — Drag-drop file upload
- Create: `components/creator/creator-sidebar.tsx` — Creator nav sidebar

### components/creator/creator-sidebar.tsx
Client component, similar to dashboard sidebar:
- Links: Products (/creator/products), Analytics (/creator/analytics), Settings (/creator/settings)
- Icons: Package, BarChart3, Settings

### app/(creator)/layout.tsx
- requireCreator() auth check
- Header + CreatorSidebar + main content

### components/creator/file-upload.tsx
Client component:
- Drag-drop zone with dashed border
- Accept multiple files
- Show upload progress bars
- File list with name, size, remove button
- Uploads to /api/upload via FormData

### components/creator/product-form.tsx
Client component — shared between new/edit:
- Props: `{ product?: existingProduct, mode: "create" | "edit" }`
- Fields: title, slug (auto from title), type (select), price, compareAtPrice, description (textarea), shortDescription, licenseType, licenseTerms
- Image upload section (multiple images)
- File upload section (product files for download)
- Category select, tag input (comma-separated)
- Status: Draft / Published
- Preview button, Save button
- Metadata fields based on type (dynamic: framework for TEMPLATE, platform for SOFTWARE, lessons/duration for COURSE, etc.)

### app/api/creator/products/route.ts
- GET: list creator's products (require CREATOR role)
- POST: create new product (require CREATOR role)
  - Create product with DRAFT status
  - Create category/tag associations
  - Return product

### app/api/creator/products/[id]/route.ts
- GET: single product (require ownership)
- PUT: update product (require ownership)
- DELETE: delete product (require ownership, cascade files)

### app/api/upload/route.ts
- POST: accept FormData with files
- Save to UPLOAD_DIR with unique names
- Return file metadata (path, size, mimeType)
- Require CREATOR role

### Commit
```bash
git commit -m "feat: creator dashboard — product CRUD, file upload, drag-drop"
```

---

## Task 3: Creator Analytics

**Files:**
- Create: `app/(creator)/analytics/page.tsx` — Analytics overview
- Create: `components/creator/stats-cards.tsx` — Stats display cards
- Create: `app/api/creator/analytics/route.ts` — Analytics data API

### app/api/creator/analytics/route.ts
GET handler (require CREATOR):
- Total products count
- Total sales (sum of all products' totalSales)
- Total revenue (sum of purchases amount where product belongs to creator)
- Recent purchases (last 10)
- Top products by sales (top 5)

### components/creator/stats-cards.tsx
Server component:
- 4 stat cards: Total Products, Total Sales, Revenue, Avg Rating
- Each with icon, value, label

### app/(creator)/analytics/page.tsx
Server component:
- Stats cards row
- Recent sales table (date, product, buyer, amount)
- Top products table (product, sales, revenue, rating)

### Commit
```bash
git commit -m "feat: creator analytics — stats cards, sales table, top products"
```

---

## Task 4: Creator Settings

**Files:**
- Create: `app/(creator)/settings/page.tsx` — Creator profile settings

### app/(creator)/settings/page.tsx
Client component:
- Store Name, Bio, Payout Email fields
- Avatar upload
- Save button → PUT /api/creator/products (reuse or create settings endpoint)
- Create `app/api/creator/settings/route.ts` for PUT updates

### Commit
```bash
git commit -m "feat: creator settings — profile management, payout email"
```

---

## Task 5: Admin Panel

**Files:**
- Create: `app/(admin)/layout.tsx` — Admin layout
- Create: `app/(admin)/admin/page.tsx` — Admin dashboard
- Create: `app/(admin)/admin/users/page.tsx` — User management
- Create: `app/(admin)/admin/products/page.tsx` — Product moderation
- Create: `app/(admin)/admin/orders/page.tsx` — Order overview
- Create: `components/admin/admin-sidebar.tsx` — Admin navigation
- Create: `app/api/admin/users/route.ts` — User management API
- Create: `app/api/admin/users/[id]/route.ts` — Single user API
- Create: `app/api/admin/products/[id]/route.ts` — Product moderation API

### components/admin/admin-sidebar.tsx
Links: Dashboard, Users, Products, Orders, Collections, Settings
Icons: LayoutDashboard, Users, Package, ShoppingCart, FolderOpen, Settings

### app/(admin)/layout.tsx
requireAdmin() + Header + AdminSidebar

### app/(admin)/admin/page.tsx (Dashboard)
Server component:
- Overview stats: total users, products, orders, revenue
- Recent activity: latest purchases, new creators, new products

### app/(admin)/admin/users/page.tsx
Server component:
- User table: name, email, role, joined date, action buttons
- Change role dropdown (BUYER → CREATOR → ADMIN)
- Search/filter by role

### app/(admin)/admin/products/page.tsx
Server component:
- Product table: title, creator, type, status, price, sales
- Approve/reject buttons for DRAFT products
- Feature/unfeature toggle
- Status change (PUBLISHED/ARCHIVED)

### app/(admin)/admin/orders/page.tsx
Server component:
- Order table: date, buyer, product, amount, status
- Filter by status

### APIs
- GET/PUT `/api/admin/users/[id]` — update user role
- PUT `/api/admin/products/[id]` — change status, feature toggle

### Commit
```bash
git commit -m "feat: admin panel — dashboard, user management, product moderation, orders"
```

---

## Task 6: Collection / Curation System

**Files:**
- Create: `app/(admin)/admin/collections/page.tsx` — Manage collections
- Create: `app/(admin)/admin/collections/[id]/page.tsx` — Edit collection
- Create: `app/api/admin/collections/route.ts` — Collection CRUD
- Create: `app/api/admin/collections/[id]/route.ts` — Single collection
- Create: `app/(storefront)/collections/[slug]/page.tsx` — Public collection page

### Admin collection management
- List all collections with product counts
- Create new: title, slug, description, image
- Edit: add/remove products, reorder, update details
- Feature toggle

### Public collection page
Server component:
- Collection title, description
- Product grid with the collection's products

### Commit
```bash
git commit -m "feat: collection system — admin CRUD, public collection pages"
```

---

## Task 7: Verify & Push

- [ ] Run `npm run build` — all routes compile
- [ ] Test routes: /become-creator, /creators/sarah-design, /creator/products, /admin
- [ ] `git push origin main`

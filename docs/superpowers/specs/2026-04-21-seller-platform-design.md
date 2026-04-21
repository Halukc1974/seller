# Seller — Premium Digital Product Marketplace

**Date:** 2026-04-21
**Status:** Approved
**Scope:** Full platform design (Phase 1 specced for implementation)

---

## 1. Overview

Seller is a premium digital product marketplace built as a hybrid model: the platform owner sells their own products while select creators can also list and sell theirs. It sells all digital product types (templates, software, assets, courses, licenses).

**Target audience:** Mixed — developers, designers, creators, entrepreneurs, and enterprise teams.

**Design philosophy:** Clean SaaS aesthetic (Linear/Notion inspired), search-first discovery, light base with blue accents, generous whitespace, smooth animations. Must feel premium without being intimidating.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 15 (App Router) | Single container, Server Components, API routes |
| Styling | Tailwind CSS | Utility-first, design tokens via config |
| Animations | Framer Motion | Layout animations, page transitions, micro-interactions |
| ORM | Prisma | Type-safe, migrations, PostgreSQL native |
| Database | PostgreSQL (self-hosted) | Full-text search built-in, JSON fields, reliable |
| Auth | NextAuth.js v5 | Email/password + Google OAuth + magic link |
| Payments | Paddle | Checkout overlay, tax handling, webhooks |
| File storage | Local filesystem | Signed URLs for delivery, no S3 dependency |
| Deployment | Coolify on VPS | Single Docker container, GitHub push → webhook |

---

## 3. Architecture

### 3.1 Directory Structure

```
seller/
├── app/
│   ├── (storefront)/         # Public: homepage, listings, product detail
│   │   ├── page.tsx          # Homepage (search-first layout)
│   │   ├── products/
│   │   │   ├── page.tsx      # Product listing with filters
│   │   │   └── [slug]/
│   │   │       └── page.tsx  # Product detail page
│   │   └── collections/
│   │       └── [slug]/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── verify/page.tsx   # Magic link verification
│   ├── (dashboard)/
│   │   ├── purchases/page.tsx
│   │   ├── downloads/page.tsx
│   │   ├── wishlist/page.tsx
│   │   ├── billing/page.tsx
│   │   └── settings/page.tsx
│   ├── (creator)/
│   │   ├── products/         # CRUD product management
│   │   ├── analytics/page.tsx
│   │   └── settings/page.tsx
│   ├── (admin)/
│   │   ├── users/page.tsx
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── products/route.ts
│   │   ├── products/[id]/route.ts
│   │   ├── checkout/route.ts
│   │   ├── webhooks/paddle/route.ts
│   │   ├── downloads/[purchaseId]/route.ts
│   │   ├── reviews/route.ts
│   │   ├── wishlist/route.ts
│   │   ├── search/route.ts
│   │   └── recommendations/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                   # Button, Input, Card, Modal, Toast, Badge
│   ├── product/              # ProductCard, ProductGallery, ProductPreview
│   ├── layout/               # Header, Footer, Sidebar, SearchBar, ThemeToggle
│   └── dashboard/            # StatsCard, Chart, DataTable
├── lib/
│   ├── db.ts                 # Prisma client singleton
│   ├── auth.ts               # NextAuth config
│   ├── paddle.ts             # Paddle SDK wrapper
│   ├── storage.ts            # File upload + signed URL generation
│   ├── recommendations.ts    # AI scoring engine
│   └── utils.ts              # Helpers (formatting, slugify, etc.)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts               # Example product data
├── public/
│   └── images/               # Static assets
├── tailwind.config.ts
├── next.config.ts
├── Dockerfile
├── docker-compose.yml
└── package.json
```

### 3.2 Route Groups

Each route group has its own layout:
- `(storefront)` — public header with search, categories, cart icon
- `(auth)` — minimal centered layout, no navigation
- `(dashboard)` — sidebar navigation (purchases, downloads, wishlist, billing, settings)
- `(creator)` — sidebar navigation (products, analytics, settings)
- `(admin)` — sidebar navigation (users, products, orders, settings)

### 3.3 Server vs Client Components

**Server Components (default):** Product listing, product detail, dashboard data views, search results. These fetch data directly via Prisma, no API round-trip.

**Client Components (explicit):** Search bar (debounced input), filter sidebar (interactive state), product gallery (lightbox), wishlist toggle (optimistic UI), theme toggle, Framer Motion animations, Paddle checkout overlay.

---

## 4. Database Schema

### 4.1 Core Models

```prisma
model User {
  id              String    @id @default(cuid())
  name            String?
  email           String    @unique
  emailVerified   DateTime?
  image           String?
  password        String?   // nullable for OAuth-only users
  role            Role      @default(BUYER)
  
  accounts        Account[]
  sessions        Session[]
  purchases       Purchase[]
  reviews         Review[]
  wishlists       Wishlist[]
  creatorProfile  CreatorProfile?
  events          UserEvent[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum Role {
  BUYER
  CREATOR
  ADMIN
}

model CreatorProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  
  storeName       String
  slug            String    @unique
  bio             String?
  avatar          String?
  banner          String?
  verified        Boolean   @default(false)
  payoutEmail     String?
  
  products        Product[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Product {
  id              String        @id @default(cuid())
  creatorId       String
  creator         CreatorProfile @relation(fields: [creatorId], references: [id])
  
  title           String
  slug            String        @unique
  description     String        // Rich text / markdown
  shortDescription String?
  type            ProductType
  price           Decimal       @db.Decimal(10, 2)
  currency        String        @default("USD")
  compareAtPrice  Decimal?      @db.Decimal(10, 2)
  
  images          String[]      // Array of image paths
  previewUrl      String?       // Live demo URL
  demoUrl         String?       // Video demo URL
  
  status          ProductStatus @default(DRAFT)
  featured        Boolean       @default(false)
  totalSales      Int           @default(0)
  averageRating   Decimal       @default(0) @db.Decimal(3, 2)
  reviewCount     Int           @default(0)
  
  licenseType     String?       // e.g., "Personal", "Commercial", "Extended"
  licenseTerms    String?
  
  metadata        Json?         // Per-type data: COURSE→{lessons,duration}, SOFTWARE→{platform,version,systemReqs}, TEMPLATE→{framework,pages}, ASSET→{format,dimensions,fileCount}, LICENSE→{seats,duration,features}
  
  files           ProductFile[]
  categories      CategoriesOnProducts[]
  tags            TagsOnProducts[]
  reviews         Review[]
  purchases       Purchase[]
  wishlists       Wishlist[]
  collections     CollectionsOnProducts[]
  events          UserEvent[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status, featured])
  @@index([type])
  @@index([creatorId])
}

enum ProductType {
  TEMPLATE
  SOFTWARE
  ASSET
  COURSE
  LICENSE
  OTHER
}

enum ProductStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model ProductFile {
  id              String    @id @default(cuid())
  productId       String
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  fileName        String
  filePath        String    // Internal path, never exposed
  fileSize        Int       // bytes
  mimeType        String
  version         String    @default("1.0")
  
  createdAt       DateTime  @default(now())
}

model Category {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  description     String?
  icon            String?   // Emoji or icon name
  parentId        String?
  parent          Category? @relation("CategoryTree", fields: [parentId], references: [id])
  children        Category[] @relation("CategoryTree")
  sortOrder       Int       @default(0)
  
  products        CategoriesOnProducts[]
}

model CategoriesOnProducts {
  productId       String
  categoryId      String
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  category        Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@id([productId, categoryId])
}

model Tag {
  id              String    @id @default(cuid())
  name            String    @unique
  slug            String    @unique
  
  products        TagsOnProducts[]
}

model TagsOnProducts {
  productId       String
  tagId           String
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  tag             Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([productId, tagId])
}

model Purchase {
  id              String          @id @default(cuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id])
  productId       String
  product         Product         @relation(fields: [productId], references: [id])
  
  paddleTransactionId String?     @unique
  amount          Decimal         @db.Decimal(10, 2)
  currency        String
  status          PurchaseStatus  @default(PENDING)
  
  licenseKey      String?         // Generated for software/license products
  downloadCount   Int             @default(0)
  maxDownloads    Int             @default(5)
  expiresAt       DateTime?       // For time-limited access
  
  createdAt       DateTime        @default(now())
  
  @@index([userId])
  @@index([productId])
  @@unique([userId, productId])
}

enum PurchaseStatus {
  PENDING
  COMPLETED
  REFUNDED
}

model Review {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  productId       String
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  rating          Int       // 1-5
  title           String?
  body            String?
  helpful         Int       @default(0)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([userId, productId])
}

model Wishlist {
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  productId       String
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime  @default(now())
  
  @@id([userId, productId])
}

model Collection {
  id              String    @id @default(cuid())
  title           String
  slug            String    @unique
  description     String?
  image           String?
  featured        Boolean   @default(false)
  sortOrder       Int       @default(0)
  
  products        CollectionsOnProducts[]
  
  createdAt       DateTime  @default(now())
}

model CollectionsOnProducts {
  collectionId    String
  productId       String
  collection      Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  product         Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  sortOrder       Int        @default(0)
  
  @@id([collectionId, productId])
}

model UserEvent {
  id              String    @id @default(cuid())
  userId          String?
  user            User?     @relation(fields: [userId], references: [id])
  productId       String?
  product         Product?  @relation(fields: [productId], references: [id])
  
  event           EventType
  searchQuery     String?
  metadata        Json?
  
  createdAt       DateTime  @default(now())
  
  @@index([userId, event])
  @@index([productId])
  @@index([createdAt])
}

enum EventType {
  VIEW
  SEARCH
  PURCHASE
  WISHLIST_ADD
  WISHLIST_REMOVE
}
```

NextAuth required models (Account, Session, VerificationToken) are standard and omitted for brevity — generated by `@auth/prisma-adapter`.

---

## 5. Design System

### 5.1 Visual Direction

**Clean SaaS** — Light base, blue-600 primary accent, generous whitespace, soft shadows.

### 5.2 Design Tokens

```
Font primary:     Inter (400, 500, 600, 700)
Font mono:        JetBrains Mono (prices, code, license keys)
  
Color primary:    #2563eb (blue-600)
Color primary-hover: #1d4ed8 (blue-700)
Color background: #ffffff (light) / #0f172a (dark)
Color surface:    #f8fafc (light) / #1e293b (dark)
Color border:     #e2e8f0 (light) / #334155 (dark)
Color text:       #0f172a (light) / #f1f5f9 (dark)
Color muted:      #64748b
Color success:    #16a34a
Color error:      #dc2626
Color warning:    #d97706

Radius sm:        6px  (buttons, inputs)
Radius md:        8px  (cards)
Radius lg:        12px (modals, panels)
Radius full:      9999px (avatars, pills)

Shadow sm:        0 1px 2px rgba(0,0,0,0.05)
Shadow md:        0 4px 6px rgba(0,0,0,0.07)
Shadow lg:        0 10px 25px rgba(0,0,0,0.1)

Spacing unit:     4px (all spacing multiples of 4)
```

### 5.3 Component Interactions

| Component | Animation |
|-----------|-----------|
| Product Card | `whileHover: { y: -4, shadow: md→lg }` + preview overlay fade-in |
| Search Bar | Focus: width expand (300→500px), suggestions dropdown slide-down |
| Grid/List Toggle | `layout` prop — smooth reflow, 300ms |
| Wishlist Heart | Spring animation `{ type: "spring", stiffness: 500 }` |
| Page Transitions | `AnimatePresence` fade + 12px slide-up, 200ms |
| Filter Chips | Scale-in on add, scale-out on remove |
| Toast | Slide from top-right, auto-dismiss 3s |
| Modal | Backdrop fade + content scale from 0.95, 200ms |
| Homepage Sections | Scroll-triggered fade-up, stagger 50ms per child |

### 5.4 Responsive

- **Mobile** (< 640px): Single column, bottom tab nav, full-width search
- **Tablet** (640–1024px): 2 columns, collapsible filter sidebar
- **Desktop** (> 1024px): 3–4 columns, persistent sidebar, expanded header

---

## 6. Key Flows

### 6.1 Checkout (Paddle)

1. User clicks "Buy Now" on product page
2. Client calls `POST /api/checkout` with `{ productId }`
3. API creates Paddle transaction via Paddle SDK, returns `transactionId`
4. Client opens Paddle overlay checkout with `transactionId`
5. User completes payment in Paddle overlay
6. Paddle sends `transaction.completed` webhook to `POST /api/webhooks/paddle`
7. Webhook handler verifies signature, creates Purchase record, generates license key if needed
8. User sees success state, download button appears
9. Confirmation email sent with signed download link (expires 24h)

### 6.2 File Delivery

1. User clicks "Download" on purchased product
2. Client calls `GET /api/downloads/[purchaseId]`
3. API checks: user owns purchase, status is COMPLETED, downloadCount < maxDownloads, not expired
4. API generates signed URL with 1-hour expiry (HMAC-SHA256 signature in query params)
5. API increments downloadCount
6. Client redirects to signed URL → file streams from server
7. Signed URL middleware validates signature + expiry before serving file

### 6.3 Search

1. User types in search bar (debounced 300ms)
2. Client calls `GET /api/search?q=...&category=...&type=...&minPrice=...&maxPrice=...&sort=...`
3. API runs PostgreSQL full-text search (`tsvector` / `tsquery`) on title + description + tags
4. Results returned with facet counts (category counts, type counts)
5. Client renders results with highlighted matches

### 6.4 AI Recommendations

Content-based scoring query against PostgreSQL:
- **"Recommended for you"**: Products sharing tags/categories with user's purchases and views, weighted by recency
- **"Users also bought"**: Co-purchase analysis — users who bought product X also bought Y
- **"Trending in [category]"**: Recent sales velocity + view count in category, time-decayed

No external ML service needed. SQL queries with scoring weights, cached for 1 hour.

---

## 7. Security

- **Auth middleware** on all `/api/` routes except public product endpoints
- **Role-based access**: BUYER < CREATOR < ADMIN (middleware checks)
- **Paddle webhook signature verification** on every webhook
- **Signed download URLs**: HMAC-SHA256, expires after 1 hour, single-use per generation
- **File storage**: Outside web root, never directly accessible
- **CSRF**: NextAuth handles via tokens
- **Rate limiting**: On auth endpoints (5 attempts/min), search (30/min), downloads (10/min)
- **Input validation**: Zod schemas on all API inputs
- **SQL injection**: Prisma parameterized queries (handled by ORM)

---

## 8. Deployment

Single Docker container on Coolify:

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
# ... install deps, build Next.js

FROM node:20-alpine AS runner
# ... copy build output, run production server on port 3000
```

- PostgreSQL via Coolify-managed container (or existing instance)
- Environment variables for Paddle keys, NextAuth secret, database URL
- GitHub push → Coolify webhook → auto-rebuild
- Uploads volume mounted for persistent file storage

---

## 9. Project Phases

### Phase 1 — Foundation (THIS PHASE)
- Project scaffolding (Next.js, Prisma, Tailwind, Framer Motion)
- Database schema + seed data (15+ example products across all types)
- Auth system (NextAuth: email/password + Google OAuth + magic link)
- UI component library (Button, Input, Card, Modal, Toast, Badge, SearchBar)
- Homepage (search-first: search bar, trending tags, featured, categories, trending products)
- Product listing page (filters, search, grid/list toggle, pagination)
- Product detail page (gallery, description, features, licensing, reviews display, Buy Now CTA)
- Dark/light mode with smooth transitions
- Responsive layout (mobile, tablet, desktop)
- Framer Motion animations throughout

### Phase 2 — Commerce
- Paddle checkout integration (overlay + webhook handling)
- Purchase flow + success page
- Secure file delivery (signed URLs with expiry + download limits)
- License key generation for software/license products
- Buyer dashboard (purchases, downloads, billing history)
- Wishlist system (add/remove, dedicated page)
- Review & rating system (submit, display, helpful votes)
- Email notifications (nodemailer: purchase confirmation, download links)

### Phase 3 — Creator Platform
- Creator registration flow + profile page
- Creator dashboard (product CRUD with drag-drop file upload, analytics overview)
- Admin panel (user management, product moderation, order overview, site settings)
- Collection/curation system (admin creates curated collections)
- Creator storefront pages (`/creators/[slug]`)

### Phase 4 — Intelligence & Polish
- AI recommendation engine (content-based filtering, co-purchase analysis)
- Personalized homepage (based on user behavior)
- Advanced creator analytics (views, conversions, revenue charts via Chart.js or Recharts)
- Performance optimization (target Lighthouse 95+: lazy loading, image optimization, code splitting)
- SEO (meta tags, Open Graph, JSON-LD structured data, sitemap.xml)
- Final animation polish and micro-interaction refinement

---

## 10. Example Seed Data

15 products across all types to demonstrate the platform:

| # | Title | Type | Price | Category |
|---|-------|------|-------|----------|
| 1 | Starter UI Kit | TEMPLATE | $49 | Templates > UI Kits |
| 2 | Dashboard Pro | TEMPLATE | $79 | Templates > Dashboards |
| 3 | Portfolio Theme | TEMPLATE | $29 | Templates > Websites |
| 4 | Icon Pack — 500 Icons | ASSET | $19 | Assets > Icons |
| 5 | 3D Illustration Bundle | ASSET | $39 | Assets > Illustrations |
| 6 | Handcrafted Font Pack | ASSET | $24 | Assets > Fonts |
| 7 | Stock Photo Collection | ASSET | $15 | Assets > Photography |
| 8 | Code Snippet Manager | SOFTWARE | $29 | Software > Dev Tools |
| 9 | SEO Analyzer Tool | SOFTWARE | $49 | Software > Marketing |
| 10 | Privacy Guard Extension | SOFTWARE | $12 | Software > Utilities |
| 11 | Full-Stack Masterclass | COURSE | $99 | Courses > Development |
| 12 | UI/UX Design Bootcamp | COURSE | $79 | Courses > Design |
| 13 | Marketing Playbook | COURSE | $59 | Courses > Marketing |
| 14 | API Access — Pro Tier | LICENSE | $19/mo | Licenses > API |
| 15 | Team License — Design System | LICENSE | $149 | Licenses > Team |

Each product includes: 3 preview images (placeholder URLs), description, tags, and creator assignment.

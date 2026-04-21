# Seller Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation of the Seller digital marketplace — project scaffolding, database, auth, UI components, homepage, product listing, and product detail pages with dark/light mode, responsive layout, and Framer Motion animations.

**Architecture:** Single Next.js 15 monolith with App Router. Server Components by default, Client Components for interactivity. Prisma ORM with PostgreSQL. NextAuth v5 for auth. Tailwind CSS + Framer Motion for styling/animations.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Prisma, PostgreSQL, NextAuth.js v5, Zod

---

## File Map

### New Files (Phase 1)

```
seller/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.example
├── .env.local                    # (gitignored)
├── .gitignore
├── Dockerfile
├── docker-compose.yml
│
├── prisma/
│   ├── schema.prisma             # Full DB schema
│   └── seed.ts                   # 15 example products + categories + tags + users
│
├── lib/
│   ├── db.ts                     # Prisma client singleton
│   ├── auth.ts                   # NextAuth v5 config (credentials + Google + magic link)
│   ├── auth-client.ts            # Client-side auth helpers (useSession, signIn, signOut)
│   ├── utils.ts                  # cn(), formatPrice(), slugify()
│   └── validators.ts             # Zod schemas for API inputs
│
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   └── rating-stars.tsx
│   ├── layout/
│   │   ├── header.tsx            # Public header with search, nav, theme toggle, auth
│   │   ├── footer.tsx
│   │   ├── search-bar.tsx        # Debounced search with instant suggestions
│   │   ├── theme-toggle.tsx
│   │   └── theme-provider.tsx    # next-themes provider
│   └── product/
│       ├── product-card.tsx      # Card with hover animation + quick preview
│       ├── product-grid.tsx      # Grid/list toggle with layout animation
│       ├── product-gallery.tsx   # Image gallery with lightbox
│       ├── product-filters.tsx   # Sidebar filters (category, type, price, tags)
│       └── product-type-badge.tsx
│
├── app/
│   ├── layout.tsx                # Root layout: fonts, ThemeProvider, Toaster
│   ├── globals.css               # Tailwind directives + CSS custom properties
│   ├── (storefront)/
│   │   ├── layout.tsx            # Header + Footer wrapper
│   │   ├── page.tsx              # Homepage (search-first)
│   │   └── products/
│   │       ├── page.tsx          # Product listing with filters
│   │       └── [slug]/
│   │           └── page.tsx      # Product detail page
│   ├── (auth)/
│   │   ├── layout.tsx            # Centered minimal layout
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── verify/page.tsx       # Magic link verification
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       └── search/route.ts       # Instant search API
│
└── public/
    └── images/
        └── placeholder.svg       # Product image placeholder
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.env.example`, `.gitignore`, `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /home/ubuntu/seller
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes
```

This creates the base Next.js 15 project with TypeScript, Tailwind, ESLint, and App Router.

- [ ] **Step 2: Install core dependencies**

```bash
cd /home/ubuntu/seller
npm install framer-motion @prisma/client next-auth@beta @auth/prisma-adapter next-themes zod clsx tailwind-merge lucide-react
npm install -D prisma @types/node
```

Package purposes:
- `framer-motion` — animations
- `@prisma/client` + `prisma` — ORM
- `next-auth@beta` + `@auth/prisma-adapter` — auth (v5 beta for App Router support)
- `next-themes` — dark/light mode
- `zod` — input validation
- `clsx` + `tailwind-merge` — className utility
- `lucide-react` — icons

- [ ] **Step 3: Configure Tailwind with design tokens**

Replace `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.07)",
        lg: "0 10px 25px rgba(0,0,0,0.1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Create globals.css with CSS custom properties**

Replace `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 210 40% 98%;
    --card-foreground: 222 47% 11%;
    --primary: 221 83% 53%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 210 40% 96%;
    --accent-foreground: 222 47% 11%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 210 40% 98%;
    --success: 142 71% 45%;
    --success-foreground: 210 40% 98%;
    --warning: 32 95% 44%;
    --warning-foreground: 210 40% 98%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --radius: 8px;
  }

  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --card: 217 33% 17%;
    --card-foreground: 210 40% 98%;
    --primary: 221 83% 53%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --success: 142 71% 29%;
    --success-foreground: 210 40% 98%;
    --warning: 32 95% 34%;
    --warning-foreground: 210 40% 98%;
    --border: 217 33% 25%;
    --input: 217 33% 25%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

- [ ] **Step 5: Create .env.example**

```bash
# Database
DATABASE_URL="postgresql://seller:seller@localhost:5432/seller?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (magic link)
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM=""

# Paddle (Phase 2)
PADDLE_API_KEY=""
PADDLE_WEBHOOK_SECRET=""
PADDLE_ENVIRONMENT="sandbox"
```

- [ ] **Step 6: Update .gitignore**

Append to existing `.gitignore`:

```
.env.local
.env
uploads/
.superpowers/
```

- [ ] **Step 7: Create root layout with fonts and ThemeProvider**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Seller — Premium Digital Products",
  description:
    "Discover and purchase premium digital products: templates, software, assets, courses, and licenses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Create ThemeProvider component**

Create `components/layout/theme-provider.tsx`:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 9: Create next.config.ts**

Replace `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 10: Verify dev server starts**

```bash
cd /home/ubuntu/seller && npm run dev
```

Expected: Server starts on http://localhost:3000 with no errors.

- [ ] **Step 11: Commit**

```bash
cd /home/ubuntu/seller
git add -A
git commit -m "feat: project scaffolding with Next.js 15, Tailwind, Framer Motion, dark/light CSS tokens"
```

---

## Task 2: Prisma Schema & Database

**Files:**
- Create: `prisma/schema.prisma`, `lib/db.ts`, `docker-compose.yml`

- [ ] **Step 1: Create docker-compose.yml for PostgreSQL**

Create `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: seller
      POSTGRES_PASSWORD: seller
      POSTGRES_DB: seller
    ports:
      - "5433:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Note: Port 5433 on host to avoid conflict with existing PostgreSQL instances.

- [ ] **Step 2: Start PostgreSQL**

```bash
cd /home/ubuntu/seller && docker compose up -d db
```

Expected: PostgreSQL container running on port 5433.

- [ ] **Step 3: Create .env.local**

Create `.env.local`:

```
DATABASE_URL="postgresql://seller:seller@localhost:5433/seller?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-in-production-123456789"
```

- [ ] **Step 4: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Auth (NextAuth) ───────────────────────────────────

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Core Models ───────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(BUYER)

  accounts       Account[]
  sessions       Session[]
  purchases      Purchase[]
  reviews        Review[]
  wishlists      Wishlist[]
  creatorProfile CreatorProfile?
  events         UserEvent[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  BUYER
  CREATOR
  ADMIN
}

model CreatorProfile {
  id          String  @id @default(cuid())
  userId      String  @unique
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  storeName   String
  slug        String  @unique
  bio         String?
  avatar      String?
  banner      String?
  verified    Boolean @default(false)
  payoutEmail String?

  products Product[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id               String        @id @default(cuid())
  creatorId        String
  creator          CreatorProfile @relation(fields: [creatorId], references: [id])
  title            String
  slug             String        @unique
  description      String        @db.Text
  shortDescription String?
  type             ProductType
  price            Decimal       @db.Decimal(10, 2)
  currency         String        @default("USD")
  compareAtPrice   Decimal?      @db.Decimal(10, 2)
  images           String[]
  previewUrl       String?
  demoUrl          String?
  status           ProductStatus @default(DRAFT)
  featured         Boolean       @default(false)
  totalSales       Int           @default(0)
  averageRating    Decimal       @default(0) @db.Decimal(3, 2)
  reviewCount      Int           @default(0)
  licenseType      String?
  licenseTerms     String?       @db.Text
  metadata         Json?

  files       ProductFile[]
  categories  CategoriesOnProducts[]
  tags        TagsOnProducts[]
  reviews     Review[]
  purchases   Purchase[]
  wishlists   Wishlist[]
  collections CollectionsOnProducts[]
  events      UserEvent[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

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
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  fileName  String
  filePath  String
  fileSize  Int
  mimeType  String
  version   String  @default("1.0")

  createdAt DateTime @default(now())
}

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  icon        String?
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  sortOrder   Int        @default(0)

  products CategoriesOnProducts[]
}

model CategoriesOnProducts {
  productId  String
  categoryId String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([productId, categoryId])
}

model Tag {
  id   String @id @default(cuid())
  name String @unique
  slug String @unique

  products TagsOnProducts[]
}

model TagsOnProducts {
  productId String
  tagId     String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([productId, tagId])
}

model Purchase {
  id                  String         @id @default(cuid())
  userId              String
  user                User           @relation(fields: [userId], references: [id])
  productId           String
  product             Product        @relation(fields: [productId], references: [id])
  paddleTransactionId String?        @unique
  amount              Decimal        @db.Decimal(10, 2)
  currency            String
  status              PurchaseStatus @default(PENDING)
  licenseKey          String?
  downloadCount       Int            @default(0)
  maxDownloads        Int            @default(5)
  expiresAt           DateTime?

  createdAt DateTime @default(now())

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
  id        String @id @default(cuid())
  userId    String
  user      User   @relation(fields: [userId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  rating    Int
  title     String?
  body      String? @db.Text
  helpful   Int     @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, productId])
}

model Wishlist {
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@id([userId, productId])
}

model Collection {
  id          String  @id @default(cuid())
  title       String
  slug        String  @unique
  description String?
  image       String?
  featured    Boolean @default(false)
  sortOrder   Int     @default(0)

  products CollectionsOnProducts[]

  createdAt DateTime @default(now())
}

model CollectionsOnProducts {
  collectionId String
  productId    String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  product      Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  sortOrder    Int        @default(0)

  @@id([collectionId, productId])
}

model UserEvent {
  id          String    @id @default(cuid())
  userId      String?
  user        User?     @relation(fields: [userId], references: [id])
  productId   String?
  product     Product?  @relation(fields: [productId], references: [id])
  event       EventType
  searchQuery String?
  metadata    Json?

  createdAt DateTime @default(now())

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

- [ ] **Step 5: Create Prisma client singleton**

Create `lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 6: Run initial migration**

```bash
cd /home/ubuntu/seller
npx prisma migrate dev --name init
```

Expected: Migration creates all tables. Prisma client generated.

- [ ] **Step 7: Verify migration**

```bash
cd /home/ubuntu/seller && npx prisma studio
```

Expected: Prisma Studio opens showing all tables with correct columns.

- [ ] **Step 8: Commit**

```bash
cd /home/ubuntu/seller
git add prisma/ lib/db.ts docker-compose.yml .env.example
git commit -m "feat: Prisma schema with all models, PostgreSQL docker-compose, db client"
```

---

## Task 3: Seed Data

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma seed script)

- [ ] **Step 1: Create seed file**

Create `prisma/seed.ts`:

```ts
import { PrismaClient, ProductType, ProductStatus, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.userEvent.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.collectionsOnProducts.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.tagsOnProducts.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.categoriesOnProducts.deleteMany();
  await prisma.category.deleteMany();
  await prisma.productFile.deleteMany();
  await prisma.product.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ──────────────────────────────────────────
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@seller.io",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  const creatorPassword = await hash("creator123", 12);
  const sarah = await prisma.user.create({
    data: {
      name: "Sarah Kim",
      email: "sarah@seller.io",
      password: creatorPassword,
      role: Role.CREATOR,
      emailVerified: new Date(),
    },
  });

  const alex = await prisma.user.create({
    data: {
      name: "Alex Morgan",
      email: "alex@seller.io",
      password: creatorPassword,
      role: Role.CREATOR,
      emailVerified: new Date(),
    },
  });

  const buyerPassword = await hash("buyer123", 12);
  const buyer = await prisma.user.create({
    data: {
      name: "Demo Buyer",
      email: "buyer@seller.io",
      password: buyerPassword,
      role: Role.BUYER,
      emailVerified: new Date(),
    },
  });

  // ─── Creator Profiles ──────────────────────────────
  const sarahProfile = await prisma.creatorProfile.create({
    data: {
      userId: sarah.id,
      storeName: "Sarah's Design Studio",
      slug: "sarah-design",
      bio: "UI/UX designer crafting premium templates and design systems for modern teams.",
      verified: true,
    },
  });

  const alexProfile = await prisma.creatorProfile.create({
    data: {
      userId: alex.id,
      storeName: "Morgan Dev Tools",
      slug: "morgan-dev",
      bio: "Full-stack developer building tools that make developers more productive.",
      verified: true,
    },
  });

  // ─── Categories ─────────────────────────────────────
  const templates = await prisma.category.create({
    data: { name: "Templates", slug: "templates", icon: "Layout", sortOrder: 0 },
  });
  const templatesSub = await Promise.all([
    prisma.category.create({ data: { name: "UI Kits", slug: "ui-kits", parentId: templates.id, sortOrder: 0 } }),
    prisma.category.create({ data: { name: "Dashboards", slug: "dashboards", parentId: templates.id, sortOrder: 1 } }),
    prisma.category.create({ data: { name: "Websites", slug: "websites", parentId: templates.id, sortOrder: 2 } }),
  ]);

  const software = await prisma.category.create({
    data: { name: "Software", slug: "software", icon: "Code", sortOrder: 1 },
  });
  const softwareSub = await Promise.all([
    prisma.category.create({ data: { name: "Dev Tools", slug: "dev-tools", parentId: software.id, sortOrder: 0 } }),
    prisma.category.create({ data: { name: "Marketing", slug: "marketing-tools", parentId: software.id, sortOrder: 1 } }),
    prisma.category.create({ data: { name: "Utilities", slug: "utilities", parentId: software.id, sortOrder: 2 } }),
  ]);

  const assets = await prisma.category.create({
    data: { name: "Assets", slug: "assets", icon: "Palette", sortOrder: 2 },
  });
  const assetsSub = await Promise.all([
    prisma.category.create({ data: { name: "Icons", slug: "icons", parentId: assets.id, sortOrder: 0 } }),
    prisma.category.create({ data: { name: "Illustrations", slug: "illustrations", parentId: assets.id, sortOrder: 1 } }),
    prisma.category.create({ data: { name: "Fonts", slug: "fonts", parentId: assets.id, sortOrder: 2 } }),
    prisma.category.create({ data: { name: "Photography", slug: "photography", parentId: assets.id, sortOrder: 3 } }),
  ]);

  const courses = await prisma.category.create({
    data: { name: "Courses", slug: "courses", icon: "GraduationCap", sortOrder: 3 },
  });
  const coursesSub = await Promise.all([
    prisma.category.create({ data: { name: "Development", slug: "development", parentId: courses.id, sortOrder: 0 } }),
    prisma.category.create({ data: { name: "Design", slug: "design", parentId: courses.id, sortOrder: 1 } }),
    prisma.category.create({ data: { name: "Marketing", slug: "marketing-courses", parentId: courses.id, sortOrder: 2 } }),
  ]);

  const licenses = await prisma.category.create({
    data: { name: "Licenses", slug: "licenses", icon: "Key", sortOrder: 4 },
  });
  const licensesSub = await Promise.all([
    prisma.category.create({ data: { name: "API", slug: "api-licenses", parentId: licenses.id, sortOrder: 0 } }),
    prisma.category.create({ data: { name: "Team", slug: "team-licenses", parentId: licenses.id, sortOrder: 1 } }),
  ]);

  // ─── Tags ──────────────────────────────────────────
  const tagNames = [
    "react", "nextjs", "tailwind", "figma", "typescript", "nodejs",
    "design-system", "dashboard", "saas", "mobile", "api", "ai",
    "productivity", "marketing", "seo", "photography", "3d", "icons",
    "fonts", "illustration",
  ];
  const tags: Record<string, { id: string }> = {};
  for (const name of tagNames) {
    tags[name] = await prisma.tag.create({
      data: { name, slug: name },
    });
  }

  // ─── Products ──────────────────────────────────────
  const productsData = [
    {
      creatorId: sarahProfile.id,
      title: "Starter UI Kit",
      slug: "starter-ui-kit",
      description: "A comprehensive UI kit with 200+ components built with React and Tailwind CSS. Includes buttons, forms, navigation, cards, modals, and more. Perfect for bootstrapping your next SaaS project.\n\n## What's Included\n- 200+ React components\n- Tailwind CSS styling\n- Dark mode support\n- Figma source files\n- Full documentation",
      shortDescription: "200+ React components with Tailwind CSS. Dark mode, Figma files included.",
      type: ProductType.TEMPLATE,
      price: 49,
      compareAtPrice: 79,
      images: [
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: true,
      totalSales: 342,
      averageRating: 4.8,
      reviewCount: 47,
      licenseType: "Personal & Commercial",
      metadata: { framework: "React", pages: 50, figmaIncluded: true },
      categoryId: templatesSub[0].id,
      tagSlugs: ["react", "tailwind", "design-system", "typescript"],
    },
    {
      creatorId: sarahProfile.id,
      title: "Dashboard Pro",
      slug: "dashboard-pro",
      description: "Professional admin dashboard template with 40+ pages, charts, tables, and data visualization components. Built with Next.js and recharts.\n\n## Features\n- 40+ pre-built pages\n- Interactive charts (recharts)\n- Data tables with sorting/filtering\n- User management screens\n- Settings panels",
      shortDescription: "40+ page admin dashboard with charts, tables, and data visualization.",
      type: ProductType.TEMPLATE,
      price: 79,
      images: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: true,
      totalSales: 218,
      averageRating: 4.6,
      reviewCount: 31,
      licenseType: "Personal & Commercial",
      metadata: { framework: "Next.js", pages: 40, figmaIncluded: false },
      categoryId: templatesSub[1].id,
      tagSlugs: ["nextjs", "dashboard", "tailwind", "saas"],
    },
    {
      creatorId: sarahProfile.id,
      title: "Portfolio Theme",
      slug: "portfolio-theme",
      description: "Elegant portfolio theme for designers and developers. Minimal, fast, and fully responsive with smooth scroll animations.\n\n## Highlights\n- Responsive design\n- Smooth scroll animations\n- Project showcase grid\n- Blog section\n- Contact form",
      shortDescription: "Elegant minimal portfolio with smooth animations and project showcase.",
      type: ProductType.TEMPLATE,
      price: 29,
      images: [
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: false,
      totalSales: 156,
      averageRating: 4.9,
      reviewCount: 22,
      licenseType: "Personal & Commercial",
      metadata: { framework: "Next.js", pages: 8, figmaIncluded: true },
      categoryId: templatesSub[2].id,
      tagSlugs: ["nextjs", "tailwind", "design-system"],
    },
    {
      creatorId: sarahProfile.id,
      title: "Icon Pack — 500 Icons",
      slug: "icon-pack-500",
      description: "Hand-crafted icon set with 500 unique icons in multiple formats. Consistent 24x24 grid, 1.5px stroke. Available in SVG, PNG, and React components.\n\n## Formats\n- SVG (optimized)\n- PNG (1x, 2x, 3x)\n- React components\n- Figma library",
      shortDescription: "500 hand-crafted icons in SVG, PNG, and React component formats.",
      type: ProductType.ASSET,
      price: 19,
      images: [
        "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: false,
      totalSales: 89,
      averageRating: 4.7,
      reviewCount: 15,
      licenseType: "Personal & Commercial",
      metadata: { format: "SVG, PNG, React", fileCount: 500 },
      categoryId: assetsSub[0].id,
      tagSlugs: ["icons", "react", "design-system", "figma"],
    },
    {
      creatorId: sarahProfile.id,
      title: "3D Illustration Bundle",
      slug: "3d-illustration-bundle",
      description: "Beautiful 3D illustrations for landing pages and marketing materials. 50 unique scenes with customizable colors.\n\n## Includes\n- 50 3D scenes\n- Customizable color palette\n- PNG + Blender source files\n- Commercial license",
      shortDescription: "50 customizable 3D illustrations for landing pages and marketing.",
      type: ProductType.ASSET,
      price: 39,
      images: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: true,
      totalSales: 67,
      averageRating: 4.5,
      reviewCount: 9,
      licenseType: "Commercial",
      metadata: { format: "PNG, Blender", fileCount: 50 },
      categoryId: assetsSub[1].id,
      tagSlugs: ["3d", "illustration", "design-system"],
    },
    {
      creatorId: sarahProfile.id,
      title: "Handcrafted Font Pack",
      slug: "handcrafted-font-pack",
      description: "A collection of 5 premium display fonts perfect for headings, logos, and branding projects. Each font includes multiple weights and OpenType features.\n\n## Fonts Included\n- Meridian Sans (6 weights)\n- Coastal Script\n- Urban Slab (4 weights)\n- Neon Display\n- Micro Mono (3 weights)",
      shortDescription: "5 premium display fonts with multiple weights for branding and headings.",
      type: ProductType.ASSET,
      price: 24,
      images: [
        "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: false,
      totalSales: 45,
      averageRating: 4.4,
      reviewCount: 7,
      licenseType: "Personal & Commercial",
      metadata: { format: "OTF, TTF, WOFF2", fileCount: 18 },
      categoryId: assetsSub[2].id,
      tagSlugs: ["fonts", "design-system"],
    },
    {
      creatorId: sarahProfile.id,
      title: "Stock Photo Collection",
      slug: "stock-photo-collection",
      description: "Curated collection of 100 high-resolution stock photos for tech and SaaS websites. Professional quality, no watermarks.\n\n## Categories\n- Workspace & office (30)\n- Technology & devices (25)\n- People & collaboration (25)\n- Abstract & backgrounds (20)",
      shortDescription: "100 curated high-res stock photos for tech and SaaS websites.",
      type: ProductType.ASSET,
      price: 15,
      images: [
        "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: false,
      totalSales: 124,
      averageRating: 4.3,
      reviewCount: 18,
      licenseType: "Commercial",
      metadata: { format: "JPG", dimensions: "4000x3000", fileCount: 100 },
      categoryId: assetsSub[3].id,
      tagSlugs: ["photography", "saas"],
    },
    {
      creatorId: alexProfile.id,
      title: "Code Snippet Manager",
      slug: "code-snippet-manager",
      description: "Desktop app for organizing, searching, and sharing code snippets. Supports 50+ languages with syntax highlighting, tags, and cloud sync.\n\n## Features\n- 50+ language support\n- Full-text search\n- Tag organization\n- Cloud sync\n- VS Code extension\n- Team sharing",
      shortDescription: "Organize and search code snippets with syntax highlighting and cloud sync.",
      type: ProductType.SOFTWARE,
      price: 29,
      images: [
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: true,
      totalSales: 198,
      averageRating: 4.7,
      reviewCount: 34,
      licenseType: "Personal",
      metadata: { platform: "macOS, Windows, Linux", version: "2.4.1", systemReqs: "4GB RAM" },
      categoryId: softwareSub[0].id,
      tagSlugs: ["productivity", "nodejs", "typescript"],
    },
    {
      creatorId: alexProfile.id,
      title: "SEO Analyzer Tool",
      slug: "seo-analyzer-tool",
      description: "Comprehensive SEO analysis tool that audits your website and provides actionable recommendations. Checks technical SEO, content quality, backlinks, and performance.\n\n## Analysis Areas\n- Technical SEO audit\n- Content quality scoring\n- Backlink analysis\n- Performance metrics\n- Competitor comparison\n- Weekly email reports",
      shortDescription: "Comprehensive SEO auditing with technical, content, and backlink analysis.",
      type: ProductType.SOFTWARE,
      price: 49,
      images: [
        "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: false,
      totalSales: 87,
      averageRating: 4.5,
      reviewCount: 12,
      licenseType: "Personal & Commercial",
      metadata: { platform: "Web (SaaS)", version: "3.1.0" },
      categoryId: softwareSub[1].id,
      tagSlugs: ["seo", "marketing", "saas"],
    },
    {
      creatorId: alexProfile.id,
      title: "Privacy Guard Extension",
      slug: "privacy-guard-extension",
      description: "Browser extension that blocks trackers, cleans cookies, and protects your privacy. Works on Chrome, Firefox, and Edge.\n\n## Protection Features\n- Tracker blocking (10,000+ rules)\n- Cookie auto-clean\n- Fingerprint protection\n- HTTPS enforcement\n- Privacy score dashboard",
      shortDescription: "Browser extension blocking trackers, cleaning cookies, protecting privacy.",
      type: ProductType.SOFTWARE,
      price: 12,
      images: [
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: false,
      totalSales: 312,
      averageRating: 4.6,
      reviewCount: 41,
      licenseType: "Personal",
      metadata: { platform: "Chrome, Firefox, Edge", version: "1.8.3" },
      categoryId: softwareSub[2].id,
      tagSlugs: ["productivity"],
    },
    {
      creatorId: alexProfile.id,
      title: "Full-Stack Masterclass",
      slug: "fullstack-masterclass",
      description: "Complete full-stack development course covering React, Node.js, PostgreSQL, and deployment. 40+ hours of video content with projects.\n\n## Curriculum\n1. React fundamentals & advanced patterns\n2. Node.js & Express API design\n3. PostgreSQL & Prisma ORM\n4. Authentication & authorization\n5. Testing strategies\n6. CI/CD & deployment\n7. Final capstone project",
      shortDescription: "40+ hour full-stack course: React, Node.js, PostgreSQL, and deployment.",
      type: ProductType.COURSE,
      price: 99,
      images: [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: true,
      totalSales: 534,
      averageRating: 4.9,
      reviewCount: 72,
      licenseType: "Personal",
      metadata: { lessons: 85, duration: "42 hours" },
      categoryId: coursesSub[0].id,
      tagSlugs: ["react", "nodejs", "typescript", "nextjs"],
    },
    {
      creatorId: sarahProfile.id,
      title: "UI/UX Design Bootcamp",
      slug: "ui-ux-design-bootcamp",
      description: "Learn modern UI/UX design from scratch. Covers Figma, design systems, user research, prototyping, and portfolio building.\n\n## Modules\n1. Design fundamentals\n2. Figma mastery\n3. Design systems\n4. User research methods\n5. Prototyping & testing\n6. Portfolio project",
      shortDescription: "Complete UI/UX design course: Figma, design systems, user research.",
      type: ProductType.COURSE,
      price: 79,
      images: [
        "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: false,
      totalSales: 267,
      averageRating: 4.7,
      reviewCount: 38,
      licenseType: "Personal",
      metadata: { lessons: 62, duration: "28 hours" },
      categoryId: coursesSub[1].id,
      tagSlugs: ["figma", "design-system"],
    },
    {
      creatorId: alexProfile.id,
      title: "Marketing Playbook",
      slug: "marketing-playbook",
      description: "Comprehensive digital marketing course covering SEO, content marketing, social media, email campaigns, and analytics.\n\n## Topics\n1. SEO fundamentals & advanced\n2. Content marketing strategy\n3. Social media playbook\n4. Email marketing automation\n5. Analytics & attribution\n6. Growth hacking techniques",
      shortDescription: "Digital marketing course: SEO, content, social media, email, analytics.",
      type: ProductType.COURSE,
      price: 59,
      images: [
        "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: false,
      totalSales: 178,
      averageRating: 4.4,
      reviewCount: 25,
      licenseType: "Personal",
      metadata: { lessons: 48, duration: "20 hours" },
      categoryId: coursesSub[2].id,
      tagSlugs: ["marketing", "seo"],
    },
    {
      creatorId: alexProfile.id,
      title: "API Access — Pro Tier",
      slug: "api-access-pro",
      description: "Pro-tier API access for our developer tools platform. Includes higher rate limits, priority support, and early access to new endpoints.\n\n## Pro Tier Includes\n- 10,000 requests/day (vs 1,000 free)\n- Priority support (< 4h response)\n- Early access to beta endpoints\n- Webhook support\n- Custom integrations",
      shortDescription: "Pro API access: 10K requests/day, priority support, early access.",
      type: ProductType.LICENSE,
      price: 19,
      images: [
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: false,
      totalSales: 423,
      averageRating: 4.6,
      reviewCount: 56,
      licenseType: "Subscription",
      metadata: { seats: 1, features: ["10K req/day", "Priority support", "Beta access"] },
      categoryId: licensesSub[0].id,
      tagSlugs: ["api", "nodejs"],
    },
    {
      creatorId: sarahProfile.id,
      title: "Team License — Design System",
      slug: "team-license-design-system",
      description: "Team license for the complete Seller Design System. Up to 25 seats with shared Figma library, component updates, and team support.\n\n## Team Benefits\n- Up to 25 team members\n- Shared Figma library\n- Quarterly component updates\n- Team Slack channel\n- Custom theme support",
      shortDescription: "25-seat team license for design system with Figma library and updates.",
      type: ProductType.LICENSE,
      price: 149,
      images: [
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
      ],
      status: ProductStatus.PUBLISHED,
      featured: false,
      totalSales: 34,
      averageRating: 4.8,
      reviewCount: 5,
      licenseType: "Team",
      metadata: { seats: 25, duration: "1 year", features: ["Figma library", "Updates", "Support"] },
      categoryId: licensesSub[1].id,
      tagSlugs: ["figma", "design-system"],
    },
  ];

  for (const data of productsData) {
    const { categoryId, tagSlugs, ...productData } = data;
    const product = await prisma.product.create({
      data: {
        ...productData,
        price: productData.price,
        compareAtPrice: productData.compareAtPrice ?? null,
      },
    });

    await prisma.categoriesOnProducts.create({
      data: { productId: product.id, categoryId },
    });

    for (const slug of tagSlugs) {
      await prisma.tagsOnProducts.create({
        data: { productId: product.id, tagId: tags[slug].id },
      });
    }
  }

  // ─── Collections ───────────────────────────────────
  const allProducts = await prisma.product.findMany({ where: { status: "PUBLISHED" } });

  await prisma.collection.create({
    data: {
      title: "Staff Picks",
      slug: "staff-picks",
      description: "Hand-selected by our team for exceptional quality and value.",
      featured: true,
      sortOrder: 0,
      products: {
        create: allProducts
          .filter((p) => p.featured)
          .map((p, i) => ({ productId: p.id, sortOrder: i })),
      },
    },
  });

  await prisma.collection.create({
    data: {
      title: "Developer Essentials",
      slug: "developer-essentials",
      description: "Must-have tools and resources for modern developers.",
      featured: true,
      sortOrder: 1,
      products: {
        create: allProducts
          .filter((p) => p.type === "SOFTWARE" || p.type === "TEMPLATE")
          .slice(0, 6)
          .map((p, i) => ({ productId: p.id, sortOrder: i })),
      },
    },
  });

  // ─── Sample Reviews ────────────────────────────────
  const publishedProducts = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    take: 5,
  });

  for (const product of publishedProducts) {
    await prisma.review.create({
      data: {
        userId: buyer.id,
        productId: product.id,
        rating: 5,
        title: "Excellent quality!",
        body: "This product exceeded my expectations. Great documentation and the code quality is top-notch. Highly recommended.",
        helpful: 12,
      },
    });
  }

  console.log("Seed complete: 4 users, 2 creator profiles, 15 products, 5 categories (15 subcategories), 20 tags, 2 collections, 5 reviews");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 2: Install bcryptjs for password hashing**

```bash
cd /home/ubuntu/seller && npm install bcryptjs && npm install -D @types/bcryptjs
```

- [ ] **Step 3: Add seed script to package.json**

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

Also install tsx:

```bash
cd /home/ubuntu/seller && npm install -D tsx
```

- [ ] **Step 4: Run seed**

```bash
cd /home/ubuntu/seller && npx prisma db seed
```

Expected output: "Seed complete: 4 users, 2 creator profiles, 15 products, 5 categories (15 subcategories), 20 tags, 2 collections, 5 reviews"

- [ ] **Step 5: Commit**

```bash
cd /home/ubuntu/seller
git add prisma/seed.ts package.json package-lock.json
git commit -m "feat: seed data with 15 products, categories, tags, users, collections, reviews"
```

---

## Task 4: Utility Functions & Validators

**Files:**
- Create: `lib/utils.ts`, `lib/validators.ts`

- [ ] **Step 1: Create utility functions**

Create `lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string, currency = "USD"): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numPrice);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
```

- [ ] **Step 2: Create Zod validators**

Create `lib/validators.ts`:

```ts
import { z } from "zod";

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(["TEMPLATE", "SOFTWARE", "ASSET", "COURSE", "LICENSE", "OTHER"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "popular", "rating"]).optional(),
  page: z.coerce.number().min(1).optional().default(1),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/seller
git add lib/utils.ts lib/validators.ts
git commit -m "feat: utility functions (cn, formatPrice, slugify) and Zod validators"
```

---

## Task 5: UI Component Library

**Files:**
- Create: `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/badge.tsx`, `components/ui/card.tsx`, `components/ui/modal.tsx`, `components/ui/toast.tsx`, `components/ui/skeleton.tsx`, `components/ui/rating-stars.tsx`

- [ ] **Step 1: Create Button component**

Create `components/ui/button.tsx`:

```tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md":
              variant === "primary",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80":
              variant === "secondary",
            "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground":
              variant === "outline",
            "bg-transparent hover:bg-accent hover:text-accent-foreground":
              variant === "ghost",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90":
              variant === "destructive",
          },
          {
            "h-8 px-3 text-sm gap-1.5": size === "sm",
            "h-10 px-4 text-sm gap-2": size === "md",
            "h-12 px-6 text-base gap-2.5": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps };
```

- [ ] **Step 2: Create Input component**

Create `components/ui/input.tsx`:

```tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive/50",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
export type { InputProps };
```

- [ ] **Step 3: Create Badge component**

Create `components/ui/badge.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-primary text-primary-foreground": variant === "default",
          "bg-secondary text-secondary-foreground": variant === "secondary",
          "border border-border text-foreground": variant === "outline",
          "bg-success/10 text-success": variant === "success",
          "bg-warning/10 text-warning": variant === "warning",
          "bg-destructive/10 text-destructive": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps };
```

- [ ] **Step 4: Create Card component**

Create `components/ui/card.tsx`:

```tsx
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-0", className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0 flex items-center", className)} {...props} />;
}

export { Card, CardHeader, CardContent, CardFooter };
```

- [ ] **Step 5: Create Modal component**

Create `components/ui/modal.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

function Modal({ open, onClose, children, className, title }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-lg bg-background border border-border shadow-lg",
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between p-6 pb-0">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-sm p-1 hover:bg-accent transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export { Modal };
```

- [ ] **Step 6: Create Toast component**

Create `components/ui/toast.tsx`:

```tsx
"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-4 py-3 shadow-lg bg-background min-w-[300px]",
                  {
                    "border-success/30": t.type === "success",
                    "border-destructive/30": t.type === "error",
                    "border-primary/30": t.type === "info",
                  }
                )}
              >
                <Icon
                  className={cn("h-4 w-4 shrink-0", {
                    "text-success": t.type === "success",
                    "text-destructive": t.type === "error",
                    "text-primary": t.type === "info",
                  })}
                />
                <span className="text-sm flex-1">{t.message}</span>
                <button onClick={() => dismiss(t.id)} className="shrink-0 p-0.5 hover:bg-accent rounded">
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 7: Create Skeleton component**

Create `components/ui/skeleton.tsx`:

```tsx
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
```

- [ ] **Step 8: Create RatingStars component**

Create `components/ui/rating-stars.tsx`:

```tsx
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: "sm" | "md";
}

function RatingStars({ rating, count, size = "sm" }: RatingStarsProps) {
  const numRating = typeof rating === "string" ? parseFloat(rating) : rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "fill-current",
              size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5",
              star <= Math.round(numRating) ? "text-warning" : "text-muted/30"
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
          ({count})
        </span>
      )}
    </div>
  );
}

export { RatingStars };
```

- [ ] **Step 9: Commit**

```bash
cd /home/ubuntu/seller
git add components/ui/
git commit -m "feat: UI component library — Button, Input, Badge, Card, Modal, Toast, Skeleton, RatingStars"
```

---

## Task 6: Layout Components (Header, Footer, Search, Theme Toggle)

**Files:**
- Create: `components/layout/header.tsx`, `components/layout/footer.tsx`, `components/layout/search-bar.tsx`, `components/layout/theme-toggle.tsx`
- Create: `app/(storefront)/layout.tsx`

- [ ] **Step 1: Create ThemeToggle component**

Create `components/layout/theme-toggle.tsx`:

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-9 w-9 rounded-sm flex items-center justify-center hover:bg-accent transition-colors"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, scale: 1 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </motion.div>
    </button>
  );
}
```

- [ ] **Step 2: Create SearchBar component**

Create `components/layout/search-bar.tsx`:

```tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  type: string;
  price: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.products || []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      setFocused(false);
    }
  };

  const handleSelect = (slug: string) => {
    router.push(`/products/${slug}`);
    setFocused(false);
    setQuery("");
  };

  const showDropdown = focused && query.length >= 2;

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <motion.input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search products..."
            className={cn(
              "h-10 rounded-sm border border-input bg-background pl-10 pr-10 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
              focused ? "w-[400px]" : "w-[300px]"
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-md border border-border bg-background shadow-lg overflow-hidden z-50"
          >
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              <div className="py-1">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result.slug)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                  >
                    <div>
                      <div className="font-medium">{result.title}</div>
                      <div className="text-xs text-muted-foreground">{result.type}</div>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {result.price}
                    </span>
                  </button>
                ))}
                <div className="border-t border-border">
                  <button
                    onClick={handleSubmit as () => void}
                    className="w-full px-4 py-2 text-xs text-primary hover:bg-accent transition-colors text-left"
                  >
                    View all results for &ldquo;{query}&rdquo;
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No products found for &ldquo;{query}&rdquo;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 3: Create Header component**

Create `components/layout/header.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/products?type=TEMPLATE", label: "Templates" },
  { href: "/products?type=SOFTWARE", label: "Software" },
  { href: "/products?type=ASSET", label: "Assets" },
  { href: "/products?type=COURSE", label: "Courses" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              Seller<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "?");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-colors rounded-sm",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-x-1 -bottom-[13px] h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search (desktop) */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-accent rounded-sm transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatedMobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}

function AnimatedMobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <motion.div
      initial={false}
      animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="lg:hidden overflow-hidden border-t border-border"
    >
      <nav className="flex flex-col px-4 py-3 gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}
```

- [ ] **Step 4: Create Footer component**

Create `components/layout/footer.tsx`:

```tsx
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const footerLinks = {
  Products: [
    { href: "/products?type=TEMPLATE", label: "Templates" },
    { href: "/products?type=SOFTWARE", label: "Software" },
    { href: "/products?type=ASSET", label: "Assets" },
    { href: "/products?type=COURSE", label: "Courses" },
    { href: "/products?type=LICENSE", label: "Licenses" },
  ],
  Company: [
    { href: "#", label: "About" },
    { href: "#", label: "Blog" },
    { href: "#", label: "Careers" },
    { href: "#", label: "Contact" },
  ],
  Support: [
    { href: "#", label: "Help Center" },
    { href: "#", label: "Refund Policy" },
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "Privacy Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">Seller<span className="text-primary">.</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium digital products for developers, designers, and creators.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Seller. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Create storefront layout**

Create `app/(storefront)/layout.tsx`:

```tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
```

- [ ] **Step 6: Commit**

```bash
cd /home/ubuntu/seller
git add components/layout/ app/\(storefront\)/layout.tsx
git commit -m "feat: layout components — Header with search, Footer, ThemeToggle, SearchBar, storefront layout"
```

---

## Task 7: Search API Route

**Files:**
- Create: `app/api/search/route.ts`

- [ ] **Step 1: Create search API**

Create `app/api/search/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") || "popular";
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
    ];
  }

  if (category) {
    where.categories = { some: { category: { slug: category } } };
  }

  if (type) {
    where.type = type;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
    if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
  }

  const orderBy: Record<string, string> = (() => {
    switch (sort) {
      case "newest": return { createdAt: "desc" };
      case "price-asc": return { price: "asc" };
      case "price-desc": return { price: "desc" };
      case "rating": return { averageRating: "desc" };
      case "popular":
      default: return { totalSales: "desc" };
    }
  })();

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        type: true,
        price: true,
        currency: true,
        compareAtPrice: true,
        images: true,
        featured: true,
        totalSales: true,
        averageRating: true,
        reviewCount: true,
        creator: {
          select: { storeName: true, slug: true, verified: true },
        },
        categories: {
          select: { category: { select: { name: true, slug: true } } },
        },
        tags: {
          select: { tag: { select: { name: true, slug: true } } },
        },
      },
    }),
    db.product.count({ where }),
  ]);

  const formatted = products.map((p) => ({
    ...p,
    price: formatPrice(Number(p.price), p.currency),
    compareAtPrice: p.compareAtPrice ? formatPrice(Number(p.compareAtPrice), p.currency) : null,
    averageRating: Number(p.averageRating),
    categories: p.categories.map((c) => c.category),
    tags: p.tags.map((t) => t.tag),
  }));

  return NextResponse.json({
    products: formatted,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/ubuntu/seller
git add app/api/search/route.ts
git commit -m "feat: search API with filtering, sorting, pagination"
```

---

## Task 8: Product Components

**Files:**
- Create: `components/product/product-card.tsx`, `components/product/product-grid.tsx`, `components/product/product-filters.tsx`, `components/product/product-gallery.tsx`, `components/product/product-type-badge.tsx`

- [ ] **Step 1: Create ProductTypeBadge component**

Create `components/product/product-type-badge.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";
import { Layout, Code, Palette, GraduationCap, Key, Package } from "lucide-react";

const typeConfig: Record<string, { icon: React.ElementType; label: string }> = {
  TEMPLATE: { icon: Layout, label: "Template" },
  SOFTWARE: { icon: Code, label: "Software" },
  ASSET: { icon: Palette, label: "Asset" },
  COURSE: { icon: GraduationCap, label: "Course" },
  LICENSE: { icon: Key, label: "License" },
  OTHER: { icon: Package, label: "Other" },
};

export function ProductTypeBadge({ type }: { type: string }) {
  const config = typeConfig[type] || typeConfig.OTHER;
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
```

- [ ] **Step 2: Create ProductCard component**

Create `components/product/product-card.tsx`:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Eye } from "lucide-react";
import { RatingStars } from "@/components/ui/rating-stars";
import { ProductTypeBadge } from "./product-type-badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    shortDescription?: string | null;
    type: string;
    price: string;
    compareAtPrice?: string | null;
    images: string[];
    featured: boolean;
    totalSales: number;
    averageRating: number;
    reviewCount: number;
    creator: { storeName: string; slug: string; verified: boolean };
  };
  layout?: "grid" | "list";
}

export function ProductCard({ product, layout = "grid" }: ProductCardProps) {
  if (layout === "list") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="group"
      >
        <Link
          href={`/products/${product.slug}`}
          className="flex gap-4 p-4 rounded-md border border-border bg-card hover:shadow-md transition-shadow"
        >
          <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-sm bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm truncate">{product.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{product.creator.storeName}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono font-semibold text-sm">{product.price}</div>
                {product.compareAtPrice && (
                  <div className="font-mono text-xs text-muted-foreground line-through">
                    {product.compareAtPrice}
                  </div>
                )}
              </div>
            </div>
            {product.shortDescription && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {product.shortDescription}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <ProductTypeBadge type={product.type} />
              <RatingStars rating={product.averageRating} count={product.reviewCount} />
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="rounded-md border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No image
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

            {/* Quick actions */}
            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => { e.preventDefault(); }}
                className="h-8 w-8 rounded-full bg-background/90 flex items-center justify-center hover:bg-background shadow-sm transition-colors"
              >
                <Heart className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); }}
                className="h-8 w-8 rounded-full bg-background/90 flex items-center justify-center hover:bg-background shadow-sm transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Featured badge */}
            {product.featured && (
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-primary text-primary-foreground rounded-full">
                  Featured
                </span>
              </div>
            )}

            {/* Type badge */}
            <div className="absolute bottom-3 left-3">
              <ProductTypeBadge type={product.type} />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{product.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {product.creator.storeName}
                  {product.creator.verified && (
                    <span className="ml-1 text-primary" title="Verified">✓</span>
                  )}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono font-semibold text-sm">{product.price}</div>
                {product.compareAtPrice && (
                  <div className="font-mono text-[10px] text-muted-foreground line-through">
                    {product.compareAtPrice}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <RatingStars rating={product.averageRating} count={product.reviewCount} />
              <span className="text-[10px] text-muted-foreground">
                {product.totalSales.toLocaleString()} sales
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
```

- [ ] **Step 3: Create ProductGrid component**

Create `components/product/product-grid.tsx`:

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Array<{
    id: string;
    title: string;
    slug: string;
    shortDescription?: string | null;
    type: string;
    price: string;
    compareAtPrice?: string | null;
    images: string[];
    featured: boolean;
    totalSales: number;
    averageRating: number;
    reviewCount: number;
    creator: { storeName: string; slug: string; verified: boolean };
  }>;
  showToggle?: boolean;
}

export function ProductGrid({ products, showToggle = true }: ProductGridProps) {
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  return (
    <div>
      {showToggle && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1 border border-border rounded-sm p-0.5">
            <button
              onClick={() => setLayout("grid")}
              className={cn(
                "p-1.5 rounded-sm transition-colors",
                layout === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLayout("list")}
              className={cn(
                "p-1.5 rounded-sm transition-colors",
                layout === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <motion.div
        layout
        className={cn(
          layout === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-3"
        )}
      >
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <ProductCard product={product} layout={layout} />
          </motion.div>
        ))}
      </motion.div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create ProductFilters component**

Create `components/product/product-filters.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface ProductFiltersProps {
  categories: FilterOption[];
  tags: FilterOption[];
}

const productTypes: FilterOption[] = [
  { label: "Templates", value: "TEMPLATE" },
  { label: "Software", value: "SOFTWARE" },
  { label: "Assets", value: "ASSET" },
  { label: "Courses", value: "COURSE" },
  { label: "Licenses", value: "LICENSE" },
];

const priceRanges: FilterOption[] = [
  { label: "Under $25", value: "0-25" },
  { label: "$25 - $50", value: "25-50" },
  { label: "$50 - $100", value: "50-100" },
  { label: "$100+", value: "100-999999" },
];

const sortOptions: FilterOption[] = [
  { label: "Most Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Highest Rated", value: "rating" },
];

export function ProductFilters({ categories, tags }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type");
  const currentCategory = searchParams.get("category");
  const currentSort = searchParams.get("sort") || "popular";
  const currentMinPrice = searchParams.get("minPrice");
  const currentMaxPrice = searchParams.get("maxPrice");

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const setPriceRange = useCallback(
    (range: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (range === null) {
        params.delete("minPrice");
        params.delete("maxPrice");
      } else {
        const [min, max] = range.split("-");
        params.set("minPrice", min);
        params.set("maxPrice", max);
      }
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(`/products?${params.toString()}`);
  }, [router, searchParams]);

  const hasFilters = currentType || currentCategory || currentMinPrice || currentMaxPrice;
  const currentPriceRange = currentMinPrice && currentMaxPrice ? `${currentMinPrice}-${currentMaxPrice}` : null;

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* Active filters */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Active Filters</span>
              <button onClick={clearAll} className="text-xs text-primary hover:underline">
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentType && (
                <FilterChip label={currentType} onRemove={() => updateParam("type", null)} />
              )}
              {currentCategory && (
                <FilterChip label={currentCategory} onRemove={() => updateParam("category", null)} />
              )}
              {currentPriceRange && (
                <FilterChip label={`$${currentMinPrice}-$${currentMaxPrice}`} onRemove={() => setPriceRange(null)} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort */}
      <FilterSection title="Sort By">
        {sortOptions.map((opt) => (
          <FilterButton
            key={opt.value}
            label={opt.label}
            active={currentSort === opt.value}
            onClick={() => updateParam("sort", opt.value)}
          />
        ))}
      </FilterSection>

      {/* Type */}
      <FilterSection title="Product Type">
        {productTypes.map((opt) => (
          <FilterButton
            key={opt.value}
            label={opt.label}
            active={currentType === opt.value}
            onClick={() => updateParam("type", currentType === opt.value ? null : opt.value)}
          />
        ))}
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        {categories.map((opt) => (
          <FilterButton
            key={opt.value}
            label={opt.label}
            active={currentCategory === opt.value}
            onClick={() => updateParam("category", currentCategory === opt.value ? null : opt.value)}
          />
        ))}
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range">
        {priceRanges.map((opt) => (
          <FilterButton
            key={opt.value}
            label={opt.label}
            active={currentPriceRange === opt.value}
            onClick={() => setPriceRange(currentPriceRange === opt.value ? null : opt.value)}
          />
        ))}
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-1.5 text-sm rounded-sm transition-colors",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      {label}
    </button>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
    >
      {label}
      <button onClick={onRemove} className="hover:bg-primary/20 rounded-full p-0.5">
        <X className="h-2.5 w-2.5" />
      </button>
    </motion.span>
  );
}
```

- [ ] **Step 5: Create ProductGallery component**

Create `components/product/product-gallery.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        No images available
      </div>
    );
  }

  const navigate = (dir: 1 | -1) => {
    setSelectedIndex((prev) => (prev + dir + images.length) % images.length);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted cursor-zoom-in group"
          onClick={() => setLightboxOpen(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={images[selectedIndex]}
                alt={`${title} - Image ${selectedIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={selectedIndex === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Zoom hint */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-70 transition-opacity" />
          </div>

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  "relative h-16 w-20 shrink-0 rounded-sm overflow-hidden border-2 transition-colors",
                  i === selectedIndex ? "border-primary" : "border-transparent hover:border-border"
                )}
              >
                <Image
                  src={img}
                  alt={`${title} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                  className="absolute left-4 p-2 text-white/70 hover:text-white"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(1); }}
                  className="absolute right-4 p-2 text-white/70 hover:text-white"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[85vh] max-w-[85vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedIndex]}
                alt={`${title} - Image ${selectedIndex + 1}`}
                width={1200}
                height={900}
                className="object-contain max-h-[85vh]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 6: Commit**

```bash
cd /home/ubuntu/seller
git add components/product/
git commit -m "feat: product components — ProductCard, ProductGrid, ProductFilters, ProductGallery, TypeBadge"
```

---

## Task 9: Homepage

**Files:**
- Create: `app/(storefront)/page.tsx`
- Create: `public/images/placeholder.svg`

- [ ] **Step 1: Create placeholder SVG**

Create `public/images/placeholder.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none">
  <rect width="800" height="600" fill="#f1f5f9"/>
  <path d="M380 260h40v80h-40z" fill="#cbd5e1"/>
  <circle cx="400" cy="240" r="30" fill="#cbd5e1"/>
</svg>
```

- [ ] **Step 2: Create homepage**

Create `app/(storefront)/page.tsx`:

```tsx
import Link from "next/link";
import { Search, ArrowRight, TrendingUp, Star, Zap, Layout, Code, Palette, GraduationCap, Key } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

const categoryIcons: Record<string, React.ElementType> = {
  templates: Layout,
  software: Code,
  assets: Palette,
  courses: GraduationCap,
  licenses: Key,
};

async function getFeaturedProducts() {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED", featured: true },
    take: 6,
    orderBy: { totalSales: "desc" },
    include: {
      creator: { select: { storeName: true, slug: true, verified: true } },
      categories: { select: { category: { select: { name: true, slug: true } } } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  });
  return products.map((p) => ({
    ...p,
    price: formatPrice(Number(p.price), p.currency),
    compareAtPrice: p.compareAtPrice ? formatPrice(Number(p.compareAtPrice), p.currency) : null,
    averageRating: Number(p.averageRating),
    categories: p.categories.map((c) => c.category),
    tags: p.tags.map((t) => t.tag),
  }));
}

async function getTrendingProducts() {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    take: 6,
    orderBy: { totalSales: "desc" },
    include: {
      creator: { select: { storeName: true, slug: true, verified: true } },
      categories: { select: { category: { select: { name: true, slug: true } } } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  });
  return products.map((p) => ({
    ...p,
    price: formatPrice(Number(p.price), p.currency),
    compareAtPrice: p.compareAtPrice ? formatPrice(Number(p.compareAtPrice), p.currency) : null,
    averageRating: Number(p.averageRating),
    categories: p.categories.map((c) => c.category),
    tags: p.tags.map((t) => t.tag),
  }));
}

async function getCategories() {
  return db.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

async function getPopularTags() {
  const tags = await db.tag.findMany({
    take: 12,
    include: { _count: { select: { products: true } } },
    orderBy: { products: { _count: "desc" } },
  });
  return tags;
}

async function getStats() {
  const [productCount, creatorCount, totalSales] = await Promise.all([
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.creatorProfile.count({ where: { verified: true } }),
    db.product.aggregate({ _sum: { totalSales: true } }),
  ]);
  return {
    products: productCount,
    creators: creatorCount,
    sales: totalSales._sum.totalSales || 0,
  };
}

export default async function HomePage() {
  const [featured, trending, categories, tags, stats] = await Promise.all([
    getFeaturedProducts(),
    getTrendingProducts(),
    getCategories(),
    getPopularTags(),
    getStats(),
  ]);

  return (
    <div>
      {/* Hero — Search First */}
      <section className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Find the perfect{" "}
            <span className="text-primary">digital product</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium templates, software, assets, courses, and licenses from verified creators.
          </p>

          {/* Search */}
          <form action="/products" className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                name="q"
                placeholder="Search templates, tools, courses..."
                className="w-full h-14 rounded-lg border-2 border-border bg-background pl-12 pr-4 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
              <Button type="submit" size="lg" className="absolute right-2 top-1/2 -translate-y-1/2">
                Search
              </Button>
            </div>
          </form>

          {/* Trending tags */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {tags.slice(0, 8).map((tag) => (
              <Link
                key={tag.id}
                href={`/products?q=${tag.name}`}
                className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Layout;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="flex flex-col items-center gap-3 p-6 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{cat.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {cat._count.products} product{cat._count.products !== 1 ? "s" : ""}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                Featured Products
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Hand-picked by our team</p>
            </div>
            <Link href="/products?featured=true" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-16 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trending Now
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Most popular this week</p>
            </div>
            <Link href="/products?sort=popular" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">{stats.products.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground mt-1">Digital Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.creators.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground mt-1">Verified Creators</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.sales.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground mt-1">Products Sold</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Start selling your digital products</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            Join verified creators and reach thousands of buyers. Zero upfront costs.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Become a Creator
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/seller
git add app/\(storefront\)/page.tsx public/images/
git commit -m "feat: homepage with search-first hero, categories, featured, trending, stats, CTA"
```

---

## Task 10: Product Listing Page

**Files:**
- Create: `app/(storefront)/products/page.tsx`

- [ ] **Step 1: Create product listing page**

Create `app/(storefront)/products/page.tsx`:

```tsx
import { Suspense } from "react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilters } from "@/components/product/product-filters";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

async function getProducts(params: Awaited<PageProps["searchParams"]>) {
  const { q, category, type, minPrice, maxPrice, sort = "popular", page = "1" } = params;
  const limit = 12;
  const offset = (Math.max(parseInt(page), 1) - 1) * limit;

  const where: Record<string, unknown> = { status: "PUBLISHED" };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
    ];
  }
  if (category) where.categories = { some: { category: { slug: category } } };
  if (type) where.type = type;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
    if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
  }

  const orderBy: Record<string, string> = (() => {
    switch (sort) {
      case "newest": return { createdAt: "desc" };
      case "price-asc": return { price: "asc" };
      case "price-desc": return { price: "desc" };
      case "rating": return { averageRating: "desc" };
      default: return { totalSales: "desc" };
    }
  })();

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        creator: { select: { storeName: true, slug: true, verified: true } },
        categories: { select: { category: { select: { name: true, slug: true } } } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
      },
    }),
    db.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      ...p,
      price: formatPrice(Number(p.price), p.currency),
      compareAtPrice: p.compareAtPrice ? formatPrice(Number(p.compareAtPrice), p.currency) : null,
      averageRating: Number(p.averageRating),
      categories: p.categories.map((c) => c.category),
      tags: p.tags.map((t) => t.tag),
    })),
    total,
    totalPages: Math.ceil(total / limit),
    page: parseInt(page),
  };
}

async function getFilterData() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const tags = await db.tag.findMany({
    orderBy: { products: { _count: "desc" } },
    take: 20,
  });

  return {
    categories: categories.map((c) => ({ label: c.name, value: c.slug, count: c._count.products })),
    tags: tags.map((t) => ({ label: t.name, value: t.slug })),
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [{ products, total, totalPages, page }, filters] = await Promise.all([
    getProducts(params),
    getFilterData(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {params.q ? `Results for "${params.q}"` : "All Products"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} product{total !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <Suspense fallback={<Skeleton className="w-64 h-96" />}>
          <ProductFilters categories={filters.categories} tags={filters.tags} />
        </Suspense>

        {/* Product grid */}
        <div className="flex-1">
          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/products?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
                  className={`h-9 w-9 flex items-center justify-center rounded-sm text-sm transition-colors ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-accent"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/ubuntu/seller
git add app/\(storefront\)/products/page.tsx
git commit -m "feat: product listing page with filters, search, grid/list toggle, pagination"
```

---

## Task 11: Product Detail Page

**Files:**
- Create: `app/(storefront)/products/[slug]/page.tsx`

- [ ] **Step 1: Create product detail page**

Create `app/(storefront)/products/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Shield, CheckCircle, Clock, Users, Star } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice, timeAgo } from "@/lib/utils";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductTypeBadge } from "@/components/product/product-type-badge";
import { ProductCard } from "@/components/product/product-card";
import { RatingStars } from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      creator: { select: { storeName: true, slug: true, verified: true, bio: true, avatar: true } },
      categories: { select: { category: { select: { name: true, slug: true } } } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      files: { select: { fileName: true, fileSize: true, version: true } },
    },
  });

  if (!product || product.status !== "PUBLISHED") return null;
  return product;
}

async function getRelatedProducts(productId: string, categorySlug: string | undefined) {
  const products = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: productId },
      ...(categorySlug
        ? { categories: { some: { category: { slug: categorySlug } } } }
        : {}),
    },
    take: 3,
    orderBy: { totalSales: "desc" },
    include: {
      creator: { select: { storeName: true, slug: true, verified: true } },
      categories: { select: { category: { select: { name: true, slug: true } } } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  });

  return products.map((p) => ({
    ...p,
    price: formatPrice(Number(p.price), p.currency),
    compareAtPrice: p.compareAtPrice ? formatPrice(Number(p.compareAtPrice), p.currency) : null,
    averageRating: Number(p.averageRating),
    categories: p.categories.map((c) => c.category),
    tags: p.tags.map((t) => t.tag),
  }));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const categorySlug = product.categories[0]?.category.slug;
  const related = await getRelatedProducts(product.id, categorySlug);

  const price = formatPrice(Number(product.price), product.currency);
  const compareAtPrice = product.compareAtPrice
    ? formatPrice(Number(product.compareAtPrice), product.currency)
    : null;
  const discount = product.compareAtPrice
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : null;

  const metadata = product.metadata as Record<string, unknown> | null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/products"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <ProductGallery images={product.images} title={product.title} />

        {/* Product Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ProductTypeBadge type={product.type} />
            {product.featured && <Badge variant="default">Featured</Badge>}
          </div>

          <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>

          <div className="flex items-center gap-3 mt-3">
            <RatingStars rating={Number(product.averageRating)} count={product.reviewCount} size="md" />
            <span className="text-sm text-muted-foreground">
              {product.totalSales.toLocaleString()} sales
            </span>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-2 mt-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              {product.creator.storeName.charAt(0)}
            </div>
            <div>
              <span className="text-sm font-medium">{product.creator.storeName}</span>
              {product.creator.verified && (
                <CheckCircle className="inline h-3.5 w-3.5 text-primary ml-1" />
              )}
            </div>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold font-mono">{price}</span>
            {compareAtPrice && (
              <>
                <span className="text-lg text-muted-foreground font-mono line-through">{compareAtPrice}</span>
                <Badge variant="success">-{discount}%</Badge>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="mt-6 space-y-3">
            <Button size="lg" className="w-full text-base">
              Buy Now — {price}
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              Add to Wishlist
            </Button>
          </div>

          {/* Trust signals */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Download className="h-4 w-4" />
              Instant download
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Secure checkout
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Lifetime access
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {product.licenseType || "Standard"} license
            </div>
          </div>

          {/* License */}
          {product.licenseType && (
            <div className="mt-6 p-4 rounded-md bg-secondary/50 border border-border">
              <h3 className="text-sm font-semibold mb-1">License: {product.licenseType}</h3>
              {product.licenseTerms && (
                <p className="text-xs text-muted-foreground">{product.licenseTerms}</p>
              )}
            </div>
          )}

          {/* Files */}
          {product.files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Included Files</h3>
              <div className="space-y-1.5">
                {product.files.map((file) => (
                  <div
                    key={file.fileName}
                    className="flex items-center justify-between text-sm p-2 rounded-sm bg-secondary/30"
                  >
                    <span>{file.fileName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.fileSize)} · v{file.version}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>{" "}
                    <span className="font-medium">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {product.tags.map(({ tag }) => (
                <Link
                  key={tag.slug}
                  href={`/products?q=${tag.name}`}
                  className="px-2.5 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-16 max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Description</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
          {product.description}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Star className="h-5 w-5 text-warning" />
          Reviews ({product.reviewCount})
        </h2>

        {product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-md border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {review.user.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{review.user.name}</div>
                    <div className="text-xs text-muted-foreground">{timeAgo(review.createdAt)}</div>
                  </div>
                  <div className="ml-auto">
                    <RatingStars rating={review.rating} />
                  </div>
                </div>
                {review.title && <h4 className="font-medium text-sm">{review.title}</h4>}
                {review.body && <p className="text-sm text-muted-foreground mt-1">{review.body}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/ubuntu/seller
git add app/\(storefront\)/products/\[slug\]/page.tsx
git commit -m "feat: product detail page with gallery, info, reviews, related products"
```

---

## Task 12: Auth System

**Files:**
- Create: `lib/auth.ts`, `lib/auth-client.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`

- [ ] **Step 1: Create NextAuth config**

Create `lib/auth.ts`:

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const valid = await compare(credentials.password as string, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db.user.findUnique({ where: { id: user.id! } });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
```

- [ ] **Step 2: Create auth type augmentation**

Create `lib/auth-client.ts`:

```ts
import { useSession, signIn, signOut } from "next-auth/react";

export { useSession, signIn, signOut };

// Type augmentation for next-auth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
```

- [ ] **Step 3: Create NextAuth route handler**

Create `app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 4: Create auth layout**

Create `app/(auth)/layout.tsx`:

```tsx
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <ShoppingBag className="h-7 w-7 text-primary" />
        <span className="text-2xl font-bold">Seller<span className="text-primary">.</span></span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
```

- [ ] **Step 5: Create login page**

Create `app/(auth)/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Sign in to your account
      </p>

      {/* Google OAuth */}
      <Button
        variant="outline"
        className="w-full mb-4"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-sm bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Create register page**

Create `app/(auth)/register/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2">Create an account</h1>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Start discovering premium digital products
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-sm bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <Input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Create register API route**

Create `app/api/auth/register/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    await db.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 8: Add SessionProvider to root layout**

Update `app/layout.tsx` to wrap with SessionProvider. Add a new file:

Create `components/layout/session-provider.tsx`:

```tsx
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

Then update `app/layout.tsx` to include it (wrap `ThemeProvider` children with `SessionProvider`):

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SessionProvider } from "@/components/layout/session-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Seller — Premium Digital Products",
  description:
    "Discover and purchase premium digital products: templates, software, assets, courses, and licenses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Commit**

```bash
cd /home/ubuntu/seller
git add lib/auth.ts lib/auth-client.ts app/api/auth/ app/\(auth\)/ components/layout/session-provider.tsx app/layout.tsx
git commit -m "feat: auth system — NextAuth v5 with credentials + Google OAuth, login/register pages"
```

---

## Task 13: Dockerfile & Docker Compose for Production

**Files:**
- Create: `Dockerfile`
- Modify: `docker-compose.yml`

- [ ] **Step 1: Create Dockerfile**

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

- [ ] **Step 2: Update next.config.ts for standalone output**

Update `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 3: Update docker-compose.yml with app service**

Replace `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: seller
      POSTGRES_PASSWORD: seller
      POSTGRES_DB: seller
    ports:
      - "5433:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://seller:seller@db:5432/seller?schema=public"
      NEXTAUTH_URL: "http://localhost:3000"
      NEXTAUTH_SECRET: "${NEXTAUTH_SECRET}"
    depends_on:
      - db
    volumes:
      - uploads:/app/uploads

volumes:
  pgdata:
  uploads:
```

- [ ] **Step 4: Commit**

```bash
cd /home/ubuntu/seller
git add Dockerfile docker-compose.yml next.config.ts
git commit -m "feat: Dockerfile with multi-stage build, docker-compose with app + db services"
```

---

## Task 14: Verify & Final Smoke Test

- [ ] **Step 1: Ensure PostgreSQL is running**

```bash
cd /home/ubuntu/seller && docker compose up -d db
```

- [ ] **Step 2: Run migration and seed**

```bash
cd /home/ubuntu/seller
npx prisma migrate dev --name init
npx prisma db seed
```

- [ ] **Step 3: Start dev server and verify**

```bash
cd /home/ubuntu/seller && npm run dev
```

Check the following URLs:
- `http://localhost:3000` — Homepage loads with search bar, categories, featured products
- `http://localhost:3000/products` — Product listing with filters and grid
- `http://localhost:3000/products/starter-ui-kit` — Product detail page
- `http://localhost:3000/login` — Login page
- `http://localhost:3000/register` — Register page
- Dark mode toggle works
- Search bar shows suggestions
- Responsive layout on mobile width

- [ ] **Step 4: Final commit**

```bash
cd /home/ubuntu/seller
git add -A
git commit -m "chore: final Phase 1 cleanup and verification"
```

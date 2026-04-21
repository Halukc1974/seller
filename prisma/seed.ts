import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

function createClient() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

async function main() {
  // ── Clean existing data (reverse dependency order) ────────────────────────
  await prisma.userEvent.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.collectionsOnProducts.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.tagsOnProducts.deleteMany();
  await prisma.categoriesOnProducts.deleteMany();
  await prisma.productFile.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.verificationToken.deleteMany();

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 10);
  const creatorPassword = await bcrypt.hash("creator123", 10);
  const buyerPassword = await bcrypt.hash("buyer123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@seller.io",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const sarah = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah@seller.io",
      password: creatorPassword,
      role: "CREATOR",
      emailVerified: new Date(),
    },
  });

  const alex = await prisma.user.create({
    data: {
      name: "Alex Morgan",
      email: "alex@seller.io",
      password: creatorPassword,
      role: "CREATOR",
      emailVerified: new Date(),
    },
  });

  const buyer = await prisma.user.create({
    data: {
      name: "Test Buyer",
      email: "buyer@seller.io",
      password: buyerPassword,
      role: "BUYER",
      emailVerified: new Date(),
    },
  });

  // ── Creator Profiles ──────────────────────────────────────────────────────
  const sarahProfile = await prisma.creatorProfile.create({
    data: {
      userId: sarah.id,
      storeName: "Sarah's Design Studio",
      slug: "sarah-design",
      bio: "Professional UI/UX designer with 8+ years of experience creating beautiful digital products. Specializing in design systems, UI kits, and creative assets.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      banner: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop",
      verified: true,
      payoutEmail: "sarah@seller.io",
    },
  });

  const alexProfile = await prisma.creatorProfile.create({
    data: {
      userId: alex.id,
      storeName: "Morgan Dev Tools",
      slug: "morgan-dev",
      bio: "Full-stack developer building productivity tools and developer utilities. Passionate about clean code, great DX, and helping developers ship faster.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      banner: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop",
      verified: true,
      payoutEmail: "alex@seller.io",
    },
  });

  // ── Parent Categories ─────────────────────────────────────────────────────
  const catTemplates = await prisma.category.create({
    data: { name: "Templates", slug: "templates", sortOrder: 1 },
  });
  const catSoftware = await prisma.category.create({
    data: { name: "Software", slug: "software", sortOrder: 2 },
  });
  const catAssets = await prisma.category.create({
    data: { name: "Assets", slug: "assets", sortOrder: 3 },
  });
  const catCourses = await prisma.category.create({
    data: { name: "Courses", slug: "courses", sortOrder: 4 },
  });
  const catLicenses = await prisma.category.create({
    data: { name: "Licenses", slug: "licenses", sortOrder: 5 },
  });

  // ── Subcategories ─────────────────────────────────────────────────────────
  // Under Templates
  const subUiKits = await prisma.category.create({
    data: { name: "UI Kits", slug: "ui-kits", parentId: catTemplates.id, sortOrder: 1 },
  });
  const subDashboards = await prisma.category.create({
    data: { name: "Dashboards", slug: "dashboards", parentId: catTemplates.id, sortOrder: 2 },
  });
  const subWebsites = await prisma.category.create({
    data: { name: "Websites", slug: "websites", parentId: catTemplates.id, sortOrder: 3 },
  });
  // Under Software
  const subDevTools = await prisma.category.create({
    data: { name: "Dev Tools", slug: "dev-tools", parentId: catSoftware.id, sortOrder: 1 },
  });
  const subMarketing = await prisma.category.create({
    data: { name: "Marketing", slug: "marketing", parentId: catSoftware.id, sortOrder: 2 },
  });
  const subUtilities = await prisma.category.create({
    data: { name: "Utilities", slug: "utilities", parentId: catSoftware.id, sortOrder: 3 },
  });
  // Under Assets
  const subIcons = await prisma.category.create({
    data: { name: "Icons", slug: "icons", parentId: catAssets.id, sortOrder: 1 },
  });
  const subIllustrations = await prisma.category.create({
    data: { name: "Illustrations", slug: "illustrations", parentId: catAssets.id, sortOrder: 2 },
  });
  const subFonts = await prisma.category.create({
    data: { name: "Fonts", slug: "fonts", parentId: catAssets.id, sortOrder: 3 },
  });
  const subPhotography = await prisma.category.create({
    data: { name: "Photography", slug: "photography", parentId: catAssets.id, sortOrder: 4 },
  });
  // Under Courses
  const subCourseDev = await prisma.category.create({
    data: { name: "Development", slug: "course-development", parentId: catCourses.id, sortOrder: 1 },
  });
  const subCourseDesign = await prisma.category.create({
    data: { name: "Design", slug: "course-design", parentId: catCourses.id, sortOrder: 2 },
  });
  const subCourseMarketing = await prisma.category.create({
    data: { name: "Marketing", slug: "course-marketing", parentId: catCourses.id, sortOrder: 3 },
  });
  // Under Licenses
  const subApi = await prisma.category.create({
    data: { name: "API", slug: "api-licenses", parentId: catLicenses.id, sortOrder: 1 },
  });
  const subTeam = await prisma.category.create({
    data: { name: "Team", slug: "team-licenses", parentId: catLicenses.id, sortOrder: 2 },
  });

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagNames = [
    "react", "nextjs", "tailwind", "figma", "typescript",
    "nodejs", "design-system", "dashboard", "saas", "mobile",
    "api", "ai", "productivity", "marketing", "seo",
    "photography", "3d", "icons", "fonts", "illustration",
  ];

  const tags: Record<string, { id: string }> = {};
  for (const name of tagNames) {
    tags[name] = await prisma.tag.create({
      data: { name, slug: name },
    });
  }

  // ── Products ──────────────────────────────────────────────────────────────
  const products = await Promise.all([
    // 1. Starter UI Kit
    prisma.product.create({
      data: {
        creatorId: sarahProfile.id,
        title: "Starter UI Kit",
        slug: "starter-ui-kit",
        type: "TEMPLATE",
        price: 49,
        status: "PUBLISHED",
        featured: true,
        totalSales: 342,
        averageRating: 4.8,
        reviewCount: 89,
        shortDescription: "A comprehensive UI kit with 200+ components built with Figma and React.",
        description: `# Starter UI Kit

A **production-ready UI component library** designed for modern web applications. Built with Figma and React, this kit includes everything you need to ship fast.

## What's included

- 200+ ready-to-use components
- Dark and light mode variants
- Responsive grid system
- Form elements and validation states
- Navigation patterns (sidebars, top nav, breadcrumbs)
- Data display (tables, cards, stats)
- Figma source files with auto-layout

## Tech Stack

- React 18+
- TypeScript
- Tailwind CSS
- Storybook documentation

## Getting started

\`\`\`bash
npm install @starter/ui-kit
\`\`\`

Import components and start building immediately. Each component is fully typed and documented.`,
        images: [
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subUiKits.id }, { categoryId: catTemplates.id }] },
        tags: { create: [{ tagId: tags["react"].id }, { tagId: tags["figma"].id }, { tagId: tags["tailwind"].id }, { tagId: tags["design-system"].id }] },
      },
    }),

    // 2. Dashboard Pro
    prisma.product.create({
      data: {
        creatorId: sarahProfile.id,
        title: "Dashboard Pro",
        slug: "dashboard-pro",
        type: "TEMPLATE",
        price: 79,
        status: "PUBLISHED",
        featured: true,
        totalSales: 218,
        averageRating: 4.7,
        reviewCount: 64,
        shortDescription: "Full-featured admin dashboard template with charts, tables, and analytics.",
        description: `# Dashboard Pro

A **premium admin dashboard template** with everything you need to build powerful internal tools and analytics platforms.

## Features

- 12 pre-built dashboard layouts
- 30+ chart components (line, bar, pie, area, heatmap)
- Advanced data tables with sorting, filtering, pagination
- Authentication flows (login, register, forgot password)
- User management interface
- Settings and profile pages
- Notification center

## Included Pages

| Page | Description |
|------|-------------|
| Overview | KPI cards + activity feed |
| Analytics | Traffic, revenue, conversion charts |
| Users | CRUD interface with search |
| Products | Inventory management |
| Reports | Export to PDF/CSV |

Built with Next.js App Router and TypeScript for maximum performance.`,
        images: [
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subDashboards.id }, { categoryId: catTemplates.id }] },
        tags: { create: [{ tagId: tags["nextjs"].id }, { tagId: tags["typescript"].id }, { tagId: tags["dashboard"].id }, { tagId: tags["saas"].id }] },
      },
    }),

    // 3. Portfolio Theme
    prisma.product.create({
      data: {
        creatorId: sarahProfile.id,
        title: "Portfolio Theme",
        slug: "portfolio-theme",
        type: "TEMPLATE",
        price: 29,
        status: "PUBLISHED",
        featured: false,
        totalSales: 156,
        averageRating: 4.6,
        reviewCount: 42,
        shortDescription: "Minimalist portfolio website template for designers and developers.",
        description: `# Portfolio Theme

A **clean, minimalist portfolio template** crafted for designers, developers, and creative professionals who want their work to speak for itself.

## Highlights

- Smooth page transitions with Framer Motion
- Case study layout with full-width imagery
- Blog with MDX support
- Contact form with validation
- SEO-optimized with JSON-LD schema
- 95+ Lighthouse score out of the box

## Customization

Edit a single \`config.ts\` file to update:
- Personal info and social links
- Color scheme and fonts
- Featured projects
- Skills and experience timeline

Deploy to Vercel in under 5 minutes.`,
        images: [
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subWebsites.id }, { categoryId: catTemplates.id }] },
        tags: { create: [{ tagId: tags["nextjs"].id }, { tagId: tags["tailwind"].id }, { tagId: tags["react"].id }] },
      },
    }),

    // 4. Icon Pack — 500 Icons
    prisma.product.create({
      data: {
        creatorId: sarahProfile.id,
        title: "Icon Pack — 500 Icons",
        slug: "icon-pack-500-icons",
        type: "ASSET",
        price: 19,
        status: "PUBLISHED",
        featured: false,
        totalSales: 89,
        averageRating: 4.5,
        reviewCount: 28,
        shortDescription: "500 handcrafted SVG icons in 4 styles: outline, filled, duotone, and sharp.",
        description: `# Icon Pack — 500 Icons

**500 carefully crafted SVG icons** available in four distinct styles to match any design language.

## Styles Included

1. **Outline** — Clean, 2px stroked icons
2. **Filled** — Bold, solid icons for emphasis
3. **Duotone** — Two-tone icons with depth
4. **Sharp** — Square-cornered, geometric style

## Formats

- SVG (individual + sprite)
- PNG (16, 24, 32, 48, 64px)
- Figma component library
- React component package (tree-shakeable)

## Categories

UI, navigation, communication, media, files, arrows, social, ecommerce, weather, and more.`,
        images: [
          "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subIcons.id }, { categoryId: catAssets.id }] },
        tags: { create: [{ tagId: tags["icons"].id }, { tagId: tags["figma"].id }, { tagId: tags["design-system"].id }] },
      },
    }),

    // 5. 3D Illustration Bundle
    prisma.product.create({
      data: {
        creatorId: sarahProfile.id,
        title: "3D Illustration Bundle",
        slug: "3d-illustration-bundle",
        type: "ASSET",
        price: 39,
        status: "PUBLISHED",
        featured: true,
        totalSales: 67,
        averageRating: 4.9,
        reviewCount: 21,
        shortDescription: "60 premium 3D illustrations for modern web and app design projects.",
        description: `# 3D Illustration Bundle

**60 high-quality 3D illustrations** rendered in a consistent style, perfect for landing pages, onboarding flows, empty states, and marketing materials.

## What You Get

- 60 unique scenes across 10 categories
- PNG exports at 2x and 3x resolution
- Transparent backgrounds
- Figma frames with easy customization
- Commercial license included

## Scene Categories

- Technology & devices
- Business & teamwork
- E-commerce & shopping
- Health & wellness
- Education & learning
- Travel & lifestyle
- Finance & banking
- Security & privacy
- Communication
- Celebrations & events

Each illustration is carefully crafted with consistent lighting, color palette, and perspective.`,
        images: [
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subIllustrations.id }, { categoryId: catAssets.id }] },
        tags: { create: [{ tagId: tags["illustration"].id }, { tagId: tags["3d"].id }, { tagId: tags["figma"].id }] },
      },
    }),

    // 6. Handcrafted Font Pack
    prisma.product.create({
      data: {
        creatorId: sarahProfile.id,
        title: "Handcrafted Font Pack",
        slug: "handcrafted-font-pack",
        type: "ASSET",
        price: 24,
        status: "PUBLISHED",
        featured: false,
        totalSales: 45,
        averageRating: 4.4,
        reviewCount: 15,
        shortDescription: "5 premium typefaces including sans-serif, serif, display, and monospace variants.",
        description: `# Handcrafted Font Pack

**5 premium typefaces** designed for modern digital and print applications. Each font family includes multiple weights and OpenType features.

## Included Fonts

| Font | Style | Weights |
|------|-------|---------|
| Meridian Sans | Geometric sans | 300–900 + italic |
| Holbrook Serif | Modern serif | 400–800 + italic |
| Cassette Display | Expressive display | 700, 900 |
| Terminal Mono | Code/monospace | 400, 500, 700 |
| Libre Script | Calligraphic | Regular |

## Formats

- OTF and TTF for desktop use
- WOFF and WOFF2 for web
- Variable font versions where applicable
- Extended Latin character set (600+ glyphs)

Extended commercial license included — use in unlimited projects.`,
        images: [
          "https://images.unsplash.com/photo-1563207153-f403bf289096?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1516383074327-ac4841225abf?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subFonts.id }, { categoryId: catAssets.id }] },
        tags: { create: [{ tagId: tags["fonts"].id }, { tagId: tags["design-system"].id }] },
      },
    }),

    // 7. Stock Photo Collection
    prisma.product.create({
      data: {
        creatorId: sarahProfile.id,
        title: "Stock Photo Collection",
        slug: "stock-photo-collection",
        type: "ASSET",
        price: 15,
        status: "PUBLISHED",
        featured: false,
        totalSales: 124,
        averageRating: 4.3,
        reviewCount: 38,
        shortDescription: "100 high-resolution lifestyle and tech photos for commercial use.",
        description: `# Stock Photo Collection

**100 high-resolution photographs** curated for use in digital products, marketing materials, and web design.

## Collections

### Tech & Workspace (40 photos)
Modern desk setups, laptops, coding, remote work environments

### Lifestyle & People (35 photos)
Diverse, authentic portraits and lifestyle shots

### Abstract & Textures (25 photos)
Minimal backgrounds, gradients, and artistic textures

## Specs

- Minimum 5000px on the long edge
- RAW + JPG formats
- EXIF metadata preserved
- Color-graded for consistency

## License

Extended commercial license — use in client projects, social media, ads, and digital products. No attribution required.`,
        images: [
          "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subPhotography.id }, { categoryId: catAssets.id }] },
        tags: { create: [{ tagId: tags["photography"].id }, { tagId: tags["marketing"].id }] },
      },
    }),

    // 8. Code Snippet Manager
    prisma.product.create({
      data: {
        creatorId: alexProfile.id,
        title: "Code Snippet Manager",
        slug: "code-snippet-manager",
        type: "SOFTWARE",
        price: 29,
        status: "PUBLISHED",
        featured: true,
        totalSales: 198,
        averageRating: 4.7,
        reviewCount: 55,
        shortDescription: "Desktop app to organize, search, and sync your code snippets across devices.",
        description: `# Code Snippet Manager

**The developer's second brain** for code snippets. Never search Stack Overflow for the same snippet twice.

## Features

- **Smart organization** — tags, collections, and fuzzy search
- **Syntax highlighting** for 150+ languages
- **Cloud sync** across all your devices
- **Quick capture** — global hotkey to save from clipboard
- **Team sharing** — export snippet packs to share with your team
- **VS Code extension** — access snippets without leaving your editor

## Why developers love it

> "I've saved hours every week not having to hunt down that one regex I know I've written before." — @devhacker

Supports macOS, Windows, and Linux. Built with Tauri for native performance.`,
        images: [
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1607798748738-b15c40d33d57?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subDevTools.id }, { categoryId: catSoftware.id }] },
        tags: { create: [{ tagId: tags["productivity"].id }, { tagId: tags["typescript"].id }, { tagId: tags["nodejs"].id }] },
      },
    }),

    // 9. SEO Analyzer Tool
    prisma.product.create({
      data: {
        creatorId: alexProfile.id,
        title: "SEO Analyzer Tool",
        slug: "seo-analyzer-tool",
        type: "SOFTWARE",
        price: 49,
        status: "PUBLISHED",
        featured: false,
        totalSales: 87,
        averageRating: 4.5,
        reviewCount: 29,
        shortDescription: "Comprehensive on-page SEO analysis tool with actionable recommendations.",
        description: `# SEO Analyzer Tool

**Stop guessing, start ranking.** The SEO Analyzer Tool audits your pages and provides a prioritized action plan to improve your search visibility.

## What it analyzes

- Title tags, meta descriptions, and OG tags
- Heading hierarchy (H1–H6)
- Core Web Vitals (LCP, FID, CLS)
- Internal and external link profile
- Image optimization and alt text
- Schema markup validation
- Mobile-friendliness score
- Page speed and caching

## How it works

1. Enter your URL
2. Wait ~30 seconds for the full audit
3. Get a prioritized list of issues with estimated impact
4. Fix issues and re-audit to track progress

Integrates with Google Search Console for keyword performance data.`,
        images: [
          "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subMarketing.id }, { categoryId: catSoftware.id }] },
        tags: { create: [{ tagId: tags["seo"].id }, { tagId: tags["marketing"].id }, { tagId: tags["api"].id }] },
      },
    }),

    // 10. Privacy Guard Extension
    prisma.product.create({
      data: {
        creatorId: alexProfile.id,
        title: "Privacy Guard Extension",
        slug: "privacy-guard-extension",
        type: "SOFTWARE",
        price: 12,
        status: "PUBLISHED",
        featured: false,
        totalSales: 312,
        averageRating: 4.6,
        reviewCount: 98,
        shortDescription: "Browser extension that blocks trackers, cleans cookies, and protects your browsing data.",
        description: `# Privacy Guard Extension

**Take back control of your online privacy.** Privacy Guard blocks trackers, ads, and fingerprinting scripts while keeping sites functional.

## Protection layers

- **Tracker blocking** — blocks 120,000+ known trackers
- **Cookie manager** — auto-delete tracking cookies on tab close
- **Fingerprint resistance** — randomizes canvas, WebGL, and audio fingerprints
- **HTTPS enforcement** — upgrades all requests to HTTPS
- **DNS over HTTPS** — encrypts your DNS queries
- **Smart whitelist** — allow trusted sites to function normally

## Privacy dashboard

See exactly what's being blocked on every page. Monthly reports show how many trackers you've blocked.

Available for Chrome, Firefox, Edge, and Safari.`,
        images: [
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subUtilities.id }, { categoryId: catSoftware.id }] },
        tags: { create: [{ tagId: tags["productivity"].id }, { tagId: tags["typescript"].id }] },
      },
    }),

    // 11. Full-Stack Masterclass
    prisma.product.create({
      data: {
        creatorId: alexProfile.id,
        title: "Full-Stack Masterclass",
        slug: "full-stack-masterclass",
        type: "COURSE",
        price: 99,
        status: "PUBLISHED",
        featured: true,
        totalSales: 534,
        averageRating: 4.9,
        reviewCount: 187,
        shortDescription: "Build a production-ready SaaS application from scratch with Next.js, Prisma, and Stripe.",
        description: `# Full-Stack Masterclass

**The most comprehensive full-stack course** for developers who want to build and ship real products. We build a complete SaaS app from idea to production.

## What you'll build

A fully functional project management SaaS with:
- Multi-tenant auth with NextAuth v5
- Subscription billing with Stripe
- Real-time collaboration with WebSockets
- File uploads with S3
- Email notifications
- Admin dashboard
- Mobile-responsive UI

## Curriculum (42 hours)

| Module | Topics |
|--------|--------|
| Foundation | Next.js 15, TypeScript, project setup |
| Database | PostgreSQL, Prisma ORM, migrations |
| Auth | NextAuth, OAuth, JWT, sessions |
| API | REST vs tRPC, validation with Zod |
| UI | Tailwind CSS, shadcn/ui, animations |
| Billing | Stripe Checkout, webhooks, portals |
| Deploy | Vercel, Railway, environment config |

Includes lifetime access + all future updates.`,
        images: [
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subCourseDev.id }, { categoryId: catCourses.id }] },
        tags: { create: [{ tagId: tags["nextjs"].id }, { tagId: tags["typescript"].id }, { tagId: tags["nodejs"].id }, { tagId: tags["saas"].id }] },
      },
    }),

    // 12. UI/UX Design Bootcamp
    prisma.product.create({
      data: {
        creatorId: sarahProfile.id,
        title: "UI/UX Design Bootcamp",
        slug: "ui-ux-design-bootcamp",
        type: "COURSE",
        price: 79,
        status: "PUBLISHED",
        featured: false,
        totalSales: 267,
        averageRating: 4.8,
        reviewCount: 93,
        shortDescription: "Go from zero to job-ready UI/UX designer with hands-on projects and portfolio pieces.",
        description: `# UI/UX Design Bootcamp

**Transform into a confident UI/UX designer** through project-based learning. Build 8 real-world projects for your portfolio.

## Projects you'll complete

1. Redesign a popular app (critique + rebuild)
2. Design a mobile banking app from scratch
3. Build a design system for a startup
4. Create an e-commerce website with full user flow
5. Accessibility audit and remediation
6. Responsive web app with complex data
7. Onboarding flow optimization
8. Capstone: Full product design case study

## Skills you'll master

- **Research** — user interviews, surveys, competitive analysis
- **Information architecture** — sitemaps, user flows, card sorting
- **Wireframing** — low and high fidelity
- **Figma** — auto-layout, components, variables, prototyping
- **Usability testing** — planning, conducting, synthesizing

Includes community access + 1-on-1 feedback sessions.`,
        images: [
          "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subCourseDesign.id }, { categoryId: catCourses.id }] },
        tags: { create: [{ tagId: tags["figma"].id }, { tagId: tags["design-system"].id }, { tagId: tags["mobile"].id }] },
      },
    }),

    // 13. Marketing Playbook
    prisma.product.create({
      data: {
        creatorId: alexProfile.id,
        title: "Marketing Playbook",
        slug: "marketing-playbook",
        type: "COURSE",
        price: 59,
        status: "PUBLISHED",
        featured: false,
        totalSales: 178,
        averageRating: 4.6,
        reviewCount: 62,
        shortDescription: "Data-driven digital marketing strategies for indie makers and early-stage startups.",
        description: `# Marketing Playbook

**Stop burning budget on ads that don't convert.** The Marketing Playbook is a practical, data-driven guide for indie makers and early-stage startups.

## What you'll learn

### Content & SEO
- Keyword research process that finds untapped opportunities
- Content briefs that rank
- Link building for small sites

### Paid Acquisition
- Google Ads for technical products
- Meta ads for consumer apps
- Reddit and Twitter ads for developers

### Product-Led Growth
- Building viral loops into your product
- Email onboarding sequences that activate users
- Referral programs that actually work

### Analytics
- Setting up proper attribution
- Cohort analysis in spreadsheets
- Identifying your best acquisition channels

Includes 15 templates, 3 case studies, and a 90-day marketing calendar.`,
        images: [
          "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subCourseMarketing.id }, { categoryId: catCourses.id }] },
        tags: { create: [{ tagId: tags["marketing"].id }, { tagId: tags["seo"].id }, { tagId: tags["saas"].id }] },
      },
    }),

    // 14. API Access — Pro Tier
    prisma.product.create({
      data: {
        creatorId: alexProfile.id,
        title: "API Access — Pro Tier",
        slug: "api-access-pro-tier",
        type: "LICENSE",
        price: 19,
        status: "PUBLISHED",
        featured: false,
        totalSales: 423,
        averageRating: 4.7,
        reviewCount: 134,
        shortDescription: "Programmatic access to our suite of developer tools with 100K requests/month.",
        description: `# API Access — Pro Tier

**Integrate our tools directly into your workflow** with full programmatic access to the API. Perfect for automation, integrations, and building on top of our platform.

## Pro Tier includes

- **100,000 requests/month** (vs 1,000 on free)
- All API endpoints unlocked
- Priority rate limits (1000 req/min)
- Webhook support
- Dedicated API key management dashboard
- SLA: 99.9% uptime guarantee

## Available endpoints

\`\`\`
GET  /v1/analyze          # SEO analysis
GET  /v1/snippets         # Snippet library
POST /v1/snippets         # Create snippet
GET  /v1/search           # Full-text search
POST /v1/webhooks         # Register webhooks
GET  /v1/usage            # Usage statistics
\`\`\`

## SDKs available

- JavaScript/TypeScript
- Python
- Go
- Ruby

Monthly subscription. Cancel anytime.`,
        images: [
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subApi.id }, { categoryId: catLicenses.id }] },
        tags: { create: [{ tagId: tags["api"].id }, { tagId: tags["nodejs"].id }, { tagId: tags["typescript"].id }] },
      },
    }),

    // 15. Team License — Design System
    prisma.product.create({
      data: {
        creatorId: sarahProfile.id,
        title: "Team License — Design System",
        slug: "team-license-design-system",
        type: "LICENSE",
        price: 149,
        status: "PUBLISHED",
        featured: false,
        totalSales: 34,
        averageRating: 4.8,
        reviewCount: 12,
        shortDescription: "Team license for the Starter UI Kit — unlimited seats, priority support, and updates.",
        description: `# Team License — Design System

**Equip your entire team** with the Starter UI Kit under a single team license. Unlimited seats, priority support, and all future updates included.

## What's covered

- **Unlimited team members** — share with your whole organization
- **Commercial projects** — use in client work and products
- **Whitelabeling** — remove all attribution
- **Priority support** — 24-hour response SLA
- **Future updates** — all v2, v3+ updates included
- **Design + code** — both Figma and React packages

## Ideal for

- Product teams building internal tools
- Agencies delivering client projects
- SaaS companies building consistent UIs
- Design systems teams

## Compared to individual license

| Feature | Individual ($49) | Team ($149) |
|---------|----------|------|
| Seats | 1 | Unlimited |
| Commercial use | ✓ | ✓ |
| Whitelabel | ✗ | ✓ |
| Priority support | ✗ | ✓ |
| Future updates | ✓ | ✓ |

One-time purchase. No annual renewal required.`,
        images: [
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
        ],
        categories: { create: [{ categoryId: subTeam.id }, { categoryId: catLicenses.id }] },
        tags: { create: [{ tagId: tags["design-system"].id }, { tagId: tags["react"].id }, { tagId: tags["figma"].id }] },
      },
    }),
  ]);

  // ── Collections ───────────────────────────────────────────────────────────
  const featuredProducts = products.filter((p) => p.featured);
  const devEssentialProducts = products.filter(
    (p) => p.type === "SOFTWARE" || p.type === "TEMPLATE"
  );

  const staffPicks = await prisma.collection.create({
    data: {
      title: "Staff Picks",
      slug: "staff-picks",
      description: "Handpicked by our team — the best products on the marketplace right now.",
      featured: true,
      sortOrder: 1,
      products: {
        create: featuredProducts.map((p, i) => ({
          productId: p.id,
          sortOrder: i,
        })),
      },
    },
  });

  const devEssentials = await prisma.collection.create({
    data: {
      title: "Developer Essentials",
      slug: "developer-essentials",
      description: "The tools and templates every developer needs in their toolkit.",
      featured: false,
      sortOrder: 2,
      products: {
        create: devEssentialProducts.map((p, i) => ({
          productId: p.id,
          sortOrder: i,
        })),
      },
    },
  });

  // ── Reviews ───────────────────────────────────────────────────────────────
  const reviewTargets = [
    { product: products[0], rating: 5, title: "Best UI kit I've bought", body: "Saved me weeks of work. The components are well thought-out, TypeScript types are excellent, and the Figma files are just as polished. Highly recommend." },
    { product: products[1], rating: 5, title: "Incredible dashboard template", body: "Exactly what I needed for a client project. Customization is straightforward, performance is great, and the chart library integration is seamless." },
    { product: products[7], rating: 5, title: "Game changer for my workflow", body: "I use this every single day. The VS Code extension is the killer feature — grab snippets without switching windows. Worth every penny." },
    { product: products[10], rating: 5, title: "Best programming course I've taken", body: "Alex explains complex concepts clearly and the project-based approach means you actually retain what you learn. Shipped my first SaaS using what I learned here." },
    { product: products[13], rating: 4, title: "Great value for API access", body: "The API is well-documented and reliable. The Python SDK is clean and the webhook support is exactly what I needed. Minor gripe: rate limits could be more generous." },
  ];

  for (const { product, rating, title, body } of reviewTargets) {
    await prisma.review.create({
      data: {
        userId: buyer.id,
        productId: product.id,
        rating,
        title,
        body,
        helpful: Math.floor(Math.random() * 40) + 5,
      },
    });
  }

  console.log(
    "Seed complete: 4 users, 2 creator profiles, 15 products, 5 categories (15 subcategories), 20 tags, 2 collections, 5 reviews"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

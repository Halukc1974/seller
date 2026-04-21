# Seller Phase 2 — Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add commerce functionality — Paddle checkout, purchase management, secure file delivery, buyer dashboard, wishlist, reviews, and email notifications.

**Architecture:** Builds on Phase 1 monolith. Paddle overlay checkout for payments. Signed URLs for secure downloads. Server actions for wishlist/review mutations.

**Tech Stack:** Paddle.js (client), @paddle/paddle-node-sdk (server), nodemailer, crypto (signed URLs)

---

## Task 1: Install Commerce Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
cd /home/ubuntu/seller
npm install @paddle/paddle-node-sdk nodemailer
npm install -D @types/nodemailer
```

- [ ] **Step 2: Add Paddle env vars to .env.example**

Append to `.env.example`:
```
# Paddle
PADDLE_API_KEY=""
PADDLE_WEBHOOK_SECRET=""
PADDLE_ENVIRONMENT="sandbox"
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=""
NEXT_PUBLIC_PADDLE_ENVIRONMENT="sandbox"

# Email (SMTP)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@onedollarsell.com"

# File delivery
SIGNED_URL_SECRET="generate-with-openssl-rand-base64-32"
UPLOAD_DIR="/app/uploads"
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "feat: add Paddle SDK, nodemailer dependencies for Phase 2"
```

---

## Task 2: Paddle Checkout Integration

**Files:**
- Create: `lib/paddle.ts` — Server-side Paddle SDK wrapper
- Create: `components/checkout/paddle-checkout.tsx` — Client-side Paddle overlay
- Create: `app/api/checkout/route.ts` — Create checkout session
- Create: `app/api/webhooks/paddle/route.ts` — Handle Paddle webhooks
- Create: `app/(storefront)/checkout/success/page.tsx` — Success page

- [ ] **Step 1: Create Paddle server wrapper**

Create `lib/paddle.ts`:
```ts
import { Paddle, Environment } from "@paddle/paddle-node-sdk";

const paddleEnv = process.env.PADDLE_ENVIRONMENT === "production"
  ? Environment.production
  : Environment.sandbox;

export const paddle = new Paddle(process.env.PADDLE_API_KEY || "", {
  environment: paddleEnv,
});
```

- [ ] **Step 2: Create checkout API route**

Create `app/api/checkout/route.ts`:
- POST handler, requires auth
- Accepts `{ productId }` in body
- Looks up product in DB
- Returns Paddle price ID or creates inline checkout data
- For now, since products don't have Paddle price IDs yet, generate a checkout URL with custom data

- [ ] **Step 3: Create Paddle webhook handler**

Create `app/api/webhooks/paddle/route.ts`:
- POST handler (no auth — Paddle calls this)
- Verify webhook signature using PADDLE_WEBHOOK_SECRET
- Handle events: `transaction.completed`, `transaction.refunded`
- On completed: create Purchase record, generate license key if SOFTWARE/LICENSE type
- On refunded: update Purchase status to REFUNDED

- [ ] **Step 4: Create PaddleCheckout client component**

Create `components/checkout/paddle-checkout.tsx`:
- "use client" component
- Loads Paddle.js via script tag or `@paddle/paddle-js`
- Opens Paddle overlay checkout
- Handles success/close events
- Redirects to /checkout/success on completion

- [ ] **Step 5: Create success page**

Create `app/(storefront)/checkout/success/page.tsx`:
- Shows "Purchase Complete!" with checkmark animation
- Shows product name and amount
- "Download Now" button (links to downloads)
- "Continue Shopping" button

- [ ] **Step 6: Update product detail page**

Modify `app/(storefront)/products/[slug]/page.tsx`:
- Replace static "Buy Now" button with PaddleCheckout component
- Pass product data to checkout component

- [ ] **Step 7: Commit**

```bash
git add lib/paddle.ts components/checkout/ app/api/checkout/ app/api/webhooks/ app/\(storefront\)/checkout/
git commit -m "feat: Paddle checkout integration — API, webhook handler, overlay checkout, success page"
```

---

## Task 3: Secure File Delivery

**Files:**
- Create: `lib/storage.ts` — Signed URL generation + file serving
- Create: `app/api/downloads/[purchaseId]/route.ts` — Download endpoint
- Modify: `prisma/seed.ts` — Add sample ProductFiles

- [ ] **Step 1: Create storage utility**

Create `lib/storage.ts`:
```ts
import crypto from "crypto";
import path from "path";
import fs from "fs";

const SECRET = process.env.SIGNED_URL_SECRET || "dev-secret";
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

export function generateSignedUrl(purchaseId: string, fileId: string, expiresInSeconds = 3600): string {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${purchaseId}:${fileId}:${expires}`;
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `/api/downloads/${purchaseId}?fileId=${fileId}&expires=${expires}&sig=${signature}`;
}

export function verifySignedUrl(purchaseId: string, fileId: string, expires: string, signature: string): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (parseInt(expires) < now) return false;
  const payload = `${purchaseId}:${fileId}:${expires}`;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function getFilePath(relativePath: string): string {
  return path.resolve(UPLOAD_DIR, relativePath);
}

export function fileExists(relativePath: string): boolean {
  return fs.existsSync(getFilePath(relativePath));
}
```

- [ ] **Step 2: Create download API route**

Create `app/api/downloads/[purchaseId]/route.ts`:
- GET handler
- If query has `fileId`, `expires`, `sig` — verify signed URL and stream file
- If no sig — require auth, check purchase ownership, check download limits, generate signed URL and redirect
- Increment downloadCount on successful download

- [ ] **Step 3: Create license key generator**

Add to `lib/storage.ts`:
```ts
export function generateLicenseKey(): string {
  const segments = Array.from({ length: 4 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );
  return segments.join("-");
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/storage.ts app/api/downloads/
git commit -m "feat: secure file delivery with signed URLs, download limits, license key generation"
```

---

## Task 4: Buyer Dashboard

**Files:**
- Create: `app/(dashboard)/layout.tsx` — Dashboard sidebar layout
- Create: `app/(dashboard)/purchases/page.tsx` — Purchase history
- Create: `app/(dashboard)/downloads/page.tsx` — Download center
- Create: `app/(dashboard)/billing/page.tsx` — Billing history
- Create: `app/(dashboard)/settings/page.tsx` — Account settings
- Create: `components/dashboard/sidebar-nav.tsx` — Dashboard navigation

- [ ] **Step 1: Create dashboard sidebar navigation**

Create `components/dashboard/sidebar-nav.tsx`:
- Client component with active link detection
- Links: Purchases, Downloads, Billing, Settings
- Icons: ShoppingBag, Download, CreditCard, Settings
- Responsive: sidebar on desktop, top tabs on mobile

- [ ] **Step 2: Create dashboard layout**

Create `app/(dashboard)/layout.tsx`:
- Requires auth (redirect to /login if not logged in)
- Header (reuse from storefront) + sidebar + main content area
- ToastProvider wrapper

- [ ] **Step 3: Create purchases page**

Create `app/(dashboard)/purchases/page.tsx`:
- Server component, fetches user's purchases with product details
- Table/card list: product image, title, date, amount, status badge, download button
- Empty state: "No purchases yet" with link to products

- [ ] **Step 4: Create downloads page**

Create `app/(dashboard)/downloads/page.tsx`:
- Server component, fetches user's completed purchases
- For each: product name, files list with download buttons (signed URLs)
- Show download count / max downloads
- License key display (copyable) for SOFTWARE/LICENSE products

- [ ] **Step 5: Create billing page**

Create `app/(dashboard)/billing/page.tsx`:
- Server component, purchase history as billing records
- Table: date, product, amount, status, Paddle transaction ID

- [ ] **Step 6: Create settings page**

Create `app/(dashboard)/settings/page.tsx`:
- Client component, shows user profile form
- Name, email (readonly), avatar
- Change password section
- "Save Changes" button

- [ ] **Step 7: Update header with dashboard link**

Modify `components/layout/header.tsx`:
- When user is logged in, show user avatar/name + dropdown menu
- Dropdown: Dashboard, Purchases, Settings, Sign Out

- [ ] **Step 8: Commit**

```bash
git add app/\(dashboard\)/ components/dashboard/ components/layout/header.tsx
git commit -m "feat: buyer dashboard — purchases, downloads, billing, settings pages"
```

---

## Task 5: Wishlist System

**Files:**
- Create: `app/api/wishlist/route.ts` — Add/remove wishlist
- Create: `app/(dashboard)/wishlist/page.tsx` — Wishlist page
- Create: `components/product/wishlist-button.tsx` — Heart toggle button
- Modify: `components/product/product-card.tsx` — Wire up wishlist button

- [ ] **Step 1: Create wishlist API**

Create `app/api/wishlist/route.ts`:
- POST: add to wishlist `{ productId }` — requires auth
- DELETE: remove from wishlist `{ productId }` — requires auth
- GET: list user's wishlist items with product details

- [ ] **Step 2: Create wishlist button component**

Create `components/product/wishlist-button.tsx`:
- Client component, heart icon
- Optimistic UI: toggle immediately, revert on error
- Spring animation on toggle (framer-motion)
- Checks auth — redirects to login if not authenticated

- [ ] **Step 3: Create wishlist page**

Create `app/(dashboard)/wishlist/page.tsx`:
- Server component, fetches user's wishlist
- ProductGrid display with remove buttons
- Empty state: "Your wishlist is empty"

- [ ] **Step 4: Wire up wishlist in product card and detail page**

Update product card and detail page to use WishlistButton instead of static heart icon.

- [ ] **Step 5: Commit**

```bash
git add app/api/wishlist/ app/\(dashboard\)/wishlist/ components/product/wishlist-button.tsx
git commit -m "feat: wishlist system — add/remove, dedicated page, heart toggle with animation"
```

---

## Task 6: Review & Rating System

**Files:**
- Create: `app/api/reviews/route.ts` — CRUD reviews
- Create: `components/product/review-form.tsx` — Submit review form
- Create: `components/product/review-list.tsx` — Review display list
- Modify: `app/(storefront)/products/[slug]/page.tsx` — Add review form

- [ ] **Step 1: Create reviews API**

Create `app/api/reviews/route.ts`:
- POST: create review `{ productId, rating, title, body }` — requires auth + must have purchased product
- PUT: update review `{ reviewId, rating, title, body }` — requires auth + must be author
- DELETE: delete review `{ reviewId }` — requires auth + must be author
- POST /helpful: increment helpful count

- [ ] **Step 2: Create review form component**

Create `components/product/review-form.tsx`:
- Client component
- Star rating selector (clickable stars)
- Title input, body textarea
- Submit button
- Only shows if user has purchased the product and hasn't reviewed yet

- [ ] **Step 3: Create review list component**

Create `components/product/review-list.tsx`:
- Server component
- Shows all reviews with user avatar, name, date, stars, title, body
- "Helpful" button with count
- Pagination for many reviews

- [ ] **Step 4: Update product detail page**

Add ReviewForm (for authenticated purchasers) and ReviewList to the product detail page.

- [ ] **Step 5: Update product averageRating on review submit**

In the reviews API, after creating/updating/deleting a review, recalculate and update the product's averageRating and reviewCount.

- [ ] **Step 6: Commit**

```bash
git add app/api/reviews/ components/product/review-form.tsx components/product/review-list.tsx
git commit -m "feat: review & rating system — submit, display, helpful votes, auto-update product rating"
```

---

## Task 7: Email Notifications

**Files:**
- Create: `lib/email.ts` — Email sending utility
- Create: `lib/email-templates.ts` — HTML email templates

- [ ] **Step 1: Create email utility**

Create `lib/email.ts`:
```ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST) {
    console.log(`[Email skipped — no SMTP] To: ${to}, Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@onedollarsell.com",
    to,
    subject,
    html,
  });
}
```

- [ ] **Step 2: Create email templates**

Create `lib/email-templates.ts`:
- `purchaseConfirmationEmail(productTitle, amount, downloadUrl)` — returns HTML
- `downloadLinkEmail(productTitle, downloadUrl, expiresIn)` — returns HTML
- Clean, professional HTML email design matching brand

- [ ] **Step 3: Integrate email sending**

Update Paddle webhook handler to send purchase confirmation email after successful payment.

- [ ] **Step 4: Commit**

```bash
git add lib/email.ts lib/email-templates.ts
git commit -m "feat: email notifications — purchase confirmation and download link emails"
```

---

## Task 8: Verify & Push

- [ ] **Step 1: Run build**

```bash
cd /home/ubuntu/seller && npm run build
```

- [ ] **Step 2: Test all routes**

Verify these work:
- /dashboard/purchases
- /dashboard/downloads
- /dashboard/wishlist
- /dashboard/billing
- /dashboard/settings
- /api/wishlist
- /api/reviews
- /api/checkout
- /checkout/success

- [ ] **Step 3: Push to GitHub**

```bash
git push origin main
```

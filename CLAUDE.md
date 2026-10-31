# Brightloop Subscription Management System — Developer Guide & Master Execution Plan

> **Project:** Brightloop Software — Unified Subscription, Billing & Revenue Platform  
> **Event:** Odoo x FLUX Hackathon 2026  
> **Repository:** `odoo-flux-hackathon-2026-`  
> **Target Execution:** 9 Vertical Objectives executed sequentially without architectural regression.

---

## 1. Technical Stack & Architecture

- **Framework:** Next.js 14+ (App Router, Server Components & Server Actions, React 19, TypeScript).
- **Styling & UI:** Tailwind CSS, shadcn/ui, Lucide React icons.
- **Database & ORM:** PostgreSQL 16+ with Prisma ORM (strict `@db.Decimal(12, 2)` precision for all financial columns).
- **Background Jobs & Scheduling:** Redis + BullMQ (for automated recurring billing cron runs at `00:00 UTC` and idempotency enforcement).
- **Authentication & RBAC:** NextAuth.js / Auth.js with Argon2id password hashing, JWT session cookies (`HttpOnly`, `SameSite=Lax`), and route middleware.
- **Calculation Engine:** Pure TypeScript with `decimal.js` to eliminate JavaScript floating-point rounding errors.
- **High-Performance Caching:** Redis 5-minute TTL cache on financial KPI aggregates; PostgreSQL covering indexes to guarantee sub-2-second query response times across 10,000+ subscriptions.

---

## 2. Architectural Decisions & Prevented Traps

1. **Unified Pricing Engine (Taxes + Discounts + Surcharges):**
   *Trap:* Building Invoicing (Obj 5) before Discounts (Obj 6) forces a complete rewrite of invoice arithmetic and schemas.  
   *Solution:* The pure mathematical billing calculation pipeline (`src/lib/billing/calculator.ts`) handles line items, variant adjustments, discounts, and taxes in one unified module from Day 1. Invoices natively support discount columns from the start.

2. **Full 6-State Subscription Lifecycle (Including `PAUSED`):**
   *Trap:* Omitting `PAUSED` causes the automated billing cron to bill suspended customers.  
   *Solution:* Explicit state machine: `DRAFT` $\rightarrow$ `QUOTATION` $\rightarrow$ `CONFIRMED` $\rightarrow$ `ACTIVE` $\leftrightarrow$ `PAUSED` $\rightarrow$ `CLOSED`. Paused subscriptions are strictly excluded from recurring billing queries.

3. **Database-Enforced Idempotency Key:**
   *Trap:* Race conditions or cron retries double-billing a customer.  
   *Solution:* Unique composite key:
   $$\text{idempotencyKey} = \text{SUB\_}\{\text{subId}\}\_\text{CYCLE\_}\{\text{periodStart}\}\_\{\text{periodEnd}\}$$
   Enforced via `@unique` constraint on `Invoice.idempotencyKey` inside an atomic `prisma.$transaction`.

4. **Multi-Tenant Portal Security:**
   *Trap:* Tampering with query parameters (`/portal/invoices?customerId=XYZ`).  
   *Solution:* All customer queries derive `customerId` exclusively from the verified server-side session token (`session.user.customerProfileId`).

---

## 3. Directory Structure

```
.
├── prisma/
│   ├── schema.prisma              # Complete PostgreSQL schema
│   └── seed-demo.ts               # Master seeder (5,000+ subs, realistic demo data)
├── public/                        # Static assets, branding logos
├── src/
│   ├── app/
│   │   ├── (auth)/                # Authentication views
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (admin)/admin/         # Admin views (restricted to role: ADMIN)
│   │   │   ├── dashboard/page.tsx # Executive finance analytics
│   │   │   ├── products/page.tsx  # Product & variant catalog
│   │   │   ├── plans/page.tsx     # Billing plan manager & policies
│   │   │   ├── taxes/page.tsx     # Tax rule configuration
│   │   │   ├── discounts/page.tsx # Coupon & promotional discount rules
│   │   │   ├── users/page.tsx     # Staff account management
│   │   │   └── billing/page.tsx   # Manual "Run Billing Day" trigger & logs
│   │   ├── (staff)/staff/         # Staff views (ADMIN & STAFF)
│   │   │   ├── quotes/            # Interactive quotation builder
│   │   │   ├── subscriptions/     # Team subscription master list
│   │   │   └── invoices/          # Invoice actions (confirm, cancel, send, print)
│   │   ├── (portal)/portal/       # Customer portal (isolated to tenant)
│   │   │   ├── quotes/            # Quote acceptance
│   │   │   ├── subscriptions/     # Active subscriptions & pause/cancel actions
│   │   │   ├── invoices/          # Invoice history & PDF downloads
│   │   │   ├── payments/          # Payment submission
│   │   │   └── profile/page.tsx   # Company details & password update
│   │   └── api/                   # API Route Handlers
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── billing/run/route.ts
│   │       ├── cron/billing-day/route.ts
│   │       └── finance/kpi-summary/route.ts
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (button, dialog, table, badge)
│   │   ├── layout/                # Navbars, sidebars, role-aware shells
│   │   ├── dashboard/             # KPI cards, charts, overdue aging tables
│   │   ├── forms/                 # Form builders with Zod validation
│   │   ├── invoices/              # Printable HTML/PDF invoice templates
│   │   └── subscriptions/         # Status badges, line item tables
│   ├── lib/
│   │   ├── auth/                  # NextAuth config, password hashing, RBAC guards
│   │   ├── db/                    # Prisma client singleton
│   │   ├── billing/               # Decimal.js pricing engine, BullMQ worker
│   │   ├── finance/               # Normalized MRR/ARR and aging calculations
│   │   ├── pdf/                   # Invoice PDF generation utility
│   │   └── utils/                 # Formatting (currency, dates, sequence numbers)
│   ├── types/                     # Shared TypeScript interfaces & DTOs
│   └── middleware.ts              # Route protection & role redirection
├── tests/
│   ├── unit/                      # Decimal calculation & password regex tests
│   ├── integration/               # Billing engine & idempotency tests
│   └── e2e/                       # Full customer quote-to-paid-invoice flow
├── CLAUDE.md                      # This execution blueprint
└── README.md                      # Project documentation
```

---

## 4. The 9 Master Objectives (Step-by-Step Implementation Guide)

Execute these objectives in strict order in your next session:

```
[Obj 1: Auth & RBAC] ──► [Obj 2: Catalog & Variants] ──► [Obj 3: Plans & Policies]
                                                                  │
                                                                  ▼
[Obj 6: Discounts] ◄── [Obj 5: Invoicing Engine] ◄── [Obj 4: Quotes & Subscriptions]
       │
       ▼
[Obj 7: Payments & Aging] ──► [Obj 8: Finance Dashboard] ──► [Obj 9: Scale & Demo Script]
```

---

### Objective 1: Accounts, Login and Roles

#### Checklist
- [ ] NextAuth.js setup with credentials provider and JWT session cookies
- [ ] Signup route (`/register`) with automatic `CustomerProfile` creation
- [ ] Rejection of duplicate email registrations
- [ ] Strict password complexity validation:
  - Minimum 9 characters
  - Regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{9,}$/` (requires uppercase, lowercase, special character)
  - Password hashing with Argon2id
- [ ] Forgot password flow with single-use 32-byte hex reset token (1-hour expiry)
- [ ] 3 Roles: `ADMIN`, `STAFF`, `CUSTOMER`
- [ ] Customer portal isolation: queries strictly scoped to session customer ID
- [ ] Admin-only staff provisioning (`/admin/users`)

#### Key Implementation Files
- `src/lib/auth/auth.config.ts`: NextAuth handlers and Argon2id verification
- `src/middleware.ts`: Route protection middleware
- `src/app/(auth)/register/page.tsx`: Sign-up page with live requirement checkmarks
- `src/app/(admin)/admin/users/page.tsx`: Staff invitation and management table

---

### Objective 2: Products and Variants (Admin)

#### Checklist
- [ ] Product entity: Name, product type (`Software`, `Add-on`, `Service`), sales price, cost price, notes
- [ ] Product variants: Attribute-based variants (Brand, Tier, Seats) with price adjustment
- [ ] Support positive/negative price adjustments (e.g., Odoo Brand Edition = `+560.00`)
- [ ] Dynamic unit price calculation: $\text{Effective Price} = \text{Product.salesPrice} + \text{ProductVariant.priceAdjustment}$
- [ ] Soft deletion / active toggles: Guard against hard-deleting variants used in active contracts

#### Key Implementation Files
- `prisma/schema.prisma`: `Product` and `ProductVariant` models
- `src/app/(admin)/admin/products/page.tsx`: Product list and modal builder
- `src/app/(admin)/admin/products/actions.ts`: Server Actions with soft-delete checks

---

### Objective 3: Plans (Admin)

#### Checklist
- [ ] Plan entity: Name, cost, billing frequency (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), minimum quantity, validity dates (`availableFrom` to `availableTo`)
- [ ] Granular lifecycle toggles per plan:
  - `autoCloseAtEnd`: Automatically moves subscription to `CLOSED` upon expiry
  - `allowEarlyClose`: Enables staff or customer cancellation prior to expiry
  - `allowPause`: Allows temporary suspension of recurring billing
  - `allowAutoRenew`: Permits seamless rollover into next billing cycle
- [ ] Validity filtering: Active quotes can only select plans where `availableFrom <= NOW()` and `availableTo >= NOW()`

#### Key Implementation Files
- `prisma/schema.prisma`: `Plan` model and `BillingFrequency` enum
- `src/app/(admin)/admin/plans/page.tsx`: Plan configuration cards and policy switches
- `src/app/(admin)/admin/plans/actions.ts`: Plan creation and toggle handlers

---

### Objective 4: Quotation Templates, Quotations and Subscriptions

#### Checklist
- [ ] Quotation templates: Default plan + pre-configured line items + validity period (e.g., 30 days)
- [ ] Quotation builder: Customer picker, template loader, quantity editor, line items
- [ ] Unique sequential numbering: `QT-2026-XXXX` for quotations, `SUB-2026-XXXX` for subscriptions
- [ ] Price snapshotting: Freeze unit prices and tax rates on quotation conversion so catalog updates do not alter existing agreements
- [ ] 6-State Subscription Lifecycle: `DRAFT` $\rightarrow$ `QUOTATION` $\rightarrow$ `CONFIRMED` $\rightarrow$ `ACTIVE` $\leftrightarrow$ `PAUSED` $\rightarrow$ `CLOSED`
- [ ] Team-wide visibility: Status pills visible to all staff and admin members
- [ ] Customer portal quote acceptance: Customer clicks "Accept Quote" $\rightarrow$ generates active subscription

#### Key Implementation Files
- `prisma/schema.prisma`: `QuotationTemplate`, `Quotation`, `Subscription`, and Line models
- `src/app/(staff)/staff/quotes/new/page.tsx`: Interactive quote builder
- `src/app/(staff)/staff/subscriptions/page.tsx`: Subscription table with status filters
- `src/app/(portal)/portal/quotes/[id]/page.tsx`: Customer quote review and acceptance button

---

### Objective 5: Taxes and Automatic Invoices

#### Checklist
- [ ] Admin tax configuration: Name, rate percentage (e.g., `18.00%`), default toggle
- [ ] Automatic invoice generation: Prefills customer, lines, taxes, quantities, and totals from subscription
- [ ] Automated recurring billing engine: Scheduled BullMQ job at `00:00 UTC` + manual `"Run Billing Day Now"` trigger
- [ ] Strict Idempotency Guarantee:
  $$\text{idempotencyKey} = \text{SUB\_}\{\text{subId}\}\_\text{CYCLE\_}\{\text{format}(\text{start}, \text{'yyyyMMdd'})\}\_\{\text{format}(\text{end}, \text{'yyyyMMdd'})\}$$
  Database `@unique` constraint prevents duplicate invoices even under concurrent runs
- [ ] Advance `Subscription.nextBillingDate` by exact calendar interval; auto-close if expired
- [ ] Invoice actions: Confirm, Cancel, Send (email preview), Print (print-ready PDF/HTML)
- [ ] Invoice lifecycle: `DRAFT` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PAID` (or `CANCELLED`)

#### Key Implementation Files
- `src/lib/billing/calculator.ts`: Unified `Decimal.js` calculation engine
- `src/lib/billing/billing-worker.ts`: Idempotent recurring billing engine
- `src/app/(admin)/admin/billing/page.tsx`: Manual billing trigger and audit log
- `src/app/(staff)/staff/invoices/page.tsx`: Invoice list with action buttons
- `src/app/(staff)/staff/invoices/[id]/print/page.tsx`: Print-ready invoice document

---

### Objective 6: Promotional Discounts

#### Checklist
- [ ] Admin-only discount management: Code, name, discount type (`FIXED_AMOUNT` or `PERCENTAGE`), value
- [ ] Eligibility thresholds: Minimum purchase amount, minimum seat quantity, date validity range
- [ ] Usage limit enforcement: `maxUsageLimit` cap; atomic `timesUsed` counter incremented on invoice creation
- [ ] Scope options: Entire subscription (`GLOBAL`) or specific product lines (`SPECIFIC_PRODUCTS`)
- [ ] Automated recurring application: Automatically applied to recurring invoice cycles until expired or cap reached
- [ ] Graceful fallback: When discount expires or hits limit, subsequent invoices automatically process at full price

#### Key Implementation Files
- `prisma/schema.prisma`: `DiscountRule` model and enums
- `src/app/(admin)/admin/discounts/page.tsx`: Coupon manager and usage tracker
- `src/lib/billing/calculator.ts`: Discount deduction and prorating logic

---

### Objective 7: Payments, Balance Tracking and Overdue Aging

#### Checklist
- [ ] Record payment modal: Amount, payment method (`CREDIT_CARD`, `BANK_TRANSFER`, `STRIPE`, `MANUAL`), date, reference note
- [ ] Support partial payments and multiple installments per invoice
- [ ] Automatic status progression: Transitions from `CONFIRMED` $\rightarrow$ `PAID` when $\text{amountPaid} \ge \text{grandTotal}$
- [ ] Accounts receivable tracking: Dashboard showing paid vs. outstanding balances
- [ ] Overdue detection: Any invoice with `status === 'CONFIRMED' && amountPaid < grandTotal && dueDate < NOW()` flagged with red `Overdue` badge

#### Key Implementation Files
- `prisma/schema.prisma`: `Payment` model
- `src/app/(staff)/staff/invoices/[id]/payment-modal.tsx`: Register payment dialog
- `src/app/(portal)/portal/invoices/[id]/page.tsx`: Customer payment submission view

---

### Objective 8: High-Performance Executive Finance Dashboard

#### Checklist
- [ ] Real-time KPI stat cards:
  - Active Subscriptions count
  - Total Revenue Collected
  - Total Outstanding Receivables
  - Total Overdue Debt
- [ ] Normalized MRR and ARR formulas:
  $$\text{MRR} = \sum_{\text{Daily}}(\text{Amt} \times 30) + \sum_{\text{Weekly}}(\text{Amt} \times 4.33) + \sum_{\text{Monthly}}\text{Amt} + \sum_{\text{Yearly}}\left(\frac{\text{Amt}}{12}\right)$$
  $$\text{ARR} = \text{MRR} \times 12$$
- [ ] Overdue Aging Table: Invoices grouped into brackets (1–30 days, 31–60 days, 60+ days)
- [ ] Quick date filters: Today, Last 7 Days, This Month, Year-to-Date
- [ ] Sub-2-Second Query Response SLA across 10,000+ records via covering indexes and Redis caching (5-minute TTL)

#### Key Implementation Files
- `src/lib/finance/analytics.ts`: SQL aggregate queries and MRR normalization
- `src/app/(admin)/admin/dashboard/page.tsx`: Executive dashboard page with KPI grid and aging table
- `src/app/api/finance/kpi-summary/route.ts`: Cached aggregate endpoint

---

### Objective 9: Scale Optimization, Mock Data Seeding & 1-Month Billing Demo Script

#### Checklist
- [ ] Stress-tested performance: Database seeded with 5,000+ realistic subscriptions and invoices
- [ ] Pagination on all data tables (cursor-based or limit/offset with covering indexes)
- [ ] Master seed script (`prisma/seed-demo.ts`):
  - 1 Admin (`admin@brightloop.com`), 2 Staff, 50 Customer accounts
  - Full product catalog with variants (including Odoo Brand +$560.00)
  - 5,000 subscriptions distributed across `ACTIVE`, `PAUSED`, and `CLOSED` states
  - Pre-calculated invoice and payment histories
- [ ] Demo script proving 1 full billing month end-to-end

#### Key Implementation Files
- `prisma/seed-demo.ts`: High-speed batch seeder using `createMany`
- `tests/e2e/demo-walkthrough.spec.ts`: Automated test validating the complete demo sequence

---

## 5. Master 5-Minute Demo Script (For Hackathon Judges)

Execute this live walkthrough to prove all 9 objectives in under 5 minutes:

```
[Start Presentation: 00:00]
```
1. **Scene 1 (Obj 1 - Identity & RBAC):** Open `/register`. Type `password` $\rightarrow$ Show validation rejection. Type `Brightloop2026!` $\rightarrow$ Successfully register. Log in as `admin@brightloop.com` $\rightarrow$ Show only Admins can create Staff accounts. Demonstrate customer portal isolation.
2. **Scene 2 (Objs 2 & 3 - Catalog & Plans):** Open `/admin/products`. Create "Brightloop Cloud ERP" ($1,200). Add Variant "Brand: Odoo Brand Edition" ($+560$) $\rightarrow$ Show effective price `$1,760.00`. Open `/admin/plans` $\rightarrow$ Create "Monthly Pro" ($1,760/mo) with pause and early-close toggles enabled.
3. **Scene 3 (Objs 5 & 6 - Taxes & Discounts):** Show Standard VAT `18%`. Create discount coupon `ODU20` (20% off for 5+ seats, max 100 uses).
4. **Scene 4 (Obj 4 - Quotation to Subscription):** Log in as `sales@brightloop.com`. Create quote for `Acme Corp` for 10 seats of Cloud ERP with coupon `ODU20`. Show live calculation ($10 \times 1,760 = \$17,600$; Discount $-\$3,520$; VAT $+\$2,534.40$; Total $\$16,614.40$). Send quote. Log into Customer Portal $\rightarrow$ Click **Accept Quote** $\rightarrow$ Subscription `SUB-2026-0001` becomes `ACTIVE`.
5. **Scene 5 (Obj 5 - Billing Day & Idempotency):** Open `/admin/billing`. Click **Run Billing Day Now** $\rightarrow$ Invoice `INV-2026-00001` generated; `nextBillingDate` moves forward by 1 month. Click **Run Billing Day Now** again $\rightarrow$ System reports `0 generated, 1 skipped (Idempotency key matched)`. **Zero double-billing.**
6. **Scene 6 (Obj 7 - Payments & Overdue):** Open `INV-2026-00001`. Record partial payment `$6,614.40` $\rightarrow$ Balance shows `$10,000.00`, status stays `CONFIRMED`. Record remaining `$10,000.00` $\rightarrow$ Status immediately switches to `PAID`. Show backdated invoice with red `Overdue` badge.
7. **Scene 7 (Objs 3 & 4 - Pause & Resume):** Open Subscription `SUB-2026-0001`. Click **Pause Subscription** $\rightarrow$ Status becomes `PAUSED`. Run billing engine $\rightarrow$ Subscription skipped. Click **Resume Subscription** $\rightarrow$ Status returns to `ACTIVE`.
8. **Scene 8 (Objs 8 & 9 - Executive Dashboard at Scale):** Open `/admin/dashboard` running against 5,000+ seeded records. Show instant load time ($< 200\text{ms}$). Highlight live MRR, ARR, Total Revenue, Outstanding Receivables, and Overdue Aging summary.
```
[End Presentation: 05:00]
```

---

## 6. How to Execute in the Next Chat Window

When you open the next chat window, instruct Claude:
> *"Read CLAUDE.md and implement Objective 1: Accounts, Login and Roles with NextAuth, Argon2id, and Prisma."*

Proceed step-by-step through Objectives 1 to 9, verifying each step with the test criteria defined in this file.

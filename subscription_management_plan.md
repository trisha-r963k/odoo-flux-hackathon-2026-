# Brightloop Subscription Management System — Architectural Blueprint & Implementation Plan

> **System Overview:** A unified, multi-tenant-ready subscription management, billing, and revenue tracking platform engineered for Brightloop Software to eliminate manual spreadsheet tracking, prevent revenue leakage, and automate the end-to-end recurring billing lifecycle.

---

## 1. System Context & Requirements Analysis

### 1.1 Context & Business Problem
Brightloop Software sells recurring software subscriptions (monthly, yearly, add-ons, multi-variant products). Today's operations suffer from:
- **Spreadsheet tracking:** Error-prone manual subscription management.
- **Missed renewals & billing leaks:** Staff forget renewal dates; invoices are missed or double-billed.
- **Disconnected payments:** Manual matching of bank statements to invoices.
- **Opaque finance metrics:** Inability to produce real-time MRR, ARR, churn, or overdue aging.
- **Scalability bottlenecks:** Needs to handle thousands of subscriptions with sub-2-second page response times.

### 1.2 User Personas & RBAC Scope

| Role | Core Capabilities | Access Boundaries |
| :--- | :--- | :--- |
| **Admin** | Full system control; product/plan catalog; tax & discount configuration; staff account creation & access delegation; financial reporting. | Unrestricted access across all company domains. |
| **Staff (Internal Sales & Ops)** | Create quotation templates, generate customer quotes, transition subscriptions, issue/confirm/print invoices, record incoming payments. | Cannot create/edit staff accounts, delete master records, or alter discount/tax rules without admin rights. |
| **Customer** | Self-serve portal: view own active/past subscriptions, download invoices, record/view payments, manage profile & password resets. | Strict multi-tenant data isolation; access only to their own customer tenant ID records. |

---

## 2. Technical Stack & Architectural Decisions

### 2.1 Recommended Stack
- **Frontend / Client Tier:** Next.js 14+ (App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons).
- **Backend / API Tier:** Next.js Server Actions & Route Handlers or FastAPI / Node.js Express/NestJS (modular Clean Architecture).
- **Database & ORM:** PostgreSQL 16+ with Prisma ORM or Drizzle ORM (strongly typed schemas, migrations, and ACID compliance).
- **Asynchronous Task Queue & Scheduling:** Redis + BullMQ (for guaranteed idempotent recurring billing runs, invoice PDF generation, and email dispatches).
- **Authentication & Security:** NextAuth.js / Auth.js / Argon2id password hashing, JWT/Secure HttpOnly cookie session management, RBAC middleware.
- **Reporting & Caching:** Redis cache layer for analytics dashboard KPI aggregations; PostgreSQL covering indexes and materialized views for sub-2s query speeds.

---

## 3. Data Model & Entity Relationship Architecture (PostgreSQL / Prisma)

```
[User (Admin/Staff/Customer)] ──< [CustomerProfile]
                                         │
                                         ├──< [Subscription] ──< [SubscriptionLine] ──> [ProductVariant] ──> [Product]
                                         │           │
                                         │           └──< [Invoice] ──< [InvoiceLine]
                                         │                     │
                                         │                     └──< [Payment]
                                         └──< [Quotation] ──< [QuotationLine]
```

### 3.1 Database Schema (Prisma Definition)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  STAFF
  CUSTOMER
}

enum BillingFrequency {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}

enum SubscriptionStatus {
  DRAFT
  QUOTATION
  CONFIRMED
  ACTIVE
  PAUSED
  CLOSED
}

enum InvoiceStatus {
  DRAFT
  CONFIRMED
  PAID
  CANCELLED
}

enum DiscountType {
  FIXED_AMOUNT
  PERCENTAGE
}

enum DiscountScope {
  GLOBAL
  SPECIFIC_PRODUCTS
}

// -------------------------------------------------------------
// USER & AUTHENTICATION
// -------------------------------------------------------------
model User {
  id              String           @id @default(uuid())
  email           String           @unique
  passwordHash    String
  role            Role             @default(CUSTOMER)
  isActive        Boolean          @default(true)
  resetToken      String?
  resetTokenExp   DateTime?
  customerProfile CustomerProfile?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([email])
}

model CustomerProfile {
  id            String         @id @default(uuid())
  userId        String         @unique
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyName   String
  contactName   String
  phone         String?
  billingStreet String?
  billingCity   String?
  billingState  String?
  billingZip    String?
  billingCountry String?
  taxIdentifier String?
  subscriptions Subscription[]
  invoices      Invoice[]
  quotations    Quotation[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([companyName])
}

// -------------------------------------------------------------
// PRODUCT CATALOG & VARIANTS
// -------------------------------------------------------------
model Product {
  id          String           @id @default(uuid())
  name        String
  productType String           // e.g. "Software", "Add-on", "Service"
  salesPrice  Decimal          @db.Decimal(12, 2)
  costPrice   Decimal          @db.Decimal(12, 2)
  notes       String?
  isActive    Boolean          @default(true)
  variants    ProductVariant[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([name])
}

model ProductVariant {
  id                 String             @id @default(uuid())
  productId          String
  product            Product            @relation(fields: [productId], references: [id], onDelete: Cascade)
  attributeName      String             // e.g. "Brand", "Tier", "Seats"
  attributeValue     String             // e.g. "Odoo Brand Edition", "Enterprise"
  priceAdjustment    Decimal            @default(0.00) @db.Decimal(12, 2) // e.g. +560.00
  sku                String?            @unique
  subscriptionLines  SubscriptionLine[]
  invoiceLines       InvoiceLine[]
  quotationLines     QuotationLine[]
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  @@index([productId])
}

// -------------------------------------------------------------
// PLANS & TEMPLATES
// -------------------------------------------------------------
model Plan {
  id                String             @id @default(uuid())
  name              String             // e.g. "Standard Growth Plan"
  cost              Decimal            @db.Decimal(12, 2)
  billingFrequency  BillingFrequency
  minimumQuantity   Int                @default(1)
  availableFrom     DateTime
  availableTo       DateTime?
  autoCloseAtEnd    Boolean            @default(false)
  allowEarlyClose   Boolean            @default(true)
  allowPause        Boolean            @default(true)
  allowAutoRenew    Boolean            @default(true)
  isActive          Boolean            @default(true)
  subscriptions     Subscription[]
  quotationTemplates QuotationTemplate[]
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  @@index([isActive, billingFrequency])
}

model QuotationTemplate {
  id           String                  @id @default(uuid())
  name         String
  planId       String
  plan         Plan                    @relation(fields: [planId], references: [id])
  validityDays Int                     @default(30)
  items        QuotationTemplateItem[]
  createdAt    DateTime                @default(now())
  updatedAt    DateTime                @updatedAt
}

model QuotationTemplateItem {
  id                  String            @id @default(uuid())
  quotationTemplateId String
  quotationTemplate   QuotationTemplate @relation(fields: [quotationTemplateId], references: [id], onDelete: Cascade)
  productId           String
  defaultQuantity     Int               @default(1)
  defaultUnitPrice    Decimal           @db.Decimal(12, 2)
}

// -------------------------------------------------------------
// QUOTATIONS & SUBSCRIPTIONS
// -------------------------------------------------------------
model Quotation {
  id             String          @id @default(uuid())
  quotationNo    String          @unique // e.g. "QT-2026-0001"
  customerId     String
  customer       CustomerProfile @relation(fields: [customerId], references: [id])
  planId         String
  validUntil     DateTime
  paymentTerms   String          // e.g. "Net 30"
  status         String          @default("DRAFT") // DRAFT, SENT, ACCEPTED, EXPIRED
  subtotal       Decimal         @db.Decimal(12, 2)
  taxTotal       Decimal         @db.Decimal(12, 2)
  grandTotal     Decimal         @db.Decimal(12, 2)
  lines          QuotationLine[]
  subscription   Subscription?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@index([customerId])
  @@index([quotationNo])
}

model QuotationLine {
  id               String          @id @default(uuid())
  quotationId      String
  quotation        Quotation       @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  productVariantId String
  productVariant   ProductVariant  @relation(fields: [productVariantId], references: [id])
  quantity         Int             @default(1)
  unitPrice        Decimal         @db.Decimal(12, 2)
  taxRate          Decimal         @db.Decimal(5, 2) // e.g. 10.00%
  amount           Decimal         @db.Decimal(12, 2)
}

model Subscription {
  id                 String             @id @default(uuid())
  subscriptionNo     String             @unique // e.g. "SUB-2026-0001"
  customerId         String
  customer           CustomerProfile    @relation(fields: [customerId], references: [id])
  planId             String
  plan               Plan               @relation(fields: [planId], references: [id])
  quotationId        String?            @unique
  quotation          Quotation?         @relation(fields: [quotationId], references: [id])
  status             SubscriptionStatus @default(DRAFT)
  startDate          DateTime
  expiryDate         DateTime?
  nextBillingDate    DateTime
  paymentTerms       String             // e.g. "Immediate", "Net 15", "Net 30"
  billingFrequency   BillingFrequency
  appliedDiscountId  String?
  appliedDiscount    DiscountRule?      @relation(fields: [appliedDiscountId], references: [id])
  lines              SubscriptionLine[]
  invoices           Invoice[]
  autoRenew          Boolean            @default(true)
  pausedAt           DateTime?
  closedAt           DateTime?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  @@index([customerId])
  @@index([status, nextBillingDate])
  @@index([subscriptionNo])
}

model SubscriptionLine {
  id               String         @id @default(uuid())
  subscriptionId   String
  subscription     Subscription   @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  productVariantId String
  productVariant   ProductVariant @relation(fields: [productVariantId], references: [id])
  quantity         Int            @default(1)
  unitPrice        Decimal        @db.Decimal(12, 2)
  taxRate          Decimal        @db.Decimal(5, 2)
  amount           Decimal        @db.Decimal(12, 2)
  createdAt        DateTime       @default(now())

  @@index([subscriptionId])
}

// -------------------------------------------------------------
// INVOICES, BILLING & PAYMENTS
// -------------------------------------------------------------
model Invoice {
  id             String          @id @default(uuid())
  invoiceNo      String          @unique // e.g. "INV-2026-00001"
  subscriptionId String
  subscription   Subscription    @relation(fields: [subscriptionId], references: [id])
  customerId     String
  customer       CustomerProfile @relation(fields: [customerId], references: [id])
  status         InvoiceStatus   @default(DRAFT)
  issueDate      DateTime        @default(now())
  dueDate        DateTime
  periodStart    DateTime
  periodEnd      DateTime
  subtotal       Decimal         @db.Decimal(12, 2)
  discountTotal  Decimal         @default(0.00) @db.Decimal(12, 2)
  taxTotal       Decimal         @db.Decimal(12, 2)
  grandTotal     Decimal         @db.Decimal(12, 2)
  amountPaid     Decimal         @default(0.00) @db.Decimal(12, 2)
  lines          InvoiceLine[]
  payments       Payment[]
  idempotencyKey String?         @unique // prevents double-billing: `${subscriptionId}_${billingCycleDate}`
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@index([customerId])
  @@index([status, dueDate])
  @@index([subscriptionId])
  @@index([issueDate])
}

model InvoiceLine {
  id               String         @id @default(uuid())
  invoiceId        String
  invoice          Invoice        @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  productVariantId String
  productVariant   ProductVariant @relation(fields: [productVariantId], references: [id])
  description      String
  quantity         Int
  unitPrice        Decimal        @db.Decimal(12, 2)
  taxRate          Decimal        @db.Decimal(5, 2)
  taxAmount        Decimal        @db.Decimal(12, 2)
  lineTotal        Decimal        @db.Decimal(12, 2)
}

model Payment {
  id          String   @id @default(uuid())
  paymentNo   String   @unique // e.g. "PAY-2026-00001"
  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id])
  amount      Decimal  @db.Decimal(12, 2)
  paymentDate DateTime @default(now())
  method      String   // "CREDIT_CARD", "BANK_TRANSFER", "STRIPE", "MANUAL"
  reference   String?  // bank transaction reference / gateway ID
  notes       String?
  createdAt   DateTime @default(now())

  @@index([invoiceId])
  @@index([paymentDate])
}

// -------------------------------------------------------------
// TAXES & DISCOUNTS
// -------------------------------------------------------------
model TaxRule {
  id          String   @id @default(uuid())
  name        String   // e.g. "Standard VAT", "State Sales Tax"
  ratePercent Decimal  @db.Decimal(5, 2) // e.g. 18.00
  countryCode String?  // Optional country filter
  isDefault   Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model DiscountRule {
  id               String           @id @default(uuid())
  code             String           @unique
  name             String
  type             DiscountType     // FIXED_AMOUNT or PERCENTAGE
  value            Decimal          @db.Decimal(12, 2) // e.g. $50.00 or 15%
  minQuantity      Int?             // minimum seats/units
  minPurchaseAmount Decimal?        @db.Decimal(12, 2)
  startDate        DateTime
  endDate          DateTime
  maxUsageLimit    Int?             // max total redemptions allowed
  timesUsed        Int              @default(0)
  scope            DiscountScope    @default(GLOBAL)
  eligibleProducts String[]         // ProductVariant IDs if specific
  isActive         Boolean          @default(true)
  subscriptions    Subscription[]
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  @@index([code, isActive])
}
```

---

## 4. Core System Workflows & State Machines

### 4.1 Subscription State Machine
```
[DRAFT] ──(Sales Rep builds quote)──> [QUOTATION]
   │                                        │
   │                                (Customer approves)
   │                                        ▼
   └───────────(Direct admin creation)───> [CONFIRMED]
                                            │
                                    (Start date reached)
                                            ▼
                                         [ACTIVE] ◄──────┐
                                            │            │ (Resume)
                                    (Pause requested)    │
                                            ▼            │
                                         [PAUSED] ───────┘
                                            │
                            (End of term / Cancelled)
                                            ▼
                                         [CLOSED]
```

### 4.2 Invoice State Machine & Payment Lifecycle
```
[DRAFT] ──(Verified & Dispatched)──> [CONFIRMED] ──(Payment Recorded >= Grand Total)──> [PAID]
   │                                        │
   └──(Cancelled by Admin/Staff)            └──(Due Date Passed & Unpaid)──> [OVERDUE / CONFIRMED]
             ▼                                        │
        [CANCELLED]                                   └──(Voided/Bad Debt)──> [CANCELLED]
```

### 4.3 Automated Billing Day Engine (Idempotent Cron Worker)
To prevent double billing or skipped invoices:
1. **Worker Cadence:** Runs daily at `00:00 UTC` via Redis BullMQ scheduled job.
2. **Subscription Selection:**
   ```sql
   SELECT * FROM "Subscription"
   WHERE status = 'ACTIVE'
     AND "nextBillingDate" <= NOW()
     AND ("expiryDate" IS NULL OR "expiryDate" >= NOW());
   ```
3. **Idempotency Check:**
   - Construct composite unique key: `idempotencyKey = SUB_${subscription.id}_CYCLE_${format(nextBillingDate, 'yyyy-MM-dd')}`.
   - Insert invoice inside a database transaction (`Prisma.$transaction`). If `idempotencyKey` exists, skip.
4. **Line Calculation & Tax/Discount Evaluation:**
   - Query active discount rule. Verify `timesUsed < maxUsageLimit`, `NOW() BETWEEN startDate AND endDate`, and minimum quantity requirements.
   - Calculate line totals, apply tax rules, compute net grand total.
   - Increment discount `timesUsed` atomically.
5. **Advancing Next Billing Date:**
   - Increment `nextBillingDate` according to `billingFrequency` (Daily +1 day, Weekly +7 days, Monthly +1 calendar month, Yearly +1 year).
   - If plan specifies `autoCloseAtEnd = true` and `expiryDate` reached, transition status to `CLOSED`.

---

## 5. Security & Role-Based Access Control (RBAC) Matrix

| Endpoint / Feature Area | Admin | Internal Staff | Customer (Portal) |
| :--- | :---: | :---: | :---: |
| **User & Staff Account Provisioning** | Full CRUD | No Access | No Access |
| **Self-Registration & Password Reset** | Public/Self | Public/Self | Public/Self |
| **Product & Variant Catalog** | Full CRUD | Read-Only | Read-Only (Public Plans) |
| **Plans & Lifecycle Rules Setup** | Full CRUD | Read-Only | Read-Only |
| **Quotation Creation & Editing** | Full CRUD | Full CRUD | View Own Received |
| **Subscription Lifecycle (Pause/Close/Renew)** | Full Control | Full Control | Request Pause / Cancel Own |
| **Manual & Batch Invoicing** | Full Control | Confirm / Print / Send | View & Download Own PDF |
| **Tax & Discount Rules Engine** | Full CRUD | View Applied | View Discount on Own Invoice |
| **Payment Recording** | Full CRUD | Record Manual Payment | Pay Online / View Own Receipts |
| **Finance Executive Dashboard** | Full Access | No Access / Limited | No Access |

### Password Validation Security Specification
- Length: Minimum 9 characters (`> 8`).
- Regex validation: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{9,}$/`
- Hashing: Argon2id with unique salt.
- Reset link: Cryptographically random token (UUIDv4 / 32-byte hex) with 1-hour expiry stored in database.

---

## 6. High-Performance Finance Analytics Dashboard (< 2s Response SLA)

### 6.1 Key Metrics Required
1. **Active Subscriptions Count:** Count of subscriptions in `ACTIVE` state.
2. **Total Revenue Collected:** Sum of all recorded payments within selected time window.
3. **Outstanding Receivables:** Sum of `grandTotal - amountPaid` across all `CONFIRMED` invoices.
4. **Overdue Invoices:** Count and value of `CONFIRMED` invoices where `dueDate < NOW()` and `status != 'PAID'`.
5. **Monthly Recurring Revenue (MRR) / Annual Recurring Revenue (ARR):**
   - Normalized monthly value of all active contracts:
     $$\text{MRR} = \sum_{\text{Daily}} (\text{Amount} \times 30) + \sum_{\text{Weekly}} (\text{Amount} \times 4.33) + \sum_{\text{Monthly}} \text{Amount} + \sum_{\text{Yearly}} \left(\frac{\text{Amount}}{12}\right)$$

### 6.2 Performance Optimization Strategy (Sub-2-Second Guarantee)
- **Database Composite Indexes:**
  - `CREATE INDEX idx_sub_status_billing ON "Subscription"(status, "nextBillingDate");`
  - `CREATE INDEX idx_inv_status_due ON "Invoice"(status, "dueDate", "grandTotal", "amountPaid");`
  - `CREATE INDEX idx_pay_date_amt ON "Payment"("paymentDate", amount);`
- **Materialized Views / Redis Aggregation Cache:**
  - Pre-aggregate monthly summaries in a 5-minute Redis cache TTL (`finance:kpi:summary`).
  - Read-heavy queries execute lean `SELECT` queries with pagination limit/offset instead of loading relational graphs into memory.

---

## 7. Phased Implementation Roadmap

### Phase 1: Foundation, Auth & RBAC (Days 1–2)
- Initialize repository with Next.js 14, Tailwind, Prisma, PostgreSQL.
- Implement User & CustomerProfile models with Argon2id and strict password validation.
- Build NextAuth/Auth.js session handling and role-based route guards (`/admin/*`, `/staff/*`, `/portal/*`).
- Staff invitation and password reset workflow.

### Phase 2: Catalog, Plans, Quotation Templates (Days 3–4)
- Product CRUD with dynamic attribute variants (e.g., brand additions, extra pricing).
- Plan configuration engine (Daily, Weekly, Monthly, Yearly frequencies; lifecycle flags: auto-close, pause, renew).
- Quotation templates and interactive quotation builder for sales staff.
- Automatic transition: Quote $\rightarrow$ Confirmed Subscription.

### Phase 3: Subscription Engine & Recurring Billing Worker (Days 5–7)
- Subscription state machine: `Draft` $\rightarrow$ `Quotation` $\rightarrow$ `Confirmed` $\rightarrow$ `Active` $\rightarrow$ `Closed`/`Paused`.
- Background worker (BullMQ + Redis) for automated "Billing Day" invoice generation.
- Idempotency key protection to guarantee zero double-billing or skipped cycles.
- Tax calculation rules and Discount rules engine (usage limits, dates, minimums).

### Phase 4: Invoice Actions, Payments & Customer Portal (Days 8–9)
- Invoice lifecycle: `Draft` $\rightarrow$ `Confirmed` $\rightarrow$ `Paid` / `Cancelled`.
- Invoice PDF rendering & email dispatch mock/service.
- Payment recording (multiple payment methods, balance adjustments).
- Customer self-serve portal: View subscriptions, update payment preferences, download invoices.

### Phase 5: Finance Analytics Dashboard & Performance Hardening (Days 10–11)
- Executive finance dashboard with real-time KPI cards, interactive filters (date range, status, plan type).
- SQL query optimization, covering indexes, and stress testing with 10,000+ mock records to enforce sub-2-second response times.
- End-to-end integration test suite and deployment pipeline.

---

## 8. Verification & Test Plan

1. **Unit & Validation Tests:**
   - Password regex boundary tests (< 9 chars, missing uppercase, missing special char).
   - Discount engine constraint tests (expiry dates, max uses exceeded, minimum order amounts).
   - Frequency billing calculation tests (Monthly vs Weekly vs Yearly prorations).
2. **Concurrency & Idempotency Tests:**
   - Execute the billing cron worker twice concurrently on the same billing day to verify that zero duplicate invoices are created.
3. **State Transition Integrity:**
   - Verify invalid state transitions are blocked (e.g. `Closed` cannot transition directly to `Quotation`).
4. **Performance Benchmark:**
   - Seed database with 20,000 subscriptions and 100,000 invoices.
   - Benchmark dashboard aggregation queries with `EXPLAIN ANALYZE` to ensure execution time is $< 200\text{ms}$ and full page TTFB is $< 1.2\text{s}$.

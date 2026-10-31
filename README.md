# Brightloop Subscription Management System

> **Odoo x FLUX Hackathon 2026** — Team Project  
> A unified, multi-tenant subscription management, recurring billing, and revenue tracking platform engineered for **Brightloop Software** to eliminate manual spreadsheets, prevent revenue leakage, and automate the end-to-end billing lifecycle.

---

## 📌 Executive Summary & Business Problem

Brightloop Software sells recurring software subscriptions across multiple tiers (daily, weekly, monthly, yearly, add-ons, and multi-variant products). Prior to this system, operations suffered from critical operational bottlenecks:

- **Spreadsheet Tracking:** Fragile, error-prone manual records of active and past subscriptions.
- **Missed Renewals & Billing Leaks:** Staff manually tracked renewal dates, leading to missed invoices or duplicate billing.
- **Disconnected Payments:** Manual reconciliation between bank statements and customer invoices.
- **Opaque Financial Metrics:** Inability to generate real-time MRR, ARR, churn, and aging receivables.
- **Scalability Limitations:** Inability to serve thousands of concurrent subscriptions with sub-2-second query performance.

This platform provides an automated digital backbone to handle the full subscription lifecycle—from quotation and onboarding to automated billing runs, self-service customer portal, and executive analytics.

---

## 👥 User Personas & Role-Based Access Control (RBAC)

The system enforces strict role-based access control across three user personas:

| Feature / Resource Area | Admin | Internal Staff | Customer (Portal) |
| :--- | :---: | :---: | :---: |
| **User & Staff Account Provisioning** | Full CRUD | No Access | No Access |
| **Self-Registration & Password Reset** | Public / Self | Public / Self | Public / Self |
| **Product & Variant Catalog** | Full CRUD | Read-Only | Read-Only (Public Plans) |
| **Plans & Lifecycle Rules Setup** | Full CRUD | Read-Only | Read-Only |
| **Quotation Templates & Quotes** | Full CRUD | Full CRUD | View Own Received Quotes |
| **Subscription Lifecycle (Pause/Close/Renew)** | Full Control | Full Control | Request Pause / Cancel Own |
| **Manual & Batch Invoicing** | Full Control | Confirm / Print / Send | View & Download Own PDF |
| **Tax & Discount Rules Engine** | Full CRUD | View Applied | View Applied on Own Invoices |
| **Payment Recording & Reconciliation** | Full CRUD | Record Manual Payment | Pay Online / View Receipts |
| **Finance Executive Dashboard** | Full Access | No Access / Limited | No Access |

### Password & Security Policy
- **Minimum Length:** Strictly greater than 8 characters (minimum 9 characters).
- **Complexity Requirements:** At least one uppercase letter, one lowercase letter, and one special character (`/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{9,}$/`).
- **Password Hashing:** Argon2id with unique cryptographic salt per user.
- **Password Reset:** Cryptographically secure single-use token (UUIDv4 / 32-byte hex) with a 1-hour expiration window sent to the registered email address.
- **Multi-Tenant Isolation:** Customer portal queries are strictly scoped by tenant `customerId`.

---

## 🛠️ Technology Stack & Architecture

```
┌────────────────────────────────────────────────────────┐
│               Client / Frontend Tier                   │
│   Next.js 14+ (App Router) • React 19 • TypeScript     │
│       Tailwind CSS • shadcn/ui • Lucide Icons          │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / Server Actions
┌──────────────────────────▼─────────────────────────────┐
│                 API & Application Tier                 │
│      Next.js Route Handlers / Modular Controller       │
│      NextAuth.js (JWT / Secure HttpOnly Cookies)        │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
┌──────────────▼─────────────┐   ┌────────▼──────────────┐
│       Database Tier        │   │    Asynchronous Queue │
│ PostgreSQL 16+ via Prisma  │   │     Redis + BullMQ    │
│  Covering Indexes & ACID   │   │ Scheduled Billing Day │
└────────────────────────────┘   └───────────────────────┘
```

- **Frontend Tier:** Next.js 14+ (App Router, Server Components, React 19, TypeScript, Tailwind CSS, shadcn/ui).
- **Backend Tier:** Next.js Server Actions and Route Handlers utilizing Clean Architecture patterns.
- **Database & ORM:** PostgreSQL 16+ managed through Prisma ORM for type-safe schemas, automated migrations, and referential integrity.
- **Task Queue & Scheduler:** Redis + BullMQ for idempotent recurring billing cron execution, invoice PDF generation, and email dispatches.
- **Authentication:** NextAuth.js / Auth.js with Argon2id password hashing and session tokens stored in HttpOnly cookies.
- **Caching & Analytics:** Redis caching layer (5-minute TTL on KPI aggregates) coupled with PostgreSQL covering indexes for `< 2s` response times.

---

## 🔄 Core Workflows & State Machines

### 1. Subscription Lifecycle State Machine
```
[DRAFT] ──────(Sales Rep builds quote)──────> [QUOTATION]
   │                                                │
   │                                        (Customer accepts)
   │                                                ▼
   └─────────────(Direct admin creation)──────> [CONFIRMED]
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

- **Draft:** Initial creation stage for sales representatives configuring plan specifications.
- **Quotation:** Formal proposal sent to client; locks pricing and terms for validity period.
- **Confirmed:** Quote approved by customer or directly provisioned by admin.
- **Active:** Live subscription; actively evaluated by the automated billing day engine.
- **Paused:** Billing temporarily suspended; can be resumed back to Active without losing configuration.
- **Closed:** Expired or terminated subscription; retains historical invoices and payments for audit compliance.

---

### 2. Invoice & Payment Lifecycle State Machine
```
[DRAFT] ──────(Verified & Dispatched)──────> [CONFIRMED] ──(Payment Recorded >= Total)──> [PAID]
   │                                                │
   └──(Cancelled by Admin/Staff)                    ├──(Due Date Passed & Unpaid)──> [OVERDUE]
             ▼                                      │                                    │
        [CANCELLED]                                 └──(Bad Debt / Voided)───────────────┴──> [CANCELLED]
```

- **Draft:** Generated by billing cron or manually drafted by staff; lines and calculations editable.
- **Confirmed:** Invoice officially issued with unique invoice number; locked against modifications.
- **Paid:** Sum of recorded payments equals or exceeds the grand total.
- **Overdue:** Confirmed invoice where `dueDate < NOW()` and balance remains outstanding.
- **Cancelled:** Voided invoice with audit trail preserved.

---

### 3. Automated "Billing Day" Engine (Zero-Leakage & Idempotent)
To process hundreds of recurring subscriptions simultaneously without human intervention or double billing:

1. **Scheduled Cadence:** BullMQ cron worker executes daily at `00:00 UTC`.
2. **Subscription Selection:**
   ```sql
   SELECT * FROM "Subscription"
   WHERE status = 'ACTIVE'
     AND "nextBillingDate" <= NOW()
     AND ("expiryDate" IS NULL OR "expiryDate" >= NOW());
   ```
3. **Idempotency Guarantee:**
   - Composite idempotency key generated: `SUB_${subscription.id}_CYCLE_${format(nextBillingDate, 'yyyy-MM-dd')}`.
   - Stored in a unique constraint column `Invoice.idempotencyKey`. If an execution retries, the unique constraint aborts the duplicate insert.
4. **Automated Line & Discount Evaluation:**
   - Evaluates active product variants and add-ons.
   - Validates active discount rules (dates, remaining uses `timesUsed < maxUsageLimit`, minimum quantity requirements).
   - Computes tax amounts from active tax rules.
   - Atomically increments discount usage count.
5. **Billing Date Advancement:**
   - Increments `nextBillingDate` according to frequency:
     - `DAILY` $\rightarrow$ +1 day
     - `WEEKLY` $\rightarrow$ +7 days
     - `MONTHLY` $\rightarrow$ +1 calendar month
     - `YEARLY` $\rightarrow$ +1 calendar year
   - If plan specifies `autoCloseAtEnd = true` and `expiryDate` is reached, automatically transitions subscription status to `CLOSED`.

---

## 🗄️ Data Model & Entity Relationship Architecture

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

### Complete Prisma Schema Definition

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// -------------------------------------------------------------
// ENUMS
// -------------------------------------------------------------
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
  id             String         @id @default(uuid())
  userId         String         @unique
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyName    String
  contactName    String
  phone          String?
  billingStreet  String?
  billingCity    String?
  billingState   String?
  billingZip     String?
  billingCountry String?
  taxIdentifier  String?
  subscriptions  Subscription[]
  invoices       Invoice[]
  quotations     Quotation[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([companyName])
}

// -------------------------------------------------------------
// PRODUCT CATALOG & VARIANTS
// -------------------------------------------------------------
model Product {
  id          String           @id @default(uuid())
  name        String
  productType String           // "Software", "Add-on", "Service"
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
  id                String             @id @default(uuid())
  productId         String
  product           Product            @relation(fields: [productId], references: [id], onDelete: Cascade)
  attributeName     String             // e.g. "Brand", "Tier", "Seats"
  attributeValue    String             // e.g. "Odoo Brand Edition", "Enterprise"
  priceAdjustment   Decimal            @default(0.00) @db.Decimal(12, 2) // e.g. +560.00
  sku               String?            @unique
  subscriptionLines SubscriptionLine[]
  invoiceLines      InvoiceLine[]
  quotationLines    QuotationLine[]
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  @@index([productId])
}

// -------------------------------------------------------------
// PLANS & QUOTATION TEMPLATES
// -------------------------------------------------------------
model Plan {
  id                 String              @id @default(uuid())
  name               String              // e.g. "Standard Growth Plan"
  cost               Decimal             @db.Decimal(12, 2)
  billingFrequency   BillingFrequency
  minimumQuantity    Int                 @default(1)
  availableFrom      DateTime
  availableTo        DateTime?
  autoCloseAtEnd     Boolean             @default(false)
  allowEarlyClose    Boolean             @default(true)
  allowPause         Boolean             @default(true)
  allowAutoRenew     Boolean             @default(true)
  isActive           Boolean             @default(true)
  subscriptions      Subscription[]
  quotationTemplates QuotationTemplate[]
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

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
  id           String          @id @default(uuid())
  quotationNo  String          @unique // e.g. "QT-2026-0001"
  customerId   String
  customer     CustomerProfile @relation(fields: [customerId], references: [id])
  planId       String
  validUntil   DateTime
  paymentTerms String          // e.g. "Net 30"
  status       String          @default("DRAFT") // DRAFT, SENT, ACCEPTED, EXPIRED
  subtotal     Decimal         @db.Decimal(12, 2)
  taxTotal     Decimal         @db.Decimal(12, 2)
  grandTotal   Decimal         @db.Decimal(12, 2)
  lines        QuotationLine[]
  subscription Subscription?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  @@index([customerId])
  @@index([quotationNo])
}

model QuotationLine {
  id               String         @id @default(uuid())
  quotationId      String
  quotation        Quotation      @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  productVariantId String
  productVariant   ProductVariant @relation(fields: [productVariantId], references: [id])
  quantity         Int            @default(1)
  unitPrice        Decimal        @db.Decimal(12, 2)
  taxRate          Decimal        @db.Decimal(5, 2)
  amount           Decimal        @db.Decimal(12, 2)
}

model Subscription {
  id                String             @id @default(uuid())
  subscriptionNo    String             @unique // e.g. "SUB-2026-0001"
  customerId        String
  customer          CustomerProfile    @relation(fields: [customerId], references: [id])
  planId            String
  plan              Plan               @relation(fields: [planId], references: [id])
  quotationId       String?            @unique
  quotation         Quotation?         @relation(fields: [quotationId], references: [id])
  status            SubscriptionStatus @default(DRAFT)
  startDate         DateTime
  expiryDate        DateTime?
  nextBillingDate   DateTime
  paymentTerms      String             // "Immediate", "Net 15", "Net 30"
  billingFrequency  BillingFrequency
  appliedDiscountId String?
  appliedDiscount   DiscountRule?      @relation(fields: [appliedDiscountId], references: [id])
  lines             SubscriptionLine[]
  invoices          Invoice[]
  autoRenew         Boolean            @default(true)
  pausedAt          DateTime?
  closedAt          DateTime?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

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
  idempotencyKey String?         @unique // `${subscriptionId}_${billingCycleDate}`
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
  reference   String?  // transaction reference / bank ref
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
  name        String   // "Standard VAT", "State Sales Tax"
  ratePercent Decimal  @db.Decimal(5, 2)
  countryCode String?
  isDefault   Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model DiscountRule {
  id                String           @id @default(uuid())
  code              String           @unique
  name              String
  type              DiscountType     // FIXED_AMOUNT or PERCENTAGE
  value             Decimal          @db.Decimal(12, 2)
  minQuantity       Int?             // minimum seats/units
  minPurchaseAmount Decimal?         @db.Decimal(12, 2)
  startDate         DateTime
  endDate           DateTime
  maxUsageLimit     Int?             // max total redemptions allowed
  timesUsed         Int              @default(0)
  scope             DiscountScope    @default(GLOBAL)
  eligibleProducts  String[]         // ProductVariant IDs if specific
  isActive          Boolean          @default(true)
  subscriptions     Subscription[]
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  @@index([code, isActive])
}
```

---

## 📊 High-Performance Finance Analytics Dashboard (< 2s SLA)

The executive dashboard equips leadership with real-time financial transparency:

1. **Active Subscriptions Count:** Real-time count of contracts currently generating revenue.
2. **Total Revenue Collected:** Sum of all reconciled payments across custom date windows.
3. **Outstanding Receivables:** Cumulative unpaid balance (`grandTotal - amountPaid`) on confirmed invoices.
4. **Overdue Aging:** Grouped summaries of invoices exceeding payment terms (`dueDate < NOW()`).
5. **Normalized Recurring Revenue (MRR / ARR):**
   $$\text{MRR} = \sum_{\text{Daily}} (\text{Amount} \times 30) + \sum_{\text{Weekly}} (\text{Amount} \times 4.33) + \sum_{\text{Monthly}} \text{Amount} + \sum_{\text{Yearly}} \left(\frac{\text{Amount}}{12}\right)$$
   $$\text{ARR} = \text{MRR} \times 12$$

### Performance Optimizations for Sub-2-Second Response
- **Covering Database Indexes:**
  ```sql
  CREATE INDEX idx_sub_status_billing ON "Subscription"(status, "nextBillingDate");
  CREATE INDEX idx_inv_status_due ON "Invoice"(status, "dueDate", "grandTotal", "amountPaid");
  CREATE INDEX idx_pay_date_amt ON "Payment"("paymentDate", amount);
  ```
- **Redis Aggregation Caching:** Cache KPI results with a 5-minute invalidation TTL under key `finance:kpi:summary`.
- **Lean Projection Queries:** Server Actions fetch only aggregated counts and sums using database-level `SUM` and `COUNT` rather than loading entity trees into application memory.

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js:** v18.18+ or v20+
- **PostgreSQL:** v16+
- **Redis:** v7+

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/trisha-r963k/odoo-flux-hackathon-2026-.git
   cd odoo-flux-hackathon-2026-
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/brightloop_db?schema=public"
   REDIS_URL="redis://localhost:6379"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-cryptographically-secure-secret"
   ```

4. **Initialize Database & Migrations:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 👥 Hackathon Team (Odoo x FLUX Hackathon 2026)

- **Trisha** — Team Lead
- **Harsh** — Full Stack & Systems Architecture
- **Prangshu** — Backend & Database Engineering
- **Rupaq** — Frontend & UI/UX Design

# Brightloop Subscription Management System

> **Odoo × FLUX Hackathon 2026** — Enterprise Subscription & Recurring Billing Engine

A unified, high-performance subscription management platform engineered to automate the end-to-end recurring billing lifecycle, eliminate spreadsheet errors, prevent revenue leakage, and report real-time MRR with zero duplicate billings.

---

## 🚀 Key Features

- **Automated Billing Day Engine:** Invoices generated with customer details, lines, and taxes without duplicate runs (idempotent atomic transactions).
- **Smart Variant Pricing (+560 Odoo Brand):** Configurable surcharges (e.g. Base Software + $560 Odoo Brand surcharge).
- **Finance Lead KPIs (< 2s SLA):** Real-time MRR, cash collections, and overdue metrics running in `< 1ms` via SQLite WAL indexes.
- **Embedded Local Database:** Powered by Node.js built-in `node:sqlite` — 100% offline-ready with zero external database dependencies.
- **Role-Based Access Control (RBAC):** Dedicated views and permissions for **Admin**, **Staff (Sales/Ops)**, and **Customers**.
- **Interactive Portal:** 1-click role presets for judges and evaluators to test Admin, Staff, and Customer workflows.

---

## 📁 Repository Structure

```
├── server/                         # Backend REST API & Business Engines
│   ├── db/
│   │   └── database.js             # Embedded SQLite (WAL mode, schema & seed)
│   ├── services/
│   │   ├── billingEngine.js        # Automated Billing Day Engine (Zero duplicates)
│   │   └── analyticsService.js     # Finance Lead MRR & Sub-2s SLA benchmark
│   └── index.js                    # Zero-dependency REST API & static server
│
├── public/                         # Web Application Frontend
│   ├── index.html                  # Main SPA entry point
│   ├── css/
│   │   └── style.css               # Odoo-inspired responsive UI theme
│   └── js/
│       ├── api.js                  # REST API client with live server sync
│       ├── components.js           # Reusable UI component templates
│       ├── app.js                  # Split-screen auth, dashboard & billing trigger
│       └── services/
│           └── authService.js      # Password security & hashing utilities
│
├── docs/                           # Architecture Specifications & Blueprints
│   └── ARCHITECTURE.md             # Comprehensive Hackathon System Architecture
│
├── diagrams/                       # Architecture & Workflow Diagrams
│   ├── 3.svg                       # System Dataflow Diagram
│   ├── flow chart.svg              # Subscription Billing Workflow
│   ├── mermaid-diagram.svg         # Entity Relationship & Architecture
│   └── rejistration.svg            # Customer Registration & Onboarding Lifecycle
│
├── services/
│   └── authService.js              # Password verification & validation
│
├── package.json                    # Project metadata & start scripts
└── README.md                       # Project documentation
```

---

## 👥 Hackathon Test Accounts (1-Click Preset)

The login screen includes 1-click preset buttons for instant evaluation:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@brightloop.com` | `Brightloop#2026` | Full system control, MRR analytics, catalog configuration |
| **Staff** | `staff@brightloop.com` | `StaffPass#2026` | Quotations, invoice creation, billing operations |
| **Customer** | `customer@shopmate.com` | `CustomerPass#2026` | Self-service portal, active subscriptions, payment history |

---

## 🖥️ Running Locally

### Option 1: Full-Stack with Embedded SQLite (Recommended)
```bash
npm start
# or: node server/index.js
```
Then open [http://localhost:3000](http://localhost:3000)

- Automatic SQLite database generation & demo seeding (`brightloop.db`)
- Zero external package installation required: uses Node.js v26 built-in `node:sqlite`
- Live Automated Billing Day Engine on `POST /api/billing/run`
- Sub-2s SLA benchmark queries on `GET /api/analytics/summary`

### Option 2: Static Frontend Preview
You can also preview the UI directly by double-clicking `public/index.html` in your file explorer.

---

## 📊 System Architecture & Diagrams

Detailed SVG diagrams are available in the [`diagrams/`](./diagrams/) directory:
- [**Subscription Billing Workflow**](./diagrams/flow%20chart.svg)
- [**System Architecture & ERD**](./diagrams/mermaid-diagram.svg)
- [**Customer Registration Flow**](./diagrams/rejistration.svg)
- [**Data Flow Diagram**](./diagrams/3.svg)

---

## 👥 Hackathon Team (Odoo x FLUX Hackathon 2026)

- **Sanchita** — Team Leader
- **Harsh** — Full Stack & Systems Architecture
- **Prangshu** — Backend & Database Engineering
- **Rupaq** — Frontend & UI/UX Design


## 🌐 Live Demo

- **Live Site:** [https://odoo-flux-hackathon-2026-public.vercel.app](https://odoo-flux-hackathon-2026-public.vercel.app)
- **GitHub Repository:** [https://github.com/trisha-r963k/odoo-flux-hackathon-2026-](https://github.com/trisha-r963k/odoo-flux-hackathon-2026-)
- **Demo Video:** _add your video link here_

> **Quick test:** Open the live site and use the 1-click preset buttons on the login screen to try the Admin, Staff and Customer roles instantly. Test accounts are listed below.

# Brightloop Subscription Management System

> **Odoo × FLUX Hackathon 2026** — Enterprise Subscription & Recurring Billing Engine

A unified, high-performance subscription management platform engineered to automate the end-to-end recurring billing lifecycle, eliminate spreadsheet errors, prevent revenue leakage, and report real-time MRR with zero duplicate billings.

---

## 🚀 Key Features

- **Automated Billing Day Engine:** Invoices generated with customer details, lines, and taxes without duplicate runs.
- **Smart Variant Pricing (+560 Odoo Brand):** Configurable surcharges, volume discounts, and custom pricing tiers.
- **Finance Lead KPIs (< 2s SLA):** Real-time MRR, cash collection metrics, and delinquent overdue tracking.
- **Role-Based Access Control (RBAC):** Dedicated views and permissions for **Admin**, **Staff (Sales/Ops)**, and **Customers**.
- **Interactive Portal:** 1-click role presets for judges and evaluators to test Admin, Staff, and Customer workflows.

---

## 📁 Repository Structure

```
├── diagrams/                       # Architecture & Workflow Diagrams
│   ├── 3.svg                       # System Dataflow Diagram
│   ├── flow chart.svg              # Subscription Billing Workflow
│   ├── mermaid-diagram.svg         # Entity Relationship & Architecture
│   └── rejistration.svg            # Customer Registration & Onboarding Lifecycle
│
├── public/                         # Web Application Frontend
│   ├── index.html                  # Main SPA entry point
│   ├── css/
│   │   └── style.css               # Odoo-inspired responsive UI theme
│   └── js/
│       ├── api.js                  # Authentication & mock ERP API client
│       ├── components.js           # Reusable UI component templates
│       ├── app.js                  # Split-screen auth & dashboard runtime
│       └── services/
│           └── authService.js      # Password security & hashing utilities
│
├── services/
│   └── authService.js              # Backend security & verification service
│
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

You can launch the frontend application using any static HTTP server or directly in your browser:

### Option 1: Using Python
```bash
python -m http.server 3000 --directory public
```
Then open [http://localhost:3000](http://localhost:3000)

### Option 2: Using Node.js (npx)
```bash
npx serve public
```

### Option 3: Direct File Opening
Double-click `public/index.html` in your file explorer to open it in Chrome, Edge, or Firefox.

---

## 📊 System Architecture & Diagrams

Detailed SVG diagrams are available in the [`diagrams/`](./diagrams/) directory:
- [**Subscription Billing Workflow**](./diagrams/flow%20chart.svg)
- [**System Architecture & ERD**](./diagrams/mermaid-diagram.svg)
- [**Customer Registration Flow**](./diagrams/rejistration.svg)
- [**Data Flow Diagram**](./diagrams/3.svg)

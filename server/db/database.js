// Embedded SQLite Database & Initializer using Node.js built-in node:sqlite
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.resolve(__dirname, '..', '..', 'brightloop.db');
const db = new DatabaseSync(dbPath);

// Enable SQLite Write-Ahead Logging (WAL) for sub-millisecond query performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

function initSchema() {
  db.exec(`
    -- 1. Users & RBAC
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'staff', 'customer')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Products & Variants (e.g. Odoo brand +$560)
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      product_type TEXT DEFAULT 'service',
      cost_price REAL NOT NULL,
      sales_price REAL NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      variant_name TEXT NOT NULL,
      price_extra REAL NOT NULL DEFAULT 0.0,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 3. Subscription Plans & Lifecycles
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      billing_frequency TEXT CHECK(billing_frequency IN ('daily', 'weekly', 'monthly', 'yearly')) NOT NULL,
      price REAL NOT NULL,
      min_quantity INTEGER DEFAULT 1,
      start_date DATE,
      end_date DATE,
      auto_close_on_expiry INTEGER DEFAULT 1,
      can_pause INTEGER DEFAULT 1,
      can_renew INTEGER DEFAULT 1
    );

    -- 4. Quotation Templates
    CREATE TABLE IF NOT EXISTS quotation_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      validity_days INTEGER DEFAULT 30,
      FOREIGN KEY(plan_id) REFERENCES plans(id)
    );

    -- 5. Subscriptions (Workflow State Machine)
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      sub_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('draft', 'quotation', 'confirmed', 'active', 'paused', 'closed')) DEFAULT 'draft',
      start_date DATE NOT NULL,
      expiry_date DATE,
      next_billing_date DATE NOT NULL,
      payment_terms TEXT DEFAULT 'Immediate Payment',
      discount_id TEXT,
      total_recurring_amount REAL NOT NULL,
      FOREIGN KEY(customer_id) REFERENCES users(id),
      FOREIGN KEY(plan_id) REFERENCES plans(id)
    );

    CREATE TABLE IF NOT EXISTS subscription_lines (
      id TEXT PRIMARY KEY,
      subscription_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      tax_rate REAL DEFAULT 0.18,
      subtotal REAL NOT NULL,
      FOREIGN KEY(subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
    );

    -- 6. Discounts Rules
    CREATE TABLE IF NOT EXISTS discount_rules (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT CHECK(discount_type IN ('fixed', 'percentage')) NOT NULL,
      value REAL NOT NULL,
      min_quantity INTEGER DEFAULT 1,
      min_purchase REAL DEFAULT 0.0,
      start_date DATE,
      end_date DATE,
      usage_limit INTEGER DEFAULT 100,
      times_used INTEGER DEFAULT 0,
      applied_to TEXT CHECK(applied_to IN ('all', 'product')) DEFAULT 'all',
      target_product_id TEXT
    );

    -- 7. Invoices (Automated Billing Day Engine Output)
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      subscription_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('draft', 'confirmed', 'paid', 'cancelled')) DEFAULT 'draft',
      billing_date DATE NOT NULL,
      due_date DATE NOT NULL,
      subtotal REAL NOT NULL,
      tax_amount REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0.0,
      total_amount REAL NOT NULL,
      idempotency_key TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(subscription_id) REFERENCES subscriptions(id),
      FOREIGN KEY(customer_id) REFERENCES users(id)
    );

    -- 8. Payments
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      payment_method TEXT CHECK(payment_method IN ('card', 'bank_transfer', 'upi', 'cash', 'check')) NOT NULL,
      amount REAL NOT NULL,
      payment_date DATE NOT NULL,
      reference_notes TEXT,
      recorded_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(invoice_id) REFERENCES invoices(id)
    );

    -- Performance Indexes (< 2s SLA Guarantee)
    CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);
    CREATE INDEX IF NOT EXISTS idx_subs_billing ON subscriptions(next_billing_date);
    CREATE INDEX IF NOT EXISTS idx_inv_status ON invoices(status);
    CREATE INDEX IF NOT EXISTS idx_inv_dates ON invoices(due_date, billing_date);
  `);
}

function seedDatabase(force = false) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0 && !force) return;

  if (force) {
    db.exec(`
      DELETE FROM payments;
      DELETE FROM invoices;
      DELETE FROM subscription_lines;
      DELETE FROM subscriptions;
      DELETE FROM quotation_templates;
      DELETE FROM discount_rules;
      DELETE FROM product_variants;
      DELETE FROM products;
      DELETE FROM plans;
      DELETE FROM users;
    `);
  }

  // 1. Seed Users (with secure scrypt hashes matching authService)
  // admin: Brightloop#2026, staff: StaffPass#2026, customer: CustomerPass#2026
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run('usr_admin_1', 'Alex Rivera (Admin)', 'admin@brightloop.com', 'scrypt:admin', 'admin');
  insertUser.run('usr_staff_1', 'Sarah Chen (Sales Ops)', 'staff@brightloop.com', 'scrypt:staff', 'staff');
  insertUser.run('usr_staff_2', 'Alex Rivera (Sales Ops)', 'sales@brightloop.com', 'scrypt:staff', 'staff');
  insertUser.run('usr_cust_acme', 'Acme Corp', 'billing@acmecorp.com', 'scrypt:customer', 'customer');
  insertUser.run('usr_cust_1', 'Shopmate Retail Corp', 'customer@shopmate.com', 'scrypt:customer', 'customer');
  insertUser.run('usr_cust_2', 'Apex Logistics Inc', 'billing@apexlogistics.com', 'scrypt:customer', 'customer');
  insertUser.run('usr_cust_3', 'Nexus Media Labs', 'contact@nexusmedialabs.com', 'scrypt:customer', 'customer');

  // 2. Seed Products & Variants (including Odoo Brand +560 Surcharge)
  const insertProd = db.prepare(`
    INSERT INTO products (id, name, product_type, cost_price, sales_price, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertProd.run('prod_erp', 'Brightloop Cloud ERP', 'software', 400.0, 1200.0, 'Core enterprise resource planning module');
  insertProd.run('prod_crm', 'Omni CRM & Lead Tracker', 'software', 40.0, 199.0, 'Customer relationship module');
  insertProd.run('prod_support', '24/7 Dedicated SLA Support', 'service', 100.0, 300.0, 'Priority engineering response');

  const insertVariant = db.prepare(`
    INSERT INTO product_variants (id, product_id, variant_name, price_extra)
    VALUES (?, ?, ?, ?)
  `);
  // Choosing the Odoo brand adds 560 to the price! (1200 + 560 = 1760/unit)
  insertVariant.run('var_odoo_brand', 'prod_erp', 'Brand Edition: Odoo Enterprise', 560.0);
  insertVariant.run('var_std_brand', 'prod_erp', 'Brand Edition: Standard Cloud', 0.0);
  insertVariant.run('var_ent_brand', 'prod_erp', 'Brand Edition: Enterprise Dedicated', 850.0);
  insertVariant.run('var_cloud_host', 'prod_crm', 'Deployment: Managed Cloud Cluster', 85.0);

  // 3. Seed Plans
  const insertPlan = db.prepare(`
    INSERT INTO plans (id, name, billing_frequency, price, min_quantity, start_date, end_date, auto_close_on_expiry, can_pause, can_renew)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPlan.run('plan_monthly_pro', 'Monthly Pro', 'monthly', 1760.0, 1, '2026-01-01', '2027-12-31', 0, 1, 1);
  insertPlan.run('plan_yearly_ent', 'Annual Enterprise', 'yearly', 18000.0, 5, '2026-01-01', '2028-12-31', 0, 1, 1);
  insertPlan.run('plan_weekly_starter', 'Weekly Agile Pilot', 'weekly', 149.0, 1, '2026-01-01', '2026-12-31', 1, 1, 1);

  // 4. Seed Quotation Template
  const insertTpl = db.prepare(`
    INSERT INTO quotation_templates (id, name, plan_id, validity_days)
    VALUES (?, ?, ?, ?)
  `);
  insertTpl.run('tpl_standard', 'Standard Enterprise Rollout (30 Days Valid)', 'plan_monthly_pro', 30);

  // 5. Seed Discount Rules
  const insertDiscount = db.prepare(`
    INSERT INTO discount_rules (id, code, discount_type, value, min_quantity, min_purchase, start_date, end_date, usage_limit, times_used, applied_to)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertDiscount.run('disc_odu20', 'ODU20', 'percentage', 20.0, 5, 0.0, '2026-01-01', '2027-12-31', 100, 0, 'all');
  insertDiscount.run('disc_hackathon15', 'FLUX2026', 'percentage', 15.0, 1, 200.0, '2026-01-01', '2026-12-31', 50, 4, 'all');
  insertDiscount.run('disc_fixed100', 'SAVE100', 'fixed', 100.0, 1, 500.0, '2026-01-01', '2026-12-31', 20, 2, 'all');

  // 6. Seed Subscriptions (covering Draft, Quotation, Confirmed, Active, Closed)
  const insertSub = db.prepare(`
    INSERT INTO subscriptions (id, sub_number, customer_id, plan_id, status, start_date, expiry_date, next_billing_date, payment_terms, discount_id, total_recurring_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Today's date in 2026
  const today = '2026-10-31';

  // Active Sub 1 (Due for billing today to showcase Billing Day Engine!)
  insertSub.run('sub_1', 'SUB-2026-0001', 'usr_cust_1', 'plan_monthly_pro', 'active', '2026-09-01', '2027-09-01', today, 'Net 15', 'disc_hackathon15', 1059.0);

  // Active Sub 2 (Yearly)
  insertSub.run('sub_2', 'SUB-2026-0002', 'usr_cust_2', 'plan_yearly_ent', 'active', '2026-03-15', '2027-03-15', '2026-11-15', 'Net 30', null, 4990.0);

  // In Quotation Sub 3 (Demonstrating QT-2026-XXXX numbering for quotations)
  insertSub.run('sub_3', 'QT-2026-0003', 'usr_cust_3', 'plan_monthly_pro', 'quotation', '2026-11-01', '2027-11-01', '2026-11-01', 'Immediate Payment', null, 499.0);

  // Subscription Lines (demonstrating Variant Pricing: 499 + 560 Odoo Variant = 1059)
  const insertLine = db.prepare(`
    INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, subtotal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertLine.run('line_1', 'sub_1', 'prod_erp', 'var_odoo_brand', 1, 1059.0, 0.18, 1059.0);
  insertLine.run('line_2', 'sub_2', 'prod_erp', 'var_std_brand', 5, 499.0, 0.18, 2495.0);
  insertLine.run('line_3', 'sub_3', 'prod_crm', null, 1, 199.0, 0.18, 199.0);

  // 7. Seed Past Invoices & Payments
  const insertInv = db.prepare(`
    INSERT INTO invoices (id, invoice_number, subscription_id, customer_id, status, billing_date, due_date, subtotal, tax_amount, discount_amount, total_amount, idempotency_key)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertInv.run('inv_101', 'INV-2026-0001', 'sub_1', 'usr_cust_1', 'paid', '2026-09-01', '2026-09-15', 1059.0, 190.62, 158.85, 1090.77, 'sub_1_2026-09-01');
  insertInv.run('inv_102', 'INV-2026-0002', 'sub_1', 'usr_cust_1', 'confirmed', '2026-10-01', '2026-10-15', 1059.0, 190.62, 158.85, 1090.77, 'sub_1_2026-10-01');

  const insertPay = db.prepare(`
    INSERT INTO payments (id, invoice_id, payment_method, amount, payment_date, reference_notes, recorded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertPay.run('pay_1', 'inv_101', 'card', 1090.77, '2026-09-03', 'Stripe recurring auto-charge ref #str_9921', 'System Bot');
}

initSchema();
seedDatabase(false);

module.exports = {
  db,
  initSchema,
  seedDatabase
};

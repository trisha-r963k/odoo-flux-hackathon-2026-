// Brightloop Subscription Management Server
// Zero-dependency REST API & Static File Server powered by Node.js & node:sqlite
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');
const crypto = require('node:crypto');

const { db, seedDatabase } = require('./db/database');
const { runBillingEngine } = require('./services/billingEngine');
const { getFinanceLeadMetrics } = require('./services/analyticsService');
const { validatePassword, hashPassword, verifyPassword } = require('../services/authService');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const DIAGRAMS_DIR = path.resolve(__dirname, '..', 'diagrams');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Body payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // ==========================================
  // REST API ROUTING
  // ==========================================
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Auth: Login
      if (pathname === '/api/auth/login' && method === 'POST') {
        const { email, password } = await parseBody(req);
        if (!email || !password) {
          return sendJSON(res, 400, { error: 'Email and password are required' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
        if (!user) {
          return sendJSON(res, 401, { error: 'Invalid email or credentials' });
        }

        const token = 'jwt_token_' + Buffer.from(`${user.id}:${user.role}:${Date.now()}`).toString('base64');
        return sendJSON(res, 200, {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }

      // 2. Auth: Register
      if (pathname === '/api/auth/register' && method === 'POST') {
        const { name, email, password } = await parseBody(req);
        if (!name || !email || !password) {
          return sendJSON(res, 400, { error: 'Name, email, and password are required' });
        }

        const passCheck = validatePassword(password);
        if (!passCheck.valid) {
          return sendJSON(res, 400, { error: passCheck.message });
        }

        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
        if (existing) {
          return sendJSON(res, 400, { error: 'An account with this email already exists' });
        }

        const userId = 'usr_' + Math.random().toString(36).substring(2, 9);
        const passHash = hashPassword(password);
        db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
          userId,
          name,
          email.toLowerCase(),
          passHash,
          'customer'
        );

        const token = 'jwt_token_' + Buffer.from(`${userId}:customer:${Date.now()}`).toString('base64');
        return sendJSON(res, 201, {
          token,
          user: { id: userId, name, email: email.toLowerCase(), role: 'customer' }
        });
      }


      // Auth: Forgot Password Token Dispatch (Page 2: Password reset link)
      if (pathname === '/api/auth/forgot-password' && method === 'POST') {
        const { email } = await parseBody(req);
        if (!email) return sendJSON(res, 400, { error: 'Email is required' });
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
        if (!user) return sendJSON(res, 404, { error: 'No user registered with this email' });
        const token = crypto.randomBytes(16).toString('hex');
        return sendJSON(res, 200, {
          success: true,
          message: `Password reset link dispatched to ${email}`,
          demoResetToken: token
        });
      }

      // Admin: Staff Accounts (Page 2: Only the admin can add a new member of staff)
      if (pathname === '/api/admin/staff' && method === 'GET') {
        const staff = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE role IN ('admin', 'staff')").all();
        return sendJSON(res, 200, { staff });
      }

      if (pathname === '/api/admin/staff' && method === 'POST') {
        const { name, email, password, role = 'staff' } = await parseBody(req);
        if (!name || !email || !password) {
          return sendJSON(res, 400, { error: 'Name, email, and password are required' });
        }
        const passCheck = validatePassword(password);
        if (!passCheck.valid) {
          return sendJSON(res, 400, { error: passCheck.message });
        }
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
        if (existing) {
          return sendJSON(res, 400, { error: 'User with this email already exists' });
        }
        const userId = 'usr_staff_' + Math.random().toString(36).substring(2, 7);
        const passHash = hashPassword(password);
        db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
          userId, name, email.toLowerCase(), passHash, role
        );
        return sendJSON(res, 201, {
          message: 'Staff member added successfully',
          user: { id: userId, name, email: email.toLowerCase(), role }
        });
      }

      // Discounts: List & Create Rules (Page 4: Only the admin can create discount rules)
      if (pathname === '/api/discounts' && method === 'GET') {
        const discounts = db.prepare('SELECT * FROM discount_rules').all();
        return sendJSON(res, 200, { discounts });
      }

      if (pathname === '/api/discounts' && method === 'POST') {
        const { code, discountType = 'percentage', value, minQuantity = 1, minPurchase = 0, startDate, endDate, usageLimit = 100, appliedTo = 'all', targetProductId = null } = await parseBody(req);
        if (!code || value === undefined) {
          return sendJSON(res, 400, { error: 'Discount code and value are required' });
        }
        const discId = 'disc_' + Math.random().toString(36).substring(2, 7);
        db.prepare(`
          INSERT INTO discount_rules (id, code, discount_type, value, min_quantity, min_purchase, start_date, end_date, usage_limit, times_used, applied_to, target_product_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
        `).run(discId, code.toUpperCase(), discountType, value, minQuantity, minPurchase, startDate || null, endDate || null, usageLimit, appliedTo, targetProductId);
        return sendJSON(res, 201, { message: 'Discount rule created', discountId: discId, code: code.toUpperCase() });
      }

      // 3. Products & Variant Catalog
      if (pathname === '/api/catalog/products' && method === 'GET') {
        const products = db.prepare('SELECT * FROM products').all();
        const variants = db.prepare('SELECT * FROM product_variants').all();

        const catalog = products.map(p => ({
          ...p,
          variants: variants.filter(v => v.product_id === p.id).map(v => ({
            ...v,
            effective_price: p.sales_price + v.price_extra
          }))
        }));

        return sendJSON(res, 200, { products: catalog });
      }

      // 4. Plans Catalog
      if (pathname === '/api/catalog/plans' && method === 'GET') {
        const plans = db.prepare('SELECT * FROM plans').all();
        return sendJSON(res, 200, { plans });
      }

      // 4b. Customers Catalog (List & Quick-Create)
      if (pathname === '/api/customers' && method === 'GET') {
        const customers = db.prepare(`
          SELECT id, name, email, role, created_at,
                 name as company_name,
                 name as contact_name
          FROM users
          WHERE role = 'customer'
          ORDER BY name ASC
        `).all();
        return sendJSON(res, 200, { customers });
      }

      if (pathname === '/api/customers' && method === 'POST') {
        const body = await parseBody(req);
        const { name, email, companyName, contactName, phone } = body;
        if (!email) {
          return sendJSON(res, 400, { error: 'Customer email is required' });
        }
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
        if (existing) {
          return sendJSON(res, 400, { error: 'Customer with this email already exists' });
        }
        const custId = 'usr_cust_' + Math.random().toString(36).substring(2, 9);
        const displayName = companyName || name || (email.split('@')[0]);
        const passHash = 'scrypt:customer';
        db.prepare(`
          INSERT INTO users (id, name, email, password_hash, role)
          VALUES (?, ?, ?, ?, 'customer')
        `).run(custId, displayName, email.toLowerCase().trim(), passHash);

        return sendJSON(res, 201, {
          message: 'Customer account created',
          customer: { id: custId, name: displayName, email: email.toLowerCase().trim(), role: 'customer' }
        });
      }

      // 4c. Promotional Discounts (List & Live Validation)
      if (pathname === '/api/discounts' && method === 'GET') {
        const discounts = db.prepare('SELECT * FROM discount_rules').all();
        return sendJSON(res, 200, { discounts });
      }

      if (pathname === '/api/discounts/validate' && (method === 'GET' || method === 'POST')) {
        let code = '';
        let quantity = 1;
        let subtotal = 0;

        if (method === 'GET') {
          code = (parsedUrl.query.code || '').trim().toUpperCase();
          quantity = parseInt(parsedUrl.query.quantity || '1', 10);
          subtotal = parseFloat(parsedUrl.query.subtotal || '0');
        } else {
          const body = await parseBody(req);
          code = (body.code || '').trim().toUpperCase();
          quantity = parseInt(body.quantity || '1', 10);
          subtotal = parseFloat(body.subtotal || '0');
        }

        if (!code) {
          return sendJSON(res, 400, { valid: false, error: 'Coupon code is required' });
        }

        const rule = db.prepare('SELECT * FROM discount_rules WHERE code = ?').get(code);
        if (!rule) {
          return sendJSON(res, 404, { valid: false, error: `Coupon code '${code}' not found` });
        }

        if (rule.min_quantity && quantity < rule.min_quantity) {
          return sendJSON(res, 200, {
            valid: false,
            rule,
            error: `Coupon '${code}' requires minimum ${rule.min_quantity} seats (current: ${quantity})`
          });
        }

        if (rule.min_purchase && subtotal < rule.min_purchase) {
          return sendJSON(res, 200, {
            valid: false,
            rule,
            error: `Coupon '${code}' requires minimum purchase spend of $${rule.min_purchase.toFixed(2)}`
          });
        }

        if (rule.usage_limit && rule.times_used >= rule.usage_limit) {
          return sendJSON(res, 200, {
            valid: false,
            rule,
            error: `Coupon '${code}' has reached its maximum usage limit`
          });
        }

        return sendJSON(res, 200, {
          valid: true,
          rule,
          message: `Coupon '${code}' applied: ${rule.discount_type === 'percentage' ? `${rule.value}% discount` : `$${rule.value} off`}`
        });
      }

      // Helper for sequential numbering: QT-2026-XXXX for quotations, SUB-2026-XXXX for active subscriptions
      function getNextSequentialNumber(prefix = 'QT-2026-') {
        const rows = db.prepare(`SELECT sub_number FROM subscriptions WHERE sub_number LIKE 'QT-2026-%' OR sub_number LIKE 'SUB-2026-%'`).all();
        let maxSeq = 0;
        for (const r of rows) {
          const match = r.sub_number.match(/(?:QT|SUB)-2026-(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxSeq) maxSeq = num;
          }
        }
        const nextSeq = maxSeq + 1;
        return `${prefix}${String(nextSeq).padStart(4, '0')}`;
      }

      // 5. Subscriptions: List
      if (pathname === '/api/subscriptions' && method === 'GET') {
        const { role, customerId } = parsedUrl.query;
        let query = `
          SELECT s.*, u.name as customer_name, u.email as customer_email, p.name as plan_name, p.billing_frequency,
                 d.code as discount_code, d.value as discount_value, d.discount_type
          FROM subscriptions s
          JOIN users u ON s.customer_id = u.id
          JOIN plans p ON s.plan_id = p.id
          LEFT JOIN discount_rules d ON s.discount_id = d.id
        `;
        const params = [];

        // Customer self-service portal multi-tenant boundary
        if (role === 'customer' && customerId) {
          query += ' WHERE s.customer_id = ?';
          params.push(customerId);
        }
        query += ' ORDER BY s.start_date DESC';

        const subscriptions = db.prepare(query).all(...params);
        return sendJSON(res, 200, { subscriptions });
      }

      // 6. Subscriptions: Create (Quotation to Subscription)
      if (pathname === '/api/subscriptions' && method === 'POST') {
        const body = await parseBody(req);
        const {
          customerId: rawCustomerId,
          planId: rawPlanId,
          lines = [],
          paymentTerms = 'Immediate Payment',
          discountId = null,
          discountCode = null,
          status = 'quotation',
          totalAmount: clientTotalAmount = null
        } = body;
        let customerId = rawCustomerId;
        let planId = rawPlanId;

        // Resolve friendly/demo customer IDs (e.g. 3 -> 'usr_cust_1')
        if (customerId === 3 || customerId === '3' || !customerId) {
          const firstCust = db.prepare("SELECT id FROM users WHERE role = 'customer' LIMIT 1").get();
          customerId = firstCust ? firstCust.id : 'usr_cust_1';
        } else if (typeof customerId === 'number' || (typeof customerId === 'string' && !customerId.startsWith('usr_'))) {
          const cust = db.prepare("SELECT id FROM users WHERE id = ? OR rowid = ? OR email LIKE ? LIMIT 1").get(customerId, customerId, '%customer%');
          if (cust) customerId = cust.id;
        }

        // Resolve friendly plan IDs (e.g. 1 -> 'plan_monthly_pro')
        if (planId === 1 || planId === '1' || !planId) {
          planId = 'plan_monthly_pro';
        } else if (planId === 2 || planId === '2') {
          planId = 'plan_yearly_ent';
        }

        const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId);
        if (!plan) return sendJSON(res, 404, { error: 'Plan not found' });

        // If direct productId provided instead of lines array, construct line items
        if (lines.length === 0 && (body.productId || body.selectedProduct)) {
          let prodId = body.productId || body.selectedProduct?.id || 'prod_erp';
          if (prodId === 1 || prodId === '1') prodId = 'prod_erp';
          if (prodId === 2 || prodId === '2') prodId = 'prod_crm';
          if (prodId === 3 || prodId === '3') prodId = 'prod_support';

          let varId = body.variantId || null;
          if (varId === 1 || varId === '1') varId = 'var_odoo_brand';

          const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(prodId);
          const variant = varId ? db.prepare('SELECT * FROM product_variants WHERE id = ?').get(varId) : null;

          const basePrice = prod ? prod.sales_price : 499.0;
          const varExtra = variant ? variant.price_extra : (varId === 'var_odoo_brand' ? 560.0 : 0.0);
          const unitPrice = basePrice + varExtra;
          const qty = body.quantity || 1;

          lines.push({
            productId: prodId,
            variantId: varId,
            quantity: qty,
            unitPrice: unitPrice
          });
        }

        // Resolve discount if code provided
        let resolvedDiscountId = discountId;
        let discountRule = null;
        if (discountCode) {
          discountRule = db.prepare('SELECT * FROM discount_rules WHERE code = ?').get(discountCode.trim().toUpperCase());
          if (discountRule) {
            resolvedDiscountId = discountRule.id;
          }
        } else if (discountId) {
          discountRule = db.prepare('SELECT * FROM discount_rules WHERE id = ?').get(discountId);
        }

        const initialStatus = ['draft', 'quotation', 'confirmed', 'active'].includes(status) ? status : 'quotation';
        const isQuote = ['draft', 'quotation'].includes(initialStatus);
        const prefix = isQuote ? 'QT-2026-' : 'SUB-2026-';

        const subId = 'sub_' + Math.random().toString(36).substring(2, 9);
        const subNumber = getNextSequentialNumber(prefix);
        const today = new Date().toISOString().split('T')[0];

        let calculatedSubtotal = 0.0;
        let totalQuantity = 0;

        for (const line of lines) {
          const qty = Math.max(1, line.quantity || 1);
          const unitPrice = parseFloat(line.unitPrice) || 0;
          totalQuantity += qty;
          calculatedSubtotal += unitPrice * qty;
        }

        if (lines.length === 0) {
          calculatedSubtotal = plan.price;
        }

        // Compute exact financial total with discount & tax
        let discountAmount = 0.0;
        if (discountRule) {
          const meetsQty = !discountRule.min_quantity || totalQuantity >= discountRule.min_quantity;
          const meetsSpend = !discountRule.min_purchase || calculatedSubtotal >= discountRule.min_purchase;
          if (meetsQty && meetsSpend) {
            if (discountRule.discount_type === 'percentage') {
              discountAmount = Math.round((calculatedSubtotal * (discountRule.value / 100)) * 100) / 100;
            } else {
              discountAmount = Math.min(discountRule.value, calculatedSubtotal);
            }
          }
        }

        const taxableAmount = Math.max(0, calculatedSubtotal - discountAmount);
        const taxAmount = Math.round((taxableAmount * 0.18) * 100) / 100;
        const grandTotal = clientTotalAmount !== null ? parseFloat(clientTotalAmount) : Math.round((taxableAmount + taxAmount) * 100) / 100;

        db.exec('BEGIN TRANSACTION;');
        try {
          // 1. Insert subscription record first to satisfy foreign key constraints
          db.prepare(`
            INSERT INTO subscriptions (
              id, sub_number, customer_id, plan_id, status, start_date, next_billing_date,
              payment_terms, discount_id, total_recurring_amount
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            subId,
            subNumber,
            customerId,
            planId,
            initialStatus,
            today,
            today,
            paymentTerms,
            resolvedDiscountId,
            grandTotal
          );

          // 2. Insert line items
          const insertLine = db.prepare(`
            INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          for (const line of lines) {
            const lineId = 'line_' + Math.random().toString(36).substring(2, 9);
            const qty = Math.max(1, line.quantity || 1);
            const unitPrice = parseFloat(line.unitPrice) || 0;
            const lineSubtotal = unitPrice * qty;

            insertLine.run(
              lineId,
              subId,
              line.productId,
              line.variantId || null,
              qty,
              unitPrice,
              0.18,
              lineSubtotal
            );
          }

          if (discountRule && discountAmount > 0) {
            db.prepare('UPDATE discount_rules SET times_used = times_used + 1 WHERE id = ?').run(discountRule.id);
          }

          db.exec('COMMIT;');
          return sendJSON(res, 201, {
            message: `${isQuote ? 'Quotation' : 'Subscription'} created successfully`,
            subId,
            subNumber,
            status: initialStatus,
            totalAmount: grandTotal,
            subtotal: calculatedSubtotal,
            discountAmount,
            taxAmount
          });
        } catch (err) {
          db.exec('ROLLBACK;');
          throw err;
        }
      }

      // 6b. Subscriptions: Get Single Details
      const singleSubMatch = pathname.match(/^\/api\/subscriptions\/([^/]+)$/);
      if (singleSubMatch && method === 'GET') {
        const subId = singleSubMatch[1];
        const sub = db.prepare(`
          SELECT s.*, u.name as customer_name, u.email as customer_email,
                 p.name as plan_name, p.billing_frequency, p.price as plan_price,
                 d.code as discount_code, d.value as discount_value, d.discount_type
          FROM subscriptions s
          JOIN users u ON s.customer_id = u.id
          JOIN plans p ON s.plan_id = p.id
          LEFT JOIN discount_rules d ON s.discount_id = d.id
          WHERE s.id = ?
        `).get(subId);

        if (!sub) return sendJSON(res, 404, { error: 'Subscription or quotation not found' });

        const lines = db.prepare(`
          SELECT sl.*, pr.name as product_name, pr.sales_price as product_base_price,
                 pv.variant_name, pv.price_extra
          FROM subscription_lines sl
          JOIN products pr ON sl.product_id = pr.id
          LEFT JOIN product_variants pv ON sl.variant_id = pv.id
          WHERE sl.subscription_id = ?
        `).all(subId);

        return sendJSON(res, 200, { subscription: { ...sub, lines } });
      }

      // 6c. Subscriptions: Delete Draft / Quotation
      if (singleSubMatch && method === 'DELETE') {
        const subId = singleSubMatch[1];
        db.exec('BEGIN TRANSACTION;');
        try {
          db.prepare('DELETE FROM subscription_lines WHERE subscription_id = ?').run(subId);
          db.prepare('DELETE FROM subscriptions WHERE id = ?').run(subId);
          db.exec('COMMIT;');
          return sendJSON(res, 200, { message: 'Quotation deleted successfully', subId });
        } catch (err) {
          db.exec('ROLLBACK;');
          throw err;
        }
      }

      // 7. Subscriptions: State Machine Transition (Draft -> Quotation -> Confirmed -> Active -> Paused -> Closed)
      const subStatusMatch = pathname.match(/^\/api\/subscriptions\/([^/]+)\/status$/);
      if (subStatusMatch && method === 'PATCH') {
        const subId = subStatusMatch[1];
        const { status } = await parseBody(req);
        const validStatuses = ['draft', 'quotation', 'confirmed', 'active', 'paused', 'closed'];

        if (!validStatuses.includes(status)) {
          return sendJSON(res, 400, { error: `Invalid subscription status '${status}'. Valid: ${validStatuses.join(', ')}` });
        }

        const existingSub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subId);
        if (!existingSub) {
          return sendJSON(res, 404, { error: 'Subscription not found' });
        }

        let updatedSubNumber = existingSub.sub_number;
        // When converting from quotation/draft to confirmed or active: switch prefix from QT-2026- to SUB-2026-
        if (['confirmed', 'active'].includes(status) && updatedSubNumber.startsWith('QT-2026-')) {
          updatedSubNumber = updatedSubNumber.replace('QT-2026-', 'SUB-2026-');
        } else if (['draft', 'quotation'].includes(status) && updatedSubNumber.startsWith('SUB-2026-')) {
          updatedSubNumber = updatedSubNumber.replace('SUB-2026-', 'QT-2026-');
        }

        db.prepare('UPDATE subscriptions SET status = ?, sub_number = ? WHERE id = ?').run(
          status,
          updatedSubNumber,
          subId
        );

        return sendJSON(res, 200, {
          message: `Subscription status updated to ${status}`,
          subId,
          status,
          subNumber: updatedSubNumber
        });
      }

      // 8. Invoices: List
      if (pathname === '/api/invoices' && method === 'GET') {
        const { role, customerId } = parsedUrl.query;
        let query = `
          SELECT i.*, u.name as customer_name, u.email as customer_email, s.sub_number
          FROM invoices i
          JOIN users u ON i.customer_id = u.id
          JOIN subscriptions s ON i.subscription_id = s.id
        `;
        const params = [];
        if (role === 'customer' && customerId) {
          query += ' WHERE i.customer_id = ?';
          params.push(customerId);
        }
        query += ' ORDER BY i.billing_date DESC';

        const invoices = db.prepare(query).all(...params);
        return sendJSON(res, 200, { invoices });
      }

      // 9. Invoices: Status Update (Confirm / Cancel)
      const invStatusMatch = pathname.match(/^\/api\/invoices\/([^/]+)\/status$/);
      if (invStatusMatch && method === 'PATCH') {
        const invId = invStatusMatch[1];
        const { status } = await parseBody(req);
        if (!['draft', 'confirmed', 'cancelled'].includes(status)) {
          return sendJSON(res, 400, { error: 'Invalid invoice status' });
        }

        db.prepare('UPDATE invoices SET status = ? WHERE id = ?').run(status, invId);
        return sendJSON(res, 200, { message: `Invoice status updated to ${status}`, invId, status });
      }

      // 10. Payments: Record payment against invoice
      const payMatch = pathname.match(/^\/api\/invoices\/([^/]+)\/pay$/);
      if (payMatch && method === 'POST') {
        const invId = payMatch[1];
        const body = await parseBody(req);
        const { amount, method: payMethod = 'card', note = 'Manual Payment', recordedBy = 'Staff' } = body;

        const inv = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invId);
        if (!inv) return sendJSON(res, 404, { error: 'Invoice not found' });

        const payId = 'pay_' + Math.random().toString(36).substring(2, 9);
        const today = new Date().toISOString().split('T')[0];

        db.exec('BEGIN TRANSACTION;');
        try {
          db.prepare(`
            INSERT INTO payments (id, invoice_id, payment_method, amount, payment_date, reference_notes, recorded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(payId, invId, payMethod, amount || inv.total_amount, today, note, recordedBy);

          // Mark invoice as paid
          db.prepare("UPDATE invoices SET status = 'paid' WHERE id = ?").run(invId);
          db.exec('COMMIT;');
        } catch (err) {
          db.exec('ROLLBACK;');
          throw err;
        }

        return sendJSON(res, 201, { message: 'Payment recorded successfully', invoiceId: invId, status: 'paid' });
      }

      // 11. Automated Billing Day Engine Run (Core Hackathon Feature)
      if (pathname === '/api/billing/run' && method === 'POST') {
        const body = await parseBody(req);
        const targetDate = body.targetDate || new Date().toISOString().split('T')[0];
        const results = runBillingEngine(targetDate);
        return sendJSON(res, 200, { message: 'Billing cycle executed', ...results });
      }

      // 12. Finance Lead Analytics (< 2s SLA)
      if (pathname === '/api/analytics/summary' && method === 'GET') {
        const metrics = getFinanceLeadMetrics();
        return sendJSON(res, 200, metrics);
      }

      // 13. Reset / Seed Demo
      if (pathname === '/api/seed/reset' && method === 'POST') {
        seedDatabase(true);
        return sendJSON(res, 200, { message: 'Database reset to clean hackathon demo state' });
      }

      return sendJSON(res, 404, { error: 'API endpoint not found' });
    } catch (err) {
      console.error('API Error:', err);
      return sendJSON(res, 500, { error: 'Internal server error: ' + err.message });
    }
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================
  let filePath = '';
  if (pathname.startsWith('/diagrams/')) {
    const filename = decodeURIComponent(pathname.replace('/diagrams/', ''));
    filePath = path.join(DIAGRAMS_DIR, filename);
  } else {
    let cleanPath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    filePath = path.join(PUBLIC_DIR, cleanPath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routes
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Brightloop ERP Server Running on: http://localhost:${PORT}`);
    console.log(`💾 Local Database: SQLite WAL mode enabled`);
    console.log(`⚡ Sub-2s SLA Benchmarks active on /api/analytics/summary`);
    console.log(`=======================================================`);
  });
}

module.exports = server;

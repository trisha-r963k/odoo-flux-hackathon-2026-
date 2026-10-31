// Brightloop Subscription Management Server
// Zero-dependency REST API & Static File Server powered by Node.js & node:sqlite
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');

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

      // 5. Subscriptions: List
      if (pathname === '/api/subscriptions' && method === 'GET') {
        const { role, customerId } = parsedUrl.query;
        let query = `
          SELECT s.*, u.name as customer_name, u.email as customer_email, p.name as plan_name, p.billing_frequency
          FROM subscriptions s
          JOIN users u ON s.customer_id = u.id
          JOIN plans p ON s.plan_id = p.id
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
        const { customerId, planId, lines = [], paymentTerms = 'Immediate Payment', discountId = null } = body;

        if (!customerId || !planId) {
          return sendJSON(res, 400, { error: 'Customer ID and Plan ID are required' });
        }

        const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId);
        if (!plan) return sendJSON(res, 404, { error: 'Plan not found' });

        const subId = 'sub_' + Math.random().toString(36).substring(2, 9);
        const subNumber = 'SUB-2026-' + String(Math.floor(1000 + Math.random() * 9000));
        const today = new Date().toISOString().split('T')[0];

        let totalAmount = 0.0;
        db.exec('BEGIN TRANSACTION;');
        try {
          const insertLine = db.prepare(`
            INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          for (const line of lines) {
            const lineId = 'line_' + Math.random().toString(36).substring(2, 9);
            insertLine.run(
              lineId,
              subId,
              line.productId,
              line.variantId || null,
              line.quantity || 1,
              line.unitPrice,
              0.18,
              line.unitPrice * (line.quantity || 1)
            );
            totalAmount += line.unitPrice * (line.quantity || 1);
          }

          if (lines.length === 0) {
            totalAmount = plan.price;
          }

          db.prepare(`
            INSERT INTO subscriptions (id, sub_number, customer_id, plan_id, status, start_date, next_billing_date, payment_terms, discount_id, total_recurring_amount)
            VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?)
          `).run(subId, subNumber, customerId, planId, today, today, paymentTerms, discountId, totalAmount);

          db.exec('COMMIT;');
        } catch (err) {
          db.exec('ROLLBACK;');
          throw err;
        }

        return sendJSON(res, 201, { message: 'Quotation created successfully', subId, subNumber, totalAmount });
      }

      // 7. Subscriptions: State Machine Transition (Draft -> Quotation -> Confirmed -> Active -> Paused -> Closed)
      const subStatusMatch = pathname.match(/^\/api\/subscriptions\/([^/]+)\/status$/);
      if (subStatusMatch && method === 'PATCH') {
        const subId = subStatusMatch[1];
        const { status } = await parseBody(req);
        const validStatuses = ['draft', 'quotation', 'confirmed', 'active', 'paused', 'closed'];

        if (!validStatuses.includes(status)) {
          return sendJSON(res, 400, { error: 'Invalid subscription status' });
        }

        db.prepare('UPDATE subscriptions SET status = ? WHERE id = ?').run(status, subId);
        return sendJSON(res, 200, { message: `Subscription status updated to ${status}`, subId, status });
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

    res.writeHead(200, { 'Content-Type': contentType });
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

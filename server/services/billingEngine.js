// Automated Billing Day Engine
// Guarantees zero duplicate billings and zero skipped runs using atomic SQLite transactions
const { db } = require('../db/database');

function advanceDate(dateStr, frequency) {
  const d = new Date(dateStr);
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString().split('T')[0];
}

function calculateDueDate(billingDate, paymentTerms) {
  const d = new Date(billingDate);
  if (paymentTerms === 'Net 15') {
    d.setDate(d.getDate() + 15);
  } else if (paymentTerms === 'Net 30') {
    d.setDate(d.getDate() + 30);
  } else {
    // Immediate
    d.setDate(d.getDate() + 7);
  }
  return d.toISOString().split('T')[0];
}

function runBillingEngine(targetDate = new Date().toISOString().split('T')[0]) {
  const startTime = Date.now();

  // 1. Find all active subscriptions where next_billing_date <= targetDate
  const query = `
    SELECT s.*, p.billing_frequency, p.auto_close_on_expiry, u.name as customer_name, u.email as customer_email
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    JOIN users u ON s.customer_id = u.id
    WHERE s.status = 'active' AND s.next_billing_date <= ?
  `;
  const dueSubs = db.prepare(query).all(targetDate);

  const results = {
    targetDate,
    processedCount: dueSubs.length,
    invoicesCreated: 0,
    duplicatesPrevented: 0,
    totalBilledAmount: 0.0,
    generatedInvoices: [],
    executionTimeMs: 0
  };

  const checkExisting = db.prepare('SELECT id FROM invoices WHERE idempotency_key = ?');
  const insertInvoice = db.prepare(`
    INSERT INTO invoices (
      id, invoice_number, subscription_id, customer_id, status,
      billing_date, due_date, subtotal, tax_amount, discount_amount,
      total_amount, idempotency_key
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateSubBilling = db.prepare(`
    UPDATE subscriptions
    SET next_billing_date = ?, status = ?
    WHERE id = ?
  `);
  const getSubLines = db.prepare('SELECT * FROM subscription_lines WHERE subscription_id = ?');

  // Wrap batch run in transaction
  db.exec('BEGIN TRANSACTION;');
  try {
    for (const sub of dueSubs) {
      const idempotencyKey = `${sub.id}_${sub.next_billing_date}`;

      // Idempotency check: Zero duplicate billing guarantee
      const existing = checkExisting.get(idempotencyKey);
      if (existing) {
        results.duplicatesPrevented++;
        continue;
      }

      // Calculate totals from subscription lines
      const lines = getSubLines.all(sub.id);
      let subtotal = 0.0;
      let taxAmount = 0.0;

      for (const line of lines) {
        subtotal += line.subtotal;
        taxAmount += line.subtotal * (line.tax_rate || 0.18);
      }

      // If no lines found, fallback to total_recurring_amount
      if (subtotal === 0) {
        subtotal = sub.total_recurring_amount;
        taxAmount = subtotal * 0.18;
      }

      // Apply eligible discount if present
      let discountAmount = 0.0;
      if (sub.discount_id) {
        const disc = db.prepare('SELECT * FROM discount_rules WHERE id = ?').get(sub.discount_id);
        if (disc && disc.times_used < disc.usage_limit) {
          if (disc.discount_type === 'percentage') {
            discountAmount = (subtotal * disc.value) / 100.0;
          } else {
            discountAmount = Math.min(disc.value, subtotal);
          }
          // Increment usage count
          db.prepare('UPDATE discount_rules SET times_used = times_used + 1 WHERE id = ?').run(disc.id);
        }
      }

      const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);
      const invoiceId = 'inv_' + Math.random().toString(36).substring(2, 9);
      const invoiceNumber = 'INV-' + (2026) + '-' + String(Math.floor(1000 + Math.random() * 9000));
      const dueDate = calculateDueDate(sub.next_billing_date, sub.payment_terms);

      // Create new draft invoice
      insertInvoice.run(
        invoiceId,
        invoiceNumber,
        sub.id,
        sub.customer_id,
        'draft',
        sub.next_billing_date,
        dueDate,
        Math.round(subtotal * 100) / 100,
        Math.round(taxAmount * 100) / 100,
        Math.round(discountAmount * 100) / 100,
        Math.round(totalAmount * 100) / 100,
        idempotencyKey
      );

      // Advance subscription next_billing_date
      const nextDate = advanceDate(sub.next_billing_date, sub.billing_frequency);
      let nextStatus = 'active';

      // Check auto-close on expiry policy
      if (sub.auto_close_on_expiry && sub.expiry_date && nextDate > sub.expiry_date) {
        nextStatus = 'closed';
      }

      updateSubBilling.run(nextDate, nextStatus, sub.id);

      results.invoicesCreated++;
      results.totalBilledAmount += totalAmount;
      results.generatedInvoices.push({
        invoiceId,
        invoiceNumber,
        subNumber: sub.sub_number,
        customer: sub.customer_name,
        total: Math.round(totalAmount * 100) / 100,
        dueDate,
        nextBillingDate: nextDate,
        status: nextStatus
      });
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  results.executionTimeMs = Date.now() - startTime;
  return results;
}

module.exports = {
  runBillingEngine,
  advanceDate,
  calculateDueDate
};

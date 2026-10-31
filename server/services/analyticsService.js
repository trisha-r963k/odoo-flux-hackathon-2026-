// Finance Lead Analytics Service (< 2s SLA benchmarked)
const { db } = require('../db/database');

function getFinanceLeadMetrics(asOfDate = new Date().toISOString().split('T')[0]) {
  const startTime = performance.now();

  // 1. Active Subscriptions & MRR Breakdown
  const subRows = db.prepare(`
    SELECT s.total_recurring_amount, p.billing_frequency
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.status = 'active'
  `).all();

  let mrr = 0.0;
  for (const row of subRows) {
    const amt = row.total_recurring_amount;
    switch (row.billing_frequency) {
      case 'daily':
        mrr += amt * 30.0;
        break;
      case 'weekly':
        mrr += amt * 4.33;
        break;
      case 'monthly':
        mrr += amt;
        break;
      case 'yearly':
        mrr += amt / 12.0;
        break;
      default:
        mrr += amt;
    }
  }

  // 2. Active, Quotation, and Closed Counts
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) as count FROM subscriptions GROUP BY status
  `).all();
  const subStatusMap = {};
  for (const r of statusCounts) {
    subStatusMap[r.status] = r.count;
  }

  // 3. Payments / Cash Collected
  const paymentStats = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total_cash_collected, COUNT(*) as total_payments
    FROM payments
  `).get();

  // 4. Invoices Breakdown (Draft, Confirmed, Paid, Overdue)
  const invoiceStats = db.prepare(`
    SELECT 
      status,
      COUNT(*) as count,
      COALESCE(SUM(total_amount), 0) as total_amount
    FROM invoices
    GROUP BY status
  `).all();

  const invMap = {};
  for (const r of invoiceStats) {
    invMap[r.status] = { count: r.count, amount: r.total_amount };
  }

  // 5. Overdue Invoices (Confirmed invoices with due_date < asOfDate)
  const overdueStats = db.prepare(`
    SELECT 
      COUNT(*) as overdue_count,
      COALESCE(SUM(total_amount), 0) as overdue_amount
    FROM invoices
    WHERE status = 'confirmed' AND due_date < ?
  `).get(asOfDate);

  const durationMs = performance.now() - startTime;

  return {
    asOfDate,
    slaBenchmark: {
      slaTarget: '< 2000 ms',
      actualExecutionTimeMs: Math.round(durationMs * 100) / 100,
      slaPassed: durationMs < 2000
    },
    metrics: {
      mrr: Math.round(mrr * 100) / 100,
      activeSubscriptions: subStatusMap['active'] || 0,
      quotationSubscriptions: subStatusMap['quotation'] || 0,
      totalSubscriptions: (subRows.length || 0) + (subStatusMap['quotation'] || 0) + (subStatusMap['closed'] || 0),
      cashCollected: Math.round(paymentStats.total_cash_collected * 100) / 100,
      totalPaymentsLogged: paymentStats.total_payments,
      outstandingReceivables: Math.round((invMap['confirmed']?.amount || 0) * 100) / 100,
      overdueCount: overdueStats.overdue_count,
      overdueAmount: Math.round(overdueStats.overdue_amount * 100) / 100,
      invoices: invMap
    }
  };
}

module.exports = {
  getFinanceLeadMetrics
};

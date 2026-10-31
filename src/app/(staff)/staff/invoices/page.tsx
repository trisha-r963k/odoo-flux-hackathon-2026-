'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface Invoice {
  id: string | number;
  invoice_number?: string;
  invoiceNumber?: string;
  customer_name?: string;
  customerName?: string;
  subscription_number?: string;
  subscriptionNumber?: string;
  total_amount?: string | number;
  totalAmount?: string | number;
  tax_amount?: string | number;
  taxAmount?: string | number;
  status: string;
  due_date?: string;
  dueDate?: string;
  invoice_date?: string;
  invoiceDate?: string;
}

const STATUS_COLORS: Record<string, string> = {
  paid:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  draft:     'bg-slate-50 text-slate-600 border-slate-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function StaffInvoicesPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionId, setActionId] = React.useState<string | number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [payModalInv, setPayModalInv] = React.useState<Invoice | null>(null);
  const [payMethod, setPayMethod] = React.useState('bank_transfer');
  const [payRef, setPayRef] = React.useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/invoices');
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setInvoices(data.invoices || data);
      setError(null);
    } catch {
      setError('Cannot reach server at localhost:3000');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  async function updateStatus(id: string | number, status: string) {
    setActionId(id);
    try {
      await fetch(`http://localhost:3000/api/invoices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await load();
    } catch {
      setError('Action failed — server error');
    } finally {
      setActionId(null);
    }
  }

  async function executePayment() {
    if (!payModalInv) return;
    setActionId(payModalInv.id);
    try {
      await fetch(`http://localhost:3000/api/invoices/${payModalInv.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: payMethod, note: payRef || 'Settled in staff console' }),
      });
      setPayModalInv(null);
      await load();
    } catch {
      setError('Payment action failed');
    } finally {
      setActionId(null);
    }
  }

  const statusCounts = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + parseFloat(String(i.total_amount || i.totalAmount || 0)), 0);

  const filtered = invoices.filter(inv => {
    const num = inv.invoice_number || inv.invoiceNumber || '';
    const cust = inv.customer_name || inv.customerName || '';
    const matchSearch = num.toLowerCase().includes(search.toLowerCase()) ||
                        cust.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#008784] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900">Invoice Management</h1>
              <span className="bg-teal-50 text-[#008784] text-[10px] font-bold px-2 py-0.5 rounded border border-teal-200">
                STAFF CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Confirm drafts, record payments &amp; track receivables</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/staff/subscriptions"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition"
          >
            Subscriptions
          </Link>
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-900">{session?.user?.name || 'Staff User'}</div>
            <div className="text-[11px] text-slate-500 font-mono">{session?.user?.email}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-8 py-8 flex-1 space-y-6">

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Invoices', value: invoices.length, color: 'text-slate-900' },
            { label: 'Paid Statements', value: statusCounts['paid'] || 0, color: 'text-emerald-700' },
            { label: 'Pending Confirmation', value: statusCounts['draft'] || 0, color: 'text-amber-600' },
            { label: 'Revenue Settled', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-[#714b67]' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</div>
              <div className={`text-2xl font-extrabold mt-1 ${kpi.color}`}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            {['all', 'draft', 'confirmed', 'paid', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  statusFilter === s
                    ? 'bg-[#008784] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'all' ? `All (${invoices.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${statusCounts[s] || 0})`}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search invoice # or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ml-auto px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:border-[#008784] outline-none w-64 bg-white"
          />
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Invoices Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">All Billing Statements</h2>
              <p className="text-xs text-slate-500 mt-0.5">Recurring invoices created from subscription billing engine</p>
            </div>
            <button onClick={load} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-semibold transition">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading billing statements...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">No invoices found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Invoice #', 'Customer Legal Name', 'Subscription #', 'Amount', 'Tax (18%)', 'Status', 'Due Date', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[11px] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(inv => {
                    const invNum = inv.invoice_number || inv.invoiceNumber || '—';
                    const custName = inv.customer_name || inv.customerName || '—';
                    const subNum = inv.subscription_number || inv.subscriptionNumber || '—';
                    const amount = parseFloat(String(inv.total_amount || inv.totalAmount || 0)).toFixed(2);
                    const tax = parseFloat(String(inv.tax_amount || inv.taxAmount || 0)).toFixed(2);
                    const dueDate = inv.due_date || inv.dueDate || '—';
                    const isBusy = actionId === inv.id;
                    const isOverdue = dueDate !== '—' && new Date(dueDate) < new Date() && inv.status !== 'paid' && inv.status !== 'cancelled';

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-[#714b67] font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                            {invNum}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{custName}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-500">{subNum}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">${amount}</td>
                        <td className="px-5 py-3.5 text-slate-500">${tax}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isOverdue ? 'bg-red-50 text-red-700 border-red-200' : (STATUS_COLORS[inv.status] || '')}`}>
                            {isOverdue ? 'OVERDUE' : inv.status.toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-5 py-3.5 font-mono ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                          {dueDate}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1.5">
                            {inv.status === 'draft' && (
                              <button
                                onClick={() => updateStatus(inv.id, 'confirmed')}
                                disabled={isBusy}
                                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition disabled:opacity-50"
                              >
                                Confirm
                              </button>
                            )}
                            {inv.status === 'confirmed' && (
                              <button
                                onClick={() => {
                                  setPayModalInv(inv);
                                  setPayRef(`TXN-${Date.now().toString().slice(-6)}`);
                                }}
                                disabled={isBusy}
                                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#008784] hover:bg-[#006e6b] rounded transition disabled:opacity-50"
                              >
                                Record Payment
                              </button>
                            )}
                            {(inv.status === 'draft' || inv.status === 'confirmed') && (
                              <button
                                onClick={() => updateStatus(inv.id, 'cancelled')}
                                disabled={isBusy}
                                className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                title="Cancel invoice"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Payment Recording Modal */}
      {payModalInv && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6">
            <h4 className="font-bold text-slate-900 text-sm">Record Payment</h4>
            <p className="text-xs text-slate-500 mt-1">
              Invoice: <strong>{payModalInv.invoice_number || payModalInv.invoiceNumber}</strong> &bull; Amount: <strong>${parseFloat(String(payModalInv.total_amount || 0)).toFixed(2)}</strong>
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#008784]"
                >
                  <option value="bank_transfer">Direct Bank Transfer (ACH/Wire)</option>
                  <option value="credit_card">Corporate Credit Card</option>
                  <option value="check">Company Check</option>
                  <option value="cash">Cash / Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Reference ID / Note</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  placeholder="e.g. WIRE-849204"
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#008784]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setPayModalInv(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={executePayment}
                className="px-3.5 py-1.5 bg-[#008784] text-white text-xs font-semibold rounded-md hover:bg-[#006e6b] transition"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

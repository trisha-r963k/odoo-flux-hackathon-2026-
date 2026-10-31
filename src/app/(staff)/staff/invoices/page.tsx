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
  paid:      'bg-emerald-100 text-emerald-800 border-emerald-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  draft:     'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_ICONS: Record<string, string> = {
  paid: '✅', confirmed: '📋', draft: '📝', cancelled: '❌',
};

export default function StaffInvoicesPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionId, setActionId] = React.useState<string | number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

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

  async function markPaid(id: string | number) {
    setActionId(id);
    try {
      await fetch(`http://localhost:3000/api/invoices/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'bank_transfer', note: 'Marked as paid by staff' }),
      });
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

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-[#008784] text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900">Invoice Management</h1>
              <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-teal-200">
                STAFF CONSOLE
              </span>
            </div>
            <p className="text-xs text-slate-500">Confirm, track, and collect payments for all invoices</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/staff/subscriptions"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
          >
            📋 Subscriptions
          </Link>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">{session?.user?.name || 'Staff User'}</div>
            <div className="text-[11px] text-slate-500 font-mono">{session?.user?.email}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-8 py-8 flex-1 space-y-6">

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Invoices', value: invoices.length, color: 'text-slate-900' },
            { label: 'Paid', value: statusCounts['paid'] || 0, color: 'text-emerald-700' },
            { label: 'Pending Confirmation', value: statusCounts['draft'] || 0, color: 'text-amber-600' },
            { label: 'Total Revenue Collected', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-[#714b67]' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</div>
              <div className={`text-2xl font-extrabold mt-1 ${kpi.color}`}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-2 items-center">
          {['all', 'draft', 'confirmed', 'paid', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                statusFilter === s
                  ? 'bg-[#008784] text-white border-[#008784]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {STATUS_ICONS[s] || '📄'} {s === 'all' ? `All (${invoices.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${statusCounts[s] || 0})`}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search invoice # or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ml-auto px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-[#008784] outline-none w-60"
          />
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-700 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* ── Invoices Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">All Invoices</h2>
              <p className="text-xs text-slate-500 mt-0.5">Confirm drafts · mark paid · cancel if needed</p>
            </div>
            <button onClick={load} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition">
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm animate-pulse">Loading invoices...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No invoices found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Invoice #', 'Customer', 'Sub #', 'Amount', 'Tax', 'Status', 'Due Date', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
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
                      <tr key={inv.id} className={`hover:bg-slate-50/80 transition ${isBusy ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs text-[#714b67] font-bold">{invNum}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-slate-800">{custName}</td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs text-slate-500">{subNum}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-extrabold text-slate-900">${amount}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">${tax}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[inv.status] || ''}`}>
                            {STATUS_ICONS[inv.status]} {inv.status.toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-4 py-3.5 text-xs font-mono ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                          {isOverdue ? '⚠️ ' : ''}{dueDate}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1.5">
                            {inv.status === 'draft' && (
                              <button
                                onClick={() => updateStatus(inv.id, 'confirmed')}
                                disabled={isBusy}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition disabled:opacity-50"
                              >
                                {isBusy ? '...' : '✓ Confirm'}
                              </button>
                            )}
                            {inv.status === 'confirmed' && (
                              <button
                                onClick={() => markPaid(inv.id)}
                                disabled={isBusy}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition disabled:opacity-50"
                              >
                                {isBusy ? '...' : '💰 Mark Paid'}
                              </button>
                            )}
                            {(inv.status === 'draft' || inv.status === 'confirmed') && (
                              <button
                                onClick={() => updateStatus(inv.id, 'cancelled')}
                                disabled={isBusy}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-400 hover:bg-red-500 rounded-lg transition disabled:opacity-50"
                              >
                                {isBusy ? '...' : '✕'}
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
    </div>
  );
}

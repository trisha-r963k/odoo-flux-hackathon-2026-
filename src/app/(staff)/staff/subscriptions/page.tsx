'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface Subscription {
  id: string | number;
  subscription_number?: string;
  subscriptionNumber?: string;
  customer_name?: string;
  customerName?: string;
  plan_name?: string;
  planName?: string;
  total_amount?: string | number;
  totalAmount?: string | number;
  status: string;
  next_billing_date?: string;
  nextBillingDate?: string;
  start_date?: string;
  startDate?: string;
}

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-800 border-emerald-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  quotation: 'bg-amber-100 text-amber-800 border-amber-200',
  draft:     'bg-slate-100 text-slate-600 border-slate-200',
  paused:    'bg-orange-100 text-orange-800 border-orange-200',
  closed:    'bg-red-100 text-red-700 border-red-200',
};

const TRANSITIONS: Record<string, { label: string; next: string; color: string }[]> = {
  draft:     [{ label: '→ Quotation', next: 'quotation', color: 'bg-amber-500 hover:bg-amber-600' }],
  quotation: [{ label: '→ Confirm',   next: 'confirmed', color: 'bg-blue-500 hover:bg-blue-600' }],
  confirmed: [{ label: '→ Activate',  next: 'active',    color: 'bg-emerald-500 hover:bg-emerald-600' }],
  active:    [
    { label: '⏸ Pause', next: 'paused', color: 'bg-orange-400 hover:bg-orange-500' },
    { label: '✕ Close', next: 'closed', color: 'bg-red-400 hover:bg-red-500' },
  ],
  paused:    [
    { label: '▶ Resume', next: 'active', color: 'bg-emerald-500 hover:bg-emerald-600' },
    { label: '✕ Close',  next: 'closed', color: 'bg-red-400 hover:bg-red-500' },
  ],
};

export default function StaffSubscriptionsPage() {
  const { data: session } = useSession();
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [transitioning, setTransitioning] = React.useState<string | number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/subscriptions');
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setSubscriptions(data.subscriptions || data);
      setError(null);
    } catch {
      setError('Cannot reach server at localhost:3000');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  async function changeStatus(id: string | number, next: string) {
    setTransitioning(id);
    try {
      await fetch(`http://localhost:3000/api/subscriptions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      await load();
    } catch {
      setError('Status update failed');
    } finally {
      setTransitioning(null);
    }
  }

  const filtered = subscriptions.filter(sub => {
    const num = sub.subscription_number || sub.subscriptionNumber || '';
    const cust = sub.customer_name || sub.customerName || '';
    const matchSearch = num.toLowerCase().includes(search.toLowerCase()) ||
                        cust.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = subscriptions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
              <h1 className="text-base font-extrabold text-slate-900">Sales &amp; Operations Portal</h1>
              <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-teal-200">
                STAFF CONSOLE
              </span>
            </div>
            <p className="text-xs text-slate-500">Subscription lifecycle management &amp; invoice tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/staff/invoices" className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition">
            🧾 View Invoices
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

        {/* ── Status Summary Pills ── */}
        <div className="flex flex-wrap gap-2">
          {['all', 'active', 'quotation', 'confirmed', 'draft', 'paused', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                statusFilter === s
                  ? 'bg-[#008784] text-white border-[#008784]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {s === 'all' ? `All (${subscriptions.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${statusCounts[s] || 0})`}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search by Sub # or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ml-auto px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-[#008784] outline-none w-56"
          />
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-700 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* ── Subscriptions Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Subscriptions Master List</h2>
              <p className="text-xs text-slate-500 mt-0.5">Full access to quotes, subscriptions &amp; lifecycle transitions</p>
            </div>
            <button
              onClick={load}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition"
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="text-slate-400 text-sm animate-pulse">Loading subscriptions...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No subscriptions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Sub #', 'Customer', 'Plan', 'Amount', 'Status', 'Next Billing', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(sub => {
                    const subNum = sub.subscription_number || sub.subscriptionNumber || '—';
                    const custName = sub.customer_name || sub.customerName || '—';
                    const planName = sub.plan_name || sub.planName || '—';
                    const amount = parseFloat(String(sub.total_amount || sub.totalAmount || 0)).toFixed(2);
                    const billing = sub.next_billing_date || sub.nextBillingDate || '—';
                    const isBusy = transitioning === sub.id;
                    const actions = TRANSITIONS[sub.status] || [];

                    return (
                      <tr key={sub.id} className={`hover:bg-slate-50/80 transition ${isBusy ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs text-[#714b67] font-bold">{subNum}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-slate-800">{custName}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-600">{planName}</td>
                        <td className="px-4 py-3.5 text-xs font-extrabold text-slate-900">${amount}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[sub.status] || 'bg-slate-100 text-slate-600'}`}>
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{billing}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1.5 flex-wrap">
                            {actions.map(action => (
                              <button
                                key={action.next}
                                onClick={() => changeStatus(sub.id, action.next)}
                                disabled={isBusy}
                                className={`px-2.5 py-1 text-[11px] font-bold text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
                              >
                                {isBusy ? '...' : action.label}
                              </button>
                            ))}
                            {actions.length === 0 && (
                              <span className="text-[11px] text-slate-400 italic">No transitions</span>
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

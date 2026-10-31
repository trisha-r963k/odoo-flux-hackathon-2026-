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
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  quotation: 'bg-amber-50 text-amber-700 border-amber-200',
  draft:     'bg-slate-50 text-slate-600 border-slate-200',
  paused:    'bg-orange-50 text-orange-700 border-orange-200',
  closed:    'bg-slate-100 text-slate-500 border-slate-200',
};

const TRANSITIONS: Record<string, { label: string; next: string; color: string }[]> = {
  draft:     [{ label: '→ Quotation', next: 'quotation', color: 'bg-slate-700 hover:bg-slate-800' }],
  quotation: [{ label: 'Confirm Quote', next: 'confirmed', color: 'bg-[#008784] hover:bg-[#006e6b]' }],
  confirmed: [{ label: 'Activate', next: 'active', color: 'bg-[#714b67] hover:bg-[#593952]' }],
  active:    [
    { label: 'Pause', next: 'paused', color: 'bg-slate-600 hover:bg-slate-700' },
    { label: 'Close', next: 'closed', color: 'bg-rose-600 hover:bg-rose-700' },
  ],
  paused:    [
    { label: 'Resume', next: 'active', color: 'bg-[#714b67] hover:bg-[#593952]' },
    { label: 'Close', next: 'closed', color: 'bg-rose-600 hover:bg-rose-700' },
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
  const [confirmModal, setConfirmModal] = React.useState<{ id: string | number; next: string; name: string } | null>(null);

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
    setConfirmModal(null);
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

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#008784] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900">Sales &amp; Operations Portal</h1>
              <span className="bg-teal-50 text-[#008784] text-[10px] font-bold px-2 py-0.5 rounded border border-teal-200">
                STAFF CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Subscription lifecycle management &amp; invoice tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/staff/invoices" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition">
            View Invoices
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

        {/* Filter Toolbar */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            {['all', 'active', 'quotation', 'confirmed', 'draft', 'paused', 'closed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  statusFilter === s
                    ? 'bg-[#008784] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'all' ? `All (${subscriptions.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${statusCounts[s] || 0})`}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search Sub # or customer..."
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

        {/* Subscriptions Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Subscription Master Records</h2>
              <p className="text-xs text-slate-500 mt-0.5">Full lifecycle transitions from Draft to Active</p>
            </div>
            <button
              onClick={load}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-semibold transition"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading subscriptions...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">No subscriptions found matching query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Subscription #', 'Customer Legal Name', 'Billing Plan', 'Amount', 'Status', 'Next Billing Date', 'Lifecycle Action'].map(h => (
                      <th key={h} className="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[11px] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(sub => {
                    const subNum = sub.subscription_number || sub.subscriptionNumber || '—';
                    const custName = sub.customer_name || sub.customerName || '—';
                    const planName = sub.plan_name || sub.planName || '—';
                    const amount = parseFloat(String(sub.total_amount || sub.totalAmount || 0)).toFixed(2);
                    const billing = sub.next_billing_date || sub.nextBillingDate || '—';
                    const isBusy = transitioning === sub.id;
                    const actions = TRANSITIONS[sub.status] || [];

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-[#714b67] font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                            {subNum}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{custName}</td>
                        <td className="px-5 py-3.5 text-slate-600">{planName}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">${amount}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[sub.status] || 'bg-slate-100 text-slate-600'}`}>
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-mono">{billing}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1.5 flex-wrap">
                            {actions.map(action => (
                              <button
                                key={action.next}
                                onClick={() => setConfirmModal({ id: sub.id, next: action.next, name: subNum })}
                                disabled={isBusy}
                                className={`px-2.5 py-1 text-[11px] font-semibold text-white rounded transition disabled:opacity-50 ${action.color}`}
                              >
                                {action.label}
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

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6">
            <h4 className="font-bold text-slate-900 text-sm">Confirm Status Transition</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to transition subscription <strong>{confirmModal.name}</strong> to <strong>{confirmModal.next.toUpperCase()}</strong>?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => changeStatus(confirmModal.id, confirmModal.next)}
                className="px-3.5 py-1.5 bg-[#008784] text-white text-xs font-semibold rounded-md hover:bg-[#006e6b] transition"
              >
                Confirm Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

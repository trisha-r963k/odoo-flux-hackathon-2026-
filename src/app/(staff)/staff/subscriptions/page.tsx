'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  Pause,
  Play,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Send,
  Building,
  Calendar,
  Layers,
  ChevronRight,
  Receipt,
} from 'lucide-react';

interface SubscriptionItem {
  id: string;
  sub_number: string;
  subscriptionNo: string;
  customer_name: string;
  customer_email: string;
  plan_name: string;
  status: string;
  start_date: string;
  next_billing_date: string;
  total_recurring_amount: number;
  discount?: {
    code: string;
    value: number;
    type: string;
  } | null;
}

export default function StaffSubscriptionsPage() {
  const { data: session } = useSession();
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (activeFilter !== 'ALL') query.set('status', activeFilter);
      if (searchTerm) query.set('search', searchTerm);

      const res = await fetch(`/api/subscriptions?${query.toString()}`);
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err: any) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [activeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSubscriptions();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/subscriptions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed');
      await loadSubscriptions();
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
            <Clock className="w-3 h-3 text-slate-500" />
            Draft
          </span>
        );
      case 'quotation':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
            <Send className="w-3 h-3 text-amber-600" />
            Quotation Sent
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
            <CheckCircle className="w-3 h-3 text-indigo-600" />
            Confirmed
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-800 border border-orange-200 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
            <Pause className="w-3 h-3 text-orange-600" />
            Paused
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
            <XCircle className="w-3 h-3 text-rose-600" />
            Closed
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
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
            <p className="text-xs text-slate-500">
              Quotation generation, subscriptions master list &amp; invoice tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/staff/invoices"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>View Invoices</span>
          </Link>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">{session?.user?.name || 'Operations Staff'}</div>
            <div className="text-[11px] text-slate-500 font-mono">{session?.user?.email || 'staff@brightloop.com'}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 space-y-6">
        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Subscriptions &amp; Quotations Master List</h2>
            <p className="text-xs text-slate-500 mt-1">
              Team-wide visibility across all contract states: Drafts, Quotations, Active, Paused, and Closed agreements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadSubscriptions}
              className="p-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              title="Refresh list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/staff/quotes/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#714b67] to-[#9333ea] hover:opacity-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Quotation</span>
            </Link>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-[#714b67] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {filter === 'ALL' ? 'All Agreements' : filter}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search sub #, client, plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#714b67] w-56"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 transition"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Master Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Agreement / ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan &amp; Billing</th>
                  <th className="py-3 px-4">Recurring Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Next Billing</th>
                  <th className="py-3 px-4 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#714b67] mb-2" />
                      <span>Loading agreements from database...</span>
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      <p className="font-semibold text-slate-700">No agreements found matching your filter.</p>
                      <Link
                        href="/staff/quotes/new"
                        className="inline-block mt-3 text-xs font-bold text-[#714b67] hover:underline"
                      >
                        Create your first quotation &rarr;
                      </Link>
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => {
                    const isQT = sub.sub_number.startsWith('QT-');
                    const status = sub.status.toLowerCase();

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                        {/* Number */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-black text-slate-900 text-xs flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                isQT
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-teal-100 text-teal-900 border border-teal-300'
                              }`}
                            >
                              {sub.sub_number}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Created: {sub.start_date}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{sub.customer_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{sub.customer_email}</div>
                        </td>

                        {/* Plan */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{sub.plan_name}</div>
                          {sub.discount && (
                            <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                              <span>Coupon {sub.discount.code}</span>
                              <span>(-{sub.discount.value}%)</span>
                            </div>
                          )}
                        </td>

                        {/* Recurring Total */}
                        <td className="py-3.5 px-4 font-mono font-black text-[#714b67]">
                          ${Number(sub.total_recurring_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">{getStatusBadge(sub.status)}</td>

                        {/* Next Billing */}
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {sub.next_billing_date || '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* DRAFT actions */}
                            {status === 'draft' && (
                              <button
                                onClick={() => updateStatus(sub.id, 'QUOTATION')}
                                disabled={actionLoading === sub.id}
                                className="bg-[#008784] hover:bg-[#006e6b] text-white font-bold text-[11px] px-2.5 py-1 rounded transition"
                                title="Send quote to customer"
                              >
                                Send Quote
                              </button>
                            )}

                            {/* QUOTATION actions */}
                            {status === 'quotation' && (
                              <>
                                <button
                                  onClick={() => updateStatus(sub.id, 'CONFIRMED')}
                                  disabled={actionLoading === sub.id}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-2.5 py-1 rounded transition"
                                  title="Confirm Agreement"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => updateStatus(sub.id, 'ACTIVE')}
                                  disabled={actionLoading === sub.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded transition"
                                  title="Convert to Active Subscription (SUB-2026-XXXX)"
                                >
                                  Activate
                                </button>
                              </>
                            )}

                            {/* CONFIRMED actions */}
                            {status === 'confirmed' && (
                              <button
                                onClick={() => updateStatus(sub.id, 'ACTIVE')}
                                disabled={actionLoading === sub.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded transition"
                              >
                                Activate
                              </button>
                            )}

                            {/* ACTIVE actions */}
                            {status === 'active' && (
                              <>
                                <button
                                  onClick={() => updateStatus(sub.id, 'PAUSED')}
                                  disabled={actionLoading === sub.id}
                                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] px-2.5 py-1 rounded transition"
                                  title="Pause subscription"
                                >
                                  Pause
                                </button>
                                <button
                                  onClick={() => updateStatus(sub.id, 'CLOSED')}
                                  disabled={actionLoading === sub.id}
                                  className="border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-[11px] px-2.5 py-1 rounded transition"
                                  title="Close subscription"
                                >
                                  Close
                                </button>
                              </>
                            )}

                            {/* PAUSED actions */}
                            {status === 'paused' && (
                              <button
                                onClick={() => updateStatus(sub.id, 'ACTIVE')}
                                disabled={actionLoading === sub.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded transition"
                                title="Resume subscription"
                              >
                                Resume
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

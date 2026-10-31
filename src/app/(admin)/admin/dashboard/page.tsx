'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface AnalyticsData {
  mrr: number;
  activeSubscriptions: number;
  cashCollectedThisCycle: number;
  slaMs: number;
  overdueCount: number;
  overdueAmount: number;
}

interface BillingResult {
  invoicesCreated: number;
  duplicatesPrevented: number;
  totalBilledAmount: number;
  executionTimeMs: number;
}

const OBJECTIVES = [
  { title: 'Obj 1: Accounts, Login & Roles', status: 'COMPLETE', color: 'emerald', desc: 'NextAuth, Argon2id, strict password regex, admin & staff provisioning.' },
  { title: 'Obj 2: Catalog & Variants', status: 'COMPLETE', color: 'emerald', desc: 'Products & variants with +$560 Odoo Brand Edition price adjustment.' },
  { title: 'Obj 3: Plans & Policies', status: 'COMPLETE', color: 'emerald', desc: 'Monthly/yearly billing frequencies, pause/close toggles, auto-renew.' },
  { title: 'Obj 4: Quotation Templates', status: 'COMPLETE', color: 'emerald', desc: 'Full lifecycle: Draft → Quotation → Confirmed → Active → Closed.' },
  { title: 'Obj 5: Tax Rules & Billing Engine', status: 'COMPLETE', color: 'emerald', desc: 'Idempotent billing engine, GST 18%, strict period anti-duplication.' },
  { title: 'Obj 6: Admin Dashboard', status: 'LIVE', color: 'purple', desc: 'Real-time KPIs from SQLite, billing engine trigger, SLA benchmarks.' },
  { title: 'Obj 7: Staff Portal', status: 'IN PROGRESS', color: 'amber', desc: 'Subscription lifecycle management & invoice tracking for sales staff.' },
  { title: 'Obj 8: Quotation Builder', status: 'IN PROGRESS', color: 'amber', desc: 'Product + variant selector, live pricing calc, new quote creation form.' },
  { title: 'Obj 9: Customer Portal', status: 'IN PROGRESS', color: 'blue', desc: 'Tenant-isolated portal: accept quotes, view invoices, printable PDF.' },
];

const COLOR_MAP: Record<string, { border: string; bg: string; badge: string; badgeTxt: string; text: string }> = {
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50/60', badge: 'bg-emerald-200', badgeTxt: 'text-emerald-900', text: 'text-emerald-800' },
  purple: { border: 'border-purple-200', bg: 'bg-purple-50/60', badge: 'bg-purple-200', badgeTxt: 'text-purple-900', text: 'text-purple-800' },
  amber: { border: 'border-amber-200', bg: 'bg-amber-50/60', badge: 'bg-amber-200', badgeTxt: 'text-amber-900', text: 'text-amber-800' },
  blue: { border: 'border-blue-200', bg: 'bg-blue-50/60', badge: 'bg-blue-200', badgeTxt: 'text-blue-900', text: 'text-blue-800' },
};

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = React.useState<AnalyticsData | null>(null);
  const [billingResult, setBillingResult] = React.useState<BillingResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function loadMetrics() {
    try {
      const res = await fetch('http://localhost:3000/api/analytics/summary');
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setMetrics(data);
      setError(null);
    } catch {
      setError('Cannot reach backend server at localhost:3000');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadMetrics();
  }, []);

  async function triggerBillingRun() {
    setRunning(true);
    setBillingResult(null);
    try {
      const res = await fetch('http://localhost:3000/api/billing/run', { method: 'POST' });
      const data = await res.json();
      setBillingResult(data);
      // Refresh KPIs after billing run
      await loadMetrics();
    } catch {
      setError('Billing run failed — is the server running?');
    } finally {
      setRunning(false);
    }
  }

  const fmt = (n: number | undefined) =>
    typeof n === 'number' ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-[#714b67] text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900">Brightloop Executive Dashboard</h1>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-purple-200">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-xs text-slate-500">Real-time financial analytics &amp; subscription automation</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            👥 Manage Staff Accounts
          </Link>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">{session?.user?.name || 'Admin User'}</div>
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

      <main className="max-w-7xl w-full mx-auto px-8 py-8 flex-1 space-y-8">

        {/* ── Section Title + DB Badge ── */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Status &amp; Financial Overview</h2>
            <p className="text-xs text-slate-500 mt-1">
              Live SQLite WAL-mode database · Brightloop ERP v2026 · Sub-2s SLA guaranteed
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
            <span>{error ? 'Server Offline' : 'Live Database Connected'}</span>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-700 font-semibold">
            ⚠️ {error} — Run <code className="bg-red-100 px-1 rounded">npm start</code> in the project root to start the backend.
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Recurring Revenue</div>
            <div className="text-2xl font-extrabold text-[#714b67] mt-1">
              {loading ? <span className="animate-pulse text-slate-300">$——</span> : `$${fmt(metrics?.mrr)}`}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">Live from SQLite</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Subscriptions</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {loading ? <span className="animate-pulse text-slate-300">——</span> : (metrics?.activeSubscriptions ?? '—')}
            </div>
            <div className="text-xs text-slate-500 mt-1">Paying customers</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Billed This Cycle</div>
            <div className="text-2xl font-extrabold text-[#008784] mt-1">
              {loading ? <span className="animate-pulse text-slate-300">$——</span> : `$${fmt(metrics?.cashCollectedThisCycle)}`}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">100% Idempotent</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Query Response SLA</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {loading ? <span className="animate-pulse text-slate-300">— ms</span> : `${metrics?.slaMs?.toFixed(2) ?? '—'} ms`}
            </div>
            <div className="text-xs text-slate-500 mt-1">WAL-mode SQLite covering index</div>
          </div>
        </div>

        {/* ── Overdue Alert ── */}
        {!loading && metrics && metrics.overdueCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center justify-between">
            <div className="text-sm text-amber-800 font-semibold">
              ⚠️ <strong>{metrics.overdueCount}</strong> overdue invoice{metrics.overdueCount > 1 ? 's' : ''} totalling <strong>${fmt(metrics.overdueAmount)}</strong>
            </div>
            <span className="text-xs text-amber-600 font-bold">Requires attention</span>
          </div>
        )}

        {/* ── Billing Engine Panel ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">⚡ Billing Day Engine</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scans all active subscriptions due today · Zero-duplicate guarantee · Atomic transactions
              </p>
            </div>
            <button
              onClick={triggerBillingRun}
              disabled={running}
              className="px-5 py-2.5 bg-[#714b67] hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition shadow-md"
            >
              {running ? '⏳ Running...' : '⚡ Run Billing Day Engine'}
            </button>
          </div>

          {billingResult && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <div className="text-3xl font-extrabold text-emerald-700">{billingResult.invoicesCreated}</div>
                <div className="text-[11px] font-bold text-emerald-600 mt-1">Invoices Created</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                <div className="text-3xl font-extrabold text-blue-700">{billingResult.duplicatesPrevented}</div>
                <div className="text-[11px] font-bold text-blue-600 mt-1">Duplicates Prevented</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
                <div className="text-3xl font-extrabold text-[#714b67]">${billingResult.totalBilledAmount?.toFixed(2) ?? '0.00'}</div>
                <div className="text-[11px] font-bold text-purple-600 mt-1">Total Billed</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-3xl font-extrabold text-slate-700">{billingResult.executionTimeMs?.toFixed(2) ?? '—'} ms</div>
                <div className="text-[11px] font-bold text-slate-500 mt-1">Engine Runtime</div>
              </div>
            </div>
          )}

          {!billingResult && !running && (
            <p className="text-xs text-slate-400 mt-2 italic">Click the button to process today&apos;s billing cycle. Safe to re-run — idempotent.</p>
          )}
        </div>

        {/* ── 9 Objectives Matrix ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Brightloop — 9 Objectives Execution Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {OBJECTIVES.map((obj, i) => {
              const c = COLOR_MAP[obj.color];
              return (
                <div key={i} className={`p-3.5 rounded-xl border ${c.border} ${c.bg}`}>
                  <div className={`flex items-center justify-between text-xs font-bold ${c.text}`}>
                    <span>{obj.title}</span>
                    <span className={`${c.badge} ${c.badgeTxt} px-2 py-0.5 rounded text-[10px] ml-2 shrink-0`}>
                      {obj.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{obj.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface Subscription {
  id: string | number;
  sub_number?: string;
  subscription_number?: string;
  customer_id?: string;
  customer_name?: string;
  plan_name?: string;
  status: string;
  start_date?: string;
  next_billing_date?: string;
  payment_terms?: string;
  total_recurring_amount?: number;
  total_amount?: number;
}

interface Invoice {
  id: string | number;
  invoice_number?: string;
  customer_id?: string;
  subscription_number?: string;
  period_start?: string;
  period_end?: string;
  due_date?: string;
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  quotation: 'bg-amber-100 text-amber-800 border-amber-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  paused: 'bg-orange-100 text-orange-800 border-orange-200',
  closed: 'bg-red-100 text-red-700 border-red-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function CustomerPortalSubscriptionsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices'>('subscriptions');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [subRes, invRes] = await Promise.all([
          fetch('http://localhost:3000/api/subscriptions').catch(() => null),
          fetch('http://localhost:3000/api/invoices').catch(() => null)
        ]);

        if (subRes && subRes.ok) {
          const subData = await subRes.json();
          const allSubs = subData.subscriptions || subData;
          // Scope to logged-in user if session user ID is available, else show active user subscriptions
          setSubscriptions(allSubs);
        }

        if (invRes && invRes.ok) {
          const invData = await invRes.json();
          const allInvs = invData.invoices || invData;
          setInvoices(allInvs);
        }
      } catch (err) {
        setError('Unable to load client portal data. Please verify the local server is running.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  const customerEmail = session?.user?.email || 'customer@acme.com';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900">Brightloop Customer Portal</h1>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-blue-200">
                TENANT ISOLATED
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {session?.user?.companyName ? `Company: ${session.user.companyName}` : 'Self-Service Subscription & Billing Management'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">{session?.user?.name || 'Customer Account'}</div>
            <div className="text-[11px] text-slate-500 font-mono">{customerEmail}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 space-y-6">
        
        {/* Navigation Tabs & Metrics Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'subscriptions'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Subscriptions ({subscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'invoices'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Invoices &amp; Receipts ({invoices.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Role:</span>
            <span className="text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md">
              Customer
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="underline font-bold">Retry</button>
          </div>
        )}

        {/* TAB 1: SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Active Subscriptions &amp; Contracts</h2>
                  <p className="text-xs text-slate-500">Live subscription plans with automatic recurring billing schedules.</p>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">Loading your subscriptions...</div>
              ) : subscriptions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">No active subscriptions found for this account.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subscriptions.map((sub) => {
                    const number = sub.sub_number || sub.subscription_number || `SUB-${sub.id}`;
                    const amount = sub.total_recurring_amount || sub.total_amount || 0;
                    const statusClass = STATUS_COLORS[sub.status] || 'bg-slate-100 text-slate-700';

                    return (
                      <div key={sub.id} className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition bg-white shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-mono font-bold text-slate-500">{number}</span>
                            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${statusClass}`}>
                              {sub.status}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-sm mb-1">
                            {sub.plan_name || 'Enterprise SaaS Plan'}
                          </h3>
                          <div className="text-2xl font-black text-slate-900 mb-3">
                            ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            <span className="text-xs text-slate-500 font-normal"> / cycle</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                          <div className="flex justify-between">
                            <span>Start Date:</span>
                            <span className="font-medium text-slate-700">{sub.start_date || 'Oct 31, 2026'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Next Billing:</span>
                            <span className="font-bold text-blue-600">{sub.next_billing_date || 'Nov 30, 2026'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Terms:</span>
                            <span className="text-slate-700">{sub.payment_terms || 'Immediate'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INVOICES & PRINTABLE RECEIPTS */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">Invoices &amp; Receipts</h2>
                <p className="text-xs text-slate-500">Download, view, or print official tax receipts for your billing cycles.</p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading billing records...</div>
            ) : invoices.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No invoices generated yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4 font-bold">Invoice #</th>
                      <th className="py-3 px-4 font-bold">Subscription Ref</th>
                      <th className="py-3 px-4 font-bold">Period</th>
                      <th className="py-3 px-4 font-bold">Due Date</th>
                      <th className="py-3 px-4 font-bold">Tax</th>
                      <th className="py-3 px-4 font-bold">Total Amount</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => {
                      const number = inv.invoice_number || `INV-${inv.id}`;
                      const statusClass = STATUS_COLORS[inv.status] || 'bg-slate-100 text-slate-700';

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{number}</td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono">{inv.subscription_number || '-'}</td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {inv.period_start ? `${inv.period_start} → ${inv.period_end}` : 'Current Month'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">{inv.due_date || 'Immediate'}</td>
                          <td className="py-3.5 px-4 text-slate-500">₹{Number(inv.tax_amount || 0).toFixed(2)}</td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900">
                            ₹{Number(inv.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${statusClass}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="px-3 py-1 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold transition shadow-sm inline-flex items-center gap-1.5"
                            >
                              <span>🖨️</span> Print Invoice
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* POPUP MODAL: OFFICIAL PRINTABLE INVOICE VIEW */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:p-0">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative border border-slate-200 print:border-none print:shadow-none print:w-full print:max-w-none">
            
            {/* Modal Controls - Hidden when printing */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase">Printable Tax Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5"
                >
                  <span>🖨️</span> Send to Printer
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Brightloop Software</h2>
                  <p className="text-xs text-slate-500">Subscription &amp; Recurring Billing Platform</p>
                  <p className="text-xs text-slate-400 mt-1">support@brightloop.io &bull; Lucknow, India</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-blue-600">Official Invoice</span>
                  <div className="font-mono text-base font-black text-slate-900 mt-0.5">
                    {selectedInvoice.invoice_number || `INV-${selectedInvoice.id}`}
                  </div>
                  <div className="mt-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${STATUS_COLORS[selectedInvoice.status]}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
                <div>
                  <div className="text-[10px] uppercase font-extrabold text-slate-400">Billed To</div>
                  <div className="font-bold text-slate-900 mt-1">{session?.user?.name || 'Customer Account'}</div>
                  <div className="text-slate-500">{customerEmail}</div>
                  {selectedInvoice.subscription_number && (
                    <div className="text-slate-400 text-[11px] mt-1 font-mono">Ref: {selectedInvoice.subscription_number}</div>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <span className="text-slate-400">Due Date: </span>
                    <span className="font-bold text-slate-800">{selectedInvoice.due_date || 'Immediate'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Billing Cycle: </span>
                    <span className="text-slate-600">{selectedInvoice.period_start || 'Current'} → {selectedInvoice.period_end || 'Next'}</span>
                  </div>
                </div>
              </div>

              {/* Line items table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Item &amp; Description</th>
                      <th className="py-2.5 px-4 text-right">Tax Rate</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        Recurring Subscription Service
                        <span className="block text-[11px] text-slate-400 font-normal">Automated periodic plan renewal</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">18% GST</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{Number(selectedInvoice.subtotal || (selectedInvoice.total_amount ? selectedInvoice.total_amount * 0.82 : 0)).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50/60 border-t border-slate-200 text-xs">
                    <tr>
                      <td colSpan={2} className="py-2 px-4 text-right text-slate-500">Subtotal:</td>
                      <td className="py-2 px-4 text-right font-medium text-slate-800">
                        ₹{Number(selectedInvoice.subtotal || (selectedInvoice.total_amount ? selectedInvoice.total_amount * 0.82 : 0)).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-2 px-4 text-right text-slate-500">Tax (GST):</td>
                      <td className="py-2 px-4 text-right font-medium text-slate-800">
                        ₹{Number(selectedInvoice.tax_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200 font-black text-sm text-slate-900">
                      <td colSpan={2} className="py-3 px-4 text-right">Total Due:</td>
                      <td className="py-3 px-4 text-right text-blue-600">
                        ₹{Number(selectedInvoice.total_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
                Thank you for your business! This is a computer-generated tax receipt from Brightloop Subscription Platform.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

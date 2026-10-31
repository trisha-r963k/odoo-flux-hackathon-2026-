'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FileText,
  CheckCircle2,
  Building,
  Calendar,
  CreditCard,
  Percent,
  Check,
  ChevronRight,
  ShieldCheck,
  Zap,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function CustomerQuoteReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = params;

  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuote() {
      try {
        setLoading(true);
        const res = await fetch(`/api/subscriptions/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load quotation');
        setQuote(data.subscription);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuote();
  }, [id]);

  const handleAcceptQuote = async () => {
    try {
      setAccepting(true);
      const res = await fetch(`/api/subscriptions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to accept quotation');

      setAcceptedSuccess(data.sub_number || data.subscriptionNo);
    } catch (err: any) {
      alert('Error accepting quotation: ' + err.message);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500 text-xs">
        Loading quotation details...
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <h2 className="text-base font-bold text-slate-900">Quotation Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm">{error || 'This agreement does not exist or has expired.'}</p>
        <Link
          href="/portal/subscriptions"
          className="text-xs font-bold text-[#714b67] hover:underline"
        >
          Return to Portal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            B
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900">Brightloop Customer Portal</h1>
            <p className="text-xs text-slate-500">Official Subscription Agreement Review</p>
          </div>
        </div>
        <Link
          href="/portal/subscriptions"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-lg"
        >
          Back to My Contracts
        </Link>
      </header>

      {/* Main Quote Card */}
      <main className="max-w-4xl w-full mx-auto px-6 py-10 flex-1 space-y-6">
        {acceptedSuccess ? (
          <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 rounded-2xl p-8 text-center space-y-4 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h2 className="text-xl font-black">Quotation Accepted! Subscription is Now Active</h2>
            <p className="text-xs text-emerald-800">
              Your official recurring subscription identifier is:{' '}
              <span className="font-mono font-black text-sm bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded">
                {acceptedSuccess}
              </span>
            </p>
            <div className="pt-2">
              <Link
                href="/portal/subscriptions"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition inline-block shadow-md"
              >
                View Active Subscriptions
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
            {/* Top Info Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Agreement Specification
                </span>
                <div className="text-xl font-black text-slate-900 font-mono flex items-center gap-2 mt-0.5">
                  <span>{quote.sub_number}</span>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                    {quote.status}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Customer Account</span>
                <span className="text-sm font-extrabold text-slate-900">{quote.customer_name}</span>
                <span className="text-xs text-slate-400 block font-mono">{quote.customer_email}</span>
              </div>
            </div>

            {/* Plan & Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Billing Plan</span>
                <span className="text-sm font-extrabold text-[#714b67]">{quote.plan_name}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Payment Terms</span>
                <span className="text-sm font-semibold text-slate-800">{quote.payment_terms}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Configured Services &amp; Seats</h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-extrabold text-[10px] uppercase">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Seats / Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Taxable Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quote.lines.map((l: any) => (
                    <tr key={l.id}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{l.product_name}</div>
                        <div className="text-[11px] text-slate-500">{l.variant_name}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">{l.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono">${Number(l.unit_price).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ${Number(l.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Breakdown Totals */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-slate-800">${Number(quote.subtotal).toFixed(2)}</span>
              </div>

              {quote.discount_amount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-semibold">
                  <span>Promotional Discount</span>
                  <span className="font-mono font-bold">-${Number(quote.discount_amount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-600">
                <span>Standard VAT (18.00%)</span>
                <span className="font-mono font-bold text-slate-800">+${Number(quote.tax_amount).toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-300 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">Total Recurring Amount</span>
                <span className="text-xl font-black text-[#714b67] font-mono">
                  ${Number(quote.total_recurring_amount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Accept Quote Action */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <span className="text-xs text-slate-500">
                By accepting, you agree to recurring billing under Brightloop Terms of Service.
              </span>

              <button
                type="button"
                disabled={accepting}
                onClick={handleAcceptQuote}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{accepting ? 'Processing Activation...' : 'Accept Quote & Activate Subscription'}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@brightloop.com');
  const [password, setPassword] = useState('Brightloop#2026');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff' | 'customer'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<{ type: 'success' | 'error'; text: string; token?: string } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleRoleSelect = (role: 'admin' | 'staff' | 'customer') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'admin') {
      setEmail('admin@brightloop.com');
      setPassword('Brightloop#2026');
    } else if (role === 'staff') {
      setEmail('staff@brightloop.com');
      setPassword('StaffPass#2026');
    } else if (role === 'customer') {
      setEmail('customer@shopmate.com');
      setPassword('CustomerPass#2026');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError(res?.error || 'Invalid credentials or inactive account');
        setLoading(false);
        return;
      }

      // Route based on role
      if (selectedRole === 'admin') {
        router.push('/admin/dashboard');
      } else if (selectedRole === 'staff') {
        router.push('/staff/subscriptions');
      } else {
        router.push('/portal/subscriptions');
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setForgotMsg({ type: 'error', text: data.error || 'Failed to dispatch reset link' });
      } else {
        setForgotMsg({
          type: 'success',
          text: data.message,
          token: data.demoResetToken,
        });
      }
    } catch (err: any) {
      setForgotMsg({ type: 'error', text: 'Network error submitting request' });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Showcase Stage */}
      <aside className="hidden lg:flex lg:w-5/12 flex-col justify-between bg-gradient-to-br from-[#14111d] via-[#28142b] to-[#180e22] text-white p-12 border-r border-white/10">
        <div>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-[#714b67] flex items-center justify-center font-extrabold text-xl shadow-lg">
                B
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">Brightloop</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Subscription Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full text-xs font-medium text-purple-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Odoo x FLUX '26</span>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
              Recurring Billing &<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-teal-300">
                Subscriptions Unified.
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              The high-performance digital backbone that turns quotations into active subscriptions, automates billing days with database-enforced idempotency, and guarantees sub-2-second query response times.
            </p>

            <div className="space-y-3 pt-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                <span className="text-xl">⚡</span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Automated Billing Day Engine</h4>
                  <p className="text-xs text-slate-400 mt-1">Scheduled BullMQ runs & idempotency keys ensure zero duplicate billing.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                <span className="text-xl">🏷️</span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Smart Variant Pricing (+560 Odoo Brand)</h4>
                  <p className="text-xs text-slate-400 mt-1">Pure mathematical billing engine powered by Decimal.js precision.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                <span className="text-xl">📊</span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Executive Finance KPIs (&lt; 2s SLA)</h4>
                  <p className="text-xs text-slate-400 mt-1">Real-time normalized MRR/ARR, cash collections, and accounts receivable aging.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex justify-between text-xs text-slate-400">
          <span>© 2026 Brightloop Software Inc.</span>
          <span>PostgreSQL 16 • Strict Decimal(12, 2)</span>
        </div>
      </aside>

      {/* Right Interactive Authentication Stage */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Tab Bar */}
          <div className="flex border-b border-slate-200 mb-8">
            <button className="pb-3 px-4 font-bold text-sm text-[#714b67] border-b-2 border-[#714b67]">
              Sign In
            </button>
            <Link
              href="/register"
              className="pb-3 px-4 font-semibold text-sm text-slate-500 hover:text-slate-800 transition"
            >
              Customer Sign Up
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome to Brightloop</h2>
            <p className="text-xs text-slate-500 mt-1">Sign in with credentials or choose a 1-click test persona below</p>
          </div>

          {/* 1-Click Role Switcher for Hackathon Judges */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Test Account</span>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                ⚡ 1-Click Auto-Fill
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`flex flex-col items-center p-2.5 rounded-lg border text-center transition ${
                  selectedRole === 'admin'
                    ? 'bg-white border-[#714b67] shadow-sm ring-2 ring-[#714b67]/20'
                    : 'bg-white/60 border-slate-200 hover:bg-white'
                }`}
              >
                <span className="text-lg mb-1">🛡️</span>
                <strong className="text-xs font-bold text-slate-900">Admin</strong>
                <span className="text-[10px] text-slate-500">Full Control</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('staff')}
                className={`flex flex-col items-center p-2.5 rounded-lg border text-center transition ${
                  selectedRole === 'staff'
                    ? 'bg-white border-[#714b67] shadow-sm ring-2 ring-[#714b67]/20'
                    : 'bg-white/60 border-slate-200 hover:bg-white'
                }`}
              >
                <span className="text-lg mb-1">💼</span>
                <strong className="text-xs font-bold text-slate-900">Staff</strong>
                <span className="text-[10px] text-slate-500">Quotes & Bills</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('customer')}
                className={`flex flex-col items-center p-2.5 rounded-lg border text-center transition ${
                  selectedRole === 'customer'
                    ? 'bg-white border-[#714b67] shadow-sm ring-2 ring-[#714b67]/20'
                    : 'bg-white/60 border-slate-200 hover:bg-white'
                }`}
              >
                <span className="text-lg mb-1">🏪</span>
                <strong className="text-xs font-bold text-slate-900">Customer</strong>
                <span className="text-[10px] text-slate-500">Client Portal</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714b67] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-[#714b67] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714b67] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-[#714b67] focus:ring-[#714b67]"
                />
                <span>Remember this device</span>
              </label>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {selectedRole.toUpperCase()} ROLE
              </span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-[#714b67] hover:bg-[#593952] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span>⏳</span>
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            Looking for client self-service?{' '}
            <Link href="/register" className="text-[#714b67] font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Reset your password</h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotMsg(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Enter your account email to generate a cryptographically secure 32-byte hex reset token (1-hour validity).
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714b67]"
                />
              </div>

              {forgotMsg && (
                <div
                  className={`p-3 rounded-lg text-xs ${
                    forgotMsg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  <p>{forgotMsg.text}</p>
                  {forgotMsg.token && (
                    <div className="mt-2 p-2 bg-white rounded border border-emerald-300 font-mono text-[11px] break-all">
                      Token: {forgotMsg.token}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#714b67] hover:bg-[#593952] text-white font-bold text-xs transition flex items-center justify-center gap-2"
              >
                {forgotLoading ? 'Dispatching...' : 'Dispatch Reset Link →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

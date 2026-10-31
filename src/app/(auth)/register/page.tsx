'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Live password requirements
  const hasMinLength = password.length >= 9;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Password must satisfy all complexity requirements');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: contactName.trim(),
          companyName: companyName.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || (data.details ? data.details.join(', ') : 'Registration failed'));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError('Network error registering account');
      setLoading(false);
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
              Join Brightloop.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-200 to-purple-300">
                Client Self-Service.
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Create an enterprise customer account to accept quotations into active subscriptions, manage billing policies, review line-item taxes, and track payment receipts.
            </p>

            <div className="space-y-3 pt-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                <span className="text-xl">🏢</span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tenant-Isolated Customer Profile</h4>
                  <p className="text-xs text-slate-400 mt-1">Automatic creation of CustomerProfile linked securely to server session tokens.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                <span className="text-xl">🛡️</span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Argon2id Enterprise Security</h4>
                  <p className="text-xs text-slate-400 mt-1">Password complexity enforcement (&gt;8 chars, uppercase, lowercase, special character).</p>
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

      {/* Right Registration Stage */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Tab Bar */}
          <div className="flex border-b border-slate-200 mb-8">
            <Link
              href="/login"
              className="pb-3 px-4 font-semibold text-sm text-slate-500 hover:text-slate-800 transition"
            >
              Sign In
            </Link>
            <button className="pb-3 px-4 font-bold text-sm text-[#714b67] border-b-2 border-[#714b67]">
              Customer Sign Up
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Customer Account</h2>
            <p className="text-xs text-slate-500 mt-1">Automatic CustomerProfile provisioning for enterprise access</p>
          </div>

          {success ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <h4 className="font-bold">Account created successfully!</h4>
              <p className="mt-1 text-xs text-emerald-700">Redirecting you to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    placeholder="Marcus Vance"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714b67]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="Shopmate Corp"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714b67]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Email Address
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
                    placeholder="marcus@shopmate.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714b67]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714b67]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password (Strict Complexity)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                    🔒
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min 9 chars (e.g. Brightloop#2026)"
                    className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714b67]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Live Requirement Checkmarks */}
                <div className="grid grid-cols-2 gap-2 mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                    <span>{hasMinLength ? '✅' : '❌'}</span>
                    <span>Min 9 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                    <span>{hasUppercase ? '✅' : '❌'}</span>
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                    <span>{hasLowercase ? '✅' : '❌'}</span>
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                    <span>{hasSpecial ? '✅' : '❌'}</span>
                    <span>Special character</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="w-full py-3 px-4 rounded-lg bg-[#714b67] hover:bg-[#593952] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating Customer Profile...' : 'Complete Customer Registration →'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link href="/login" className="text-[#714b67] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

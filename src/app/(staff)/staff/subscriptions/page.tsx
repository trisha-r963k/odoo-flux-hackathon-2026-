'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function StaffSubscriptionsPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
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
            <p className="text-xs text-slate-500">Quotation generation, subscriptions master list &amp; invoice tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Subscriptions Master List</h2>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as internal operations staff. Full access to quotes, subscriptions, and invoicing.
          </p>
        </div>
      </main>
    </div>
  );
}

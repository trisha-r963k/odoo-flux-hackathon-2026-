'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  isActive: boolean;
  createdAt: string;
  customerProfile?: {
    id: string;
    companyName: string;
    contactName: string;
    phone: string | null;
  } | null;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Staff Provisioning
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [newPassword, setNewPassword] = useState('BrightloopStaff#2026');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load users');
      } else {
        setUsers(data.users);
      }
    } catch (err: any) {
      setError('Network error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          name: newName.trim(),
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.error || (data.details ? data.details.join(', ') : 'Creation failed'));
        setModalLoading(false);
        return;
      }

      setShowModal(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('BrightloopStaff#2026');
      fetchUsers();
    } catch (err: any) {
      setModalError('Network error provisioning user');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
        );
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#714b67] text-white flex items-center justify-center font-bold text-lg">
            B
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Brightloop Admin</h1>
            <p className="text-xs text-slate-500">Staff Account Management & RBAC Provisioning</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Back to Executive Dashboard
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 bg-[#714b67] hover:bg-[#593952] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span>+</span>
            <span>Provision Staff Account</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Internal Team & Customer Accounts</h2>
            <p className="text-xs text-slate-500 mt-1">
              Admin-restricted provisioning. Only administrators can create or toggle staff credentials.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* User Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Tenant / Company</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Loading users from database...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{u.name || 'Unnamed'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : u.role === 'STAFF'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium">
                        {u.customerProfile ? (
                          <div>
                            <span className="text-slate-900">{u.customerProfile.companyName}</span>
                            <div className="text-[10px] text-slate-400">Tenant ID: {u.customerProfile.id.slice(0, 8)}...</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Brightloop Internal</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                            u.isActive
                              ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                              : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Staff Provisioning Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Provision Internal Staff Account</h3>
                <p className="text-xs text-slate-500">Create staff or administrator accounts with strict password complexity</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="Taylor Swift"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714b67]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  placeholder="taylor@brightloop.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714b67]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'STAFF' | 'ADMIN')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714b67]"
                >
                  <option value="STAFF">STAFF — Sales &amp; Operations (Quotes, Invoices, Subscriptions)</option>
                  <option value="ADMIN">ADMIN — Full System Access, Catalog, Plans, Discounts &amp; Reporting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Initial Password (Argon2id Hashed)
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min 9 chars, upper, lower, special"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#714b67]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must satisfy regex: min 9 chars, 1 uppercase, 1 lowercase, 1 special symbol.
                </span>
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-[#714b67] hover:bg-[#593952] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  {modalLoading ? 'Provisioning...' : 'Confirm Provisioning →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit2,
  X,
  AlertTriangle
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface UserItem {
  _id: string;
  fullName: string;
  username: string;
  role: 'ADMIN' | 'EMPLOYEE';
  employeeId?: string;
  department?: string;
  designation?: string;
  isActive: boolean;
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    department: '',
    designation: '',
    role: 'EMPLOYEE' as 'ADMIN' | 'EMPLOYEE',
    isActive: true,
  });
  const [formError, setFormError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error('Fetch users error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create employee');
        return;
      }

      setShowCreateModal(false);
      setFormData({
        fullName: '',
        username: '',
        password: '',
        confirmPassword: '',
        employeeId: '',
        department: '',
        designation: '',
        role: 'EMPLOYEE',
        isActive: true,
      });
      fetchUsers();
    } catch {
      setFormError('Network error');
    }
  };

  const handleToggleActive = async (user: UserItem) => {
    try {
      await fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordModal || !newPassword) return;

    try {
      await fetch(`/api/admin/users/${showPasswordModal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      setShowPasswordModal(null);
      setNewPassword('');
      alert('Password reset successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    try {
      await fetch(`/api/admin/users/${deleteConfirmUser._id}`, { method: 'DELETE' });
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
              User &amp; Employee Management
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Create and manage authorized HIPG internal staff accounts. Public employee self-registration is disabled.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1266D5]/30 flex items-center gap-2 transition-all"
          >
            <UserPlus size={16} />
            <span>Create New Employee</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, department, or Employee ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DCE6F1] rounded-xl text-xs text-[#142B45] focus:outline-none focus:ring-2 focus:ring-[#1266D5]/30 focus:border-[#1266D5]"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#DCE6F1] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Employee Name</th>
                  <th className="px-6 py-3.5">Username</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Department &amp; Designation</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#082B4C] text-[13px]">{u.fullName}</div>
                      {u.employeeId && <span className="text-[10.5px] text-[#64748B] font-mono">{u.employeeId}</span>}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-[#142B45]">
                      {u.username}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-[#1266D5]'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#142B45]">{u.department || '—'}</div>
                      <div className="text-[10.5px] text-[#64748B]">{u.designation || 'Staff'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                          u.isActive
                            ? 'bg-green-100 text-[#16A34A] hover:bg-green-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title="Click to toggle activation status"
                      >
                        {u.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span>{u.isActive ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowPasswordModal(u)}
                          className="p-1.5 rounded-lg border border-[#DCE6F1] text-[#64748B] hover:text-[#1266D5] hover:bg-blue-50 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmUser(u)}
                          className="p-1.5 rounded-lg border border-[#DCE6F1] text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal 1: Create Employee Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#DCE6F1] relative">
              <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
                <div>
                  <h3 className="text-base font-bold text-[#082B4C]">Create New Employee Account</h3>
                  <p className="text-xs text-[#64748B]">Provide login credentials for the employee</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-[#64748B] hover:text-[#082B4C]">
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Full Name *</label>
                  <input
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ruwan Wickramasinghe"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Username *</label>
                    <input
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g. ruwan.w"
                      className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Employee ID</label>
                    <input
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="e.g. HIPG-EMP-4012"
                      className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Department</label>
                    <input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Port Operations"
                      className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full border border-[#DCE6F1] rounded-lg p-2.5 bg-white"
                    >
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-[#DCE6F1] rounded-lg font-bold text-[#64748B] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1266D5] text-white rounded-lg font-bold hover:bg-[#0D55B8]"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Reset Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#DCE6F1]">
              <h3 className="text-base font-bold text-[#082B4C]">Reset Password</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                For employee: <strong>{showPasswordModal.fullName}</strong> ({showPasswordModal.username})
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(null)}
                    className="px-4 py-2 border border-[#DCE6F1] rounded-lg font-bold text-[#64748B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1266D5] text-white rounded-lg font-bold hover:bg-[#0D55B8]"
                  >
                    Set Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Delete Confirmation Modal */}
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-red-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-[#082B4C]">Confirm Account Deletion</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Are you sure you want to delete employee <strong>{deleteConfirmUser.fullName}</strong> ({deleteConfirmUser.username})? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-4 py-2 border border-[#DCE6F1] rounded-lg font-bold text-xs text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

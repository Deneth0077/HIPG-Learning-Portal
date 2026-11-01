'use client';

import React, { useState } from 'react';
import { Settings, Shield, KeyRound, Database, Cloud, CheckCircle2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage('Administrator password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(data.error || 'Password change failed');
      }
    } catch {
      alert('Network error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
            System &amp; Security Settings
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Configure enterprise security, administrator credentials, and cloud integrations.
          </p>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-xs font-semibold text-green-700 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Change Admin Password */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#DCE6F1] shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1266D5] flex items-center justify-center">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#082B4C]">Change Administrator Password</h3>
              <p className="text-xs text-[#64748B]">Ensure your master credential uses 8+ mixed characters.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3.5 max-w-md text-xs">
            <div>
              <label className="font-bold text-[#142B45] block mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
              />
            </div>
            <div>
              <label className="font-bold text-[#142B45] block mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
              />
            </div>
            <div>
              <label className="font-bold text-[#142B45] block mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1266D5] text-white rounded-xl font-bold hover:bg-[#0D55B8]"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Cloud Integration Status */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#DCE6F1] shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#082B4C]">Cloud Storage &amp; Database Connections</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1">
              <span className="font-bold text-[#082B4C] flex items-center gap-1.5">
                <Database size={15} className="text-[#1266D5]" /> MongoDB Atlas
              </span>
              <p className="text-[11px] text-[#64748B]">Primary Document Store</p>
              <span className="text-[10px] font-bold text-green-600 block pt-1">● Configured</span>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1">
              <span className="font-bold text-[#082B4C] flex items-center gap-1.5">
                <Cloud size={15} className="text-cyan-600" /> Cloudinary Media
              </span>
              <p className="text-[11px] text-[#64748B]">Image &amp; Screenshot CDN</p>
              <span className="text-[10px] font-bold text-green-600 block pt-1">● Signed API Active</span>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1">
              <span className="font-bold text-[#082B4C] flex items-center gap-1.5">
                <Shield size={15} className="text-amber-600" /> Google Drive API
              </span>
              <p className="text-[11px] text-[#64748B]">Protected Video Storage</p>
              <span className="text-[10px] font-bold text-green-600 block pt-1">● Stream Ready</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

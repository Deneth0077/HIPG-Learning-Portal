'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, KeyRound, Database, Cloud, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Folder } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Google Drive Settings State
  const [driveConfig, setDriveConfig] = useState<{
    configured: boolean;
    isTokenValid: boolean;
    authError?: string;
    folderId: string;
    maskedToken: string;
  } | null>(null);
  const [newDriveToken, setNewDriveToken] = useState('');
  const [savingDrive, setSavingDrive] = useState(false);
  const [driveSaveMessage, setDriveSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDriveConfig();
  }, []);

  const fetchDriveConfig = async () => {
    try {
      const res = await fetch('/api/admin/settings/google-drive');
      if (res.ok) {
        const data = await res.json();
        setDriveConfig(data);
      }
    } catch (e) {
      console.error('Failed to load drive status:', e);
    }
  };

  const handleSaveDriveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriveToken.trim()) return;

    setSavingDrive(true);
    setDriveSaveMessage(null);

    try {
      const res = await fetch('/api/admin/settings/google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: newDriveToken.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setDriveSaveMessage(data.message || 'Google Drive connected successfully!');
        setNewDriveToken('');
        fetchDriveConfig();
      } else {
        alert(data.error || 'Failed to verify token with Google');
      }
    } catch {
      alert('Network error while saving token');
    } finally {
      setSavingDrive(false);
    }
  };

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

        {/* Google Drive API Integration Manager */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#DCE6F1] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#082B4C]">Google Drive Video Integration</h3>
                <p className="text-xs text-[#64748B]">Manage corporate OAuth credentials for direct video uploads.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {driveConfig?.isTokenValid ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Google Drive Connected</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span>Authorization Needed</span>
                </span>
              )}

              <a
                href={`https://drive.google.com/drive/folders/${driveConfig?.folderId || '1-0TwN8EfD_5UMGbKhs4G2wnC5qGsiOyw'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#082B4C] text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Folder size={14} className="text-[#1266D5]" />
                <span>Open Root Folder</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {driveSaveMessage && (
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs font-bold text-green-700 flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{driveSaveMessage}</span>
            </div>
          )}

          {driveConfig && !driveConfig.isTokenValid && driveConfig.authError && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-2 text-amber-950">
                <AlertCircle size={16} className="text-amber-600" />
                <span>OAuth Token Expired or Not Authorized</span>
              </div>
              <p className="leading-relaxed">
                When using Google Cloud Console in "Testing" mode, Google refresh tokens expire after 7 days ({driveConfig.authError}). You can update the token below anytime, or publish your OAuth App in Google Cloud Console to make it permanent.
              </p>
            </div>
          )}

          {/* Token Update Form */}
          <form onSubmit={handleSaveDriveToken} className="space-y-3.5 text-xs max-w-xl">
            <div>
              <label className="font-bold text-[#142B45] block mb-1">
                Google Drive Refresh Token
              </label>
              <input
                type="text"
                required
                value={newDriveToken}
                onChange={(e) => setNewDriveToken(e.target.value)}
                placeholder={driveConfig?.maskedToken || 'Paste 1//... Refresh Token here'}
                className="w-full border border-[#DCE6F1] rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-[#1266D5]/30 focus:outline-none"
              />
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Saved tokens are stored securely in MongoDB and apply immediately to both local and Vercel environments.
              </span>
            </div>

            <div className="pt-1 flex items-center gap-3">
              <button
                type="submit"
                disabled={savingDrive || !newDriveToken.trim()}
                className="px-5 py-2.5 bg-[#1266D5] hover:bg-[#0D55B8] text-white rounded-xl font-bold cursor-pointer transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {savingDrive ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
                <span>{savingDrive ? 'Verifying with Google...' : 'Verify & Save Token'}</span>
              </button>

              <button
                type="button"
                onClick={fetchDriveConfig}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#082B4C] rounded-xl font-semibold cursor-pointer transition-colors"
              >
                Refresh Status
              </button>
            </div>
          </form>

          {/* Quick Guide to Generate Refresh Token */}
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
            <strong className="text-[#082B4C] block font-bold">How to generate a new Google Drive Refresh Token (1 minute):</strong>
            <ol className="list-decimal list-inside space-y-1 text-[#64748B] text-[11.5px]">
              <li>
                Open{' '}
                <a
                  href="https://developers.google.com/oauthplayground"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#1266D5] underline"
                >
                  Google OAuth Playground ↗
                </a>
              </li>
              <li>Click the gear icon (top right) &rarr; check <strong>"Use your own OAuth credentials"</strong>, and enter your Client ID &amp; Secret.</li>
              <li>Select <strong>Drive API v3</strong> &rarr; click <strong>Authorize APIs</strong> &rarr; Click <strong>Exchange authorization code for tokens</strong>.</li>
              <li>Copy the <strong>Refresh token</strong> and paste it in the box above!</li>
            </ol>
          </div>
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

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { History, Shield, RefreshCw, Search, Globe, Clock, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface AuditLogEntry {
  id: string;
  action: string;
  admin: string;
  adminId: string;
  resourceType: string;
  resourceId: string;
  ip: string;
  userAgent: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

function formatExactDateTime(isoString: string): { date: string; time: string; relative: string } {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    return { date: '—', time: '—', relative: '' };
  }

  const date = d.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const diffSec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  let relative = 'Just now';
  if (diffSec >= 60 && diffSec < 3600) {
    relative = `${Math.floor(diffSec / 60)}m ago`;
  } else if (diffSec >= 3600 && diffSec < 86400) {
    relative = `${Math.floor(diffSec / 3600)}h ago`;
  } else if (diffSec >= 86400) {
    relative = `${Math.floor(diffSec / 86400)}d ago`;
  }

  return { date, time, relative };
}

function getActionBadgeStyle(action: string): string {
  if (action.includes('FAILED') || action.includes('BLOCKED') || action.includes('DELETED')) {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (action.includes('LOGIN_SUCCESS') || action.includes('CREATED') || action.includes('LINKED')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (action.includes('UPLOADED') || action.includes('UPDATED')) {
    return 'bg-blue-50 text-[#1266D5] border-blue-200';
  }
  return 'bg-slate-100 text-[#082B4C] border-slate-200';
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== 'ALL') params.set('action', actionFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('limit', '150');

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#082B4C] tracking-tight flex items-center gap-2.5">
              <Shield className="text-[#1266D5]" size={24} />
              <span>Security &amp; Administrative Audit Trail</span>
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Live immutable log of user logins, access IPs, timestamps, and administrative actions ({total} total records).
            </p>
          </div>

          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="px-4 py-2 bg-white hover:bg-[#F8FAFC] border border-[#DCE6F1] rounded-xl text-xs font-bold text-[#082B4C] flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#1266D5]' : 'text-[#1266D5]'} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by IP address, username, action, or resource..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DCE6F1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1266D5]/25 focus:border-[#1266D5]"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-[#DCE6F1] rounded-xl text-xs font-semibold text-[#082B4C] focus:outline-none focus:ring-2 focus:ring-[#1266D5]/25"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="DRIVE_VIDEO_LINKED_TO_LESSON">DRIVE_VIDEO_LINKED_TO_LESSON</option>
            <option value="DRIVE_VIDEO_DELETED">DRIVE_VIDEO_DELETED</option>
            <option value="DRIVE_MODULE_FILE_UPLOADED">DRIVE_MODULE_FILE_UPLOADED</option>
            <option value="USER_CREATED">USER_CREATED</option>
            <option value="LESSON_UPDATED">LESSON_UPDATED</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead className="bg-[#F8FAFC] border-b border-[#DCE6F1] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Action Type</th>
                <th className="px-6 py-3.5">User / Admin</th>
                <th className="px-6 py-3.5">Affected Resource</th>
                <th className="px-6 py-3.5">Access IP</th>
                <th className="px-6 py-3.5 text-right">Access Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#64748B]">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#1266D5] mb-2" />
                    <span>Loading live audit trail...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#64748B]">
                    <History size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-[#082B4C]">No audit logs found yet</p>
                    <p className="text-[11px] mt-0.5">
                      Logins, video uploads, deletions, and system updates will automatically appear here with IP and timestamp.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const dt = formatExactDateTime(log.createdAt);
                  return (
                    <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg border font-mono font-bold text-[10.5px] ${getActionBadgeStyle(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#082B4C]">
                        {log.admin}
                      </td>
                      <td className="px-6 py-4 text-[#142B45]">
                        <span className="font-semibold text-[#082B4C]">{log.resourceType}</span>
                        {log.resourceId ? (
                          <span className="text-[#64748B]">: {log.resourceId}</span>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] font-mono text-[11px] text-[#082B4C]">
                          <Globe size={11} className="text-[#1266D5]" />
                          {log.ip}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="font-mono font-semibold text-[#082B4C] text-[11.5px] flex items-center gap-1">
                            <Clock size={11} className="text-[#64748B]" />
                            {dt.date} {dt.time}
                          </span>
                          {dt.relative && (
                            <span className="text-[10px] text-[#94A3B8]">{dt.relative}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

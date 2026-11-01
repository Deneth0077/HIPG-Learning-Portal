'use client';

import React from 'react';
import { History, Shield, Calendar, Terminal } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AuditLogsPage() {
  const logs = [
    { id: '1', action: 'USER_CREATED', admin: 'admin', resource: 'User: Nuwan Perera', time: '10 minutes ago', ip: '192.168.67.14' },
    { id: '2', action: 'VIDEO_ATTACHED', admin: 'admin', resource: 'Video: BTOS Cargo ID Gen', time: '45 minutes ago', ip: '192.168.67.14' },
    { id: '3', action: 'MEDIA_UPLOADED', admin: 'admin', resource: 'Media: Operation Menu Screenshot', time: '2 hours ago', ip: '192.168.67.14' },
    { id: '4', action: 'SYSTEM_UPDATED', admin: 'admin', resource: 'System: BTOS Curriculum', time: '5 hours ago', ip: '192.168.67.14' },
    { id: '5', action: 'LOGIN_SUCCESS', admin: 'admin', resource: 'Session Authenticated', time: 'Today 08:30', ip: '192.168.67.14' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
            Security &amp; Administrative Audit Trail
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Immutable log of all administrator actions, content modifications, and user account provisioning.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#DCE6F1] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Action Type</th>
                <th className="px-6 py-3.5">Administrator</th>
                <th className="px-6 py-3.5">Affected Resource</th>
                <th className="px-6 py-3.5">Terminal IP</th>
                <th className="px-6 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-6 py-4 font-mono font-bold text-[#1266D5]">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#082B4C]">
                    {log.admin}
                  </td>
                  <td className="px-6 py-4 text-[#142B45]">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-[#64748B]">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 text-right text-[#64748B] font-medium">
                    {log.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

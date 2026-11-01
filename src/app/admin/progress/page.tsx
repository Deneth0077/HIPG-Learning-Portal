'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Search,
  BookOpen
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminLearningProgressPage() {
  const [employeeProgress, setEmployeeProgress] = useState([
    { name: 'Chathuranga', role: 'Terminal Engineer', dept: 'Port Operations', completed: 7, total: 21, percent: 35, lastActive: '10 mins ago' },
    { name: 'Nuwan Perera', role: 'VTMS Supervisor', dept: 'Harbor Control', completed: 3, total: 6, percent: 50, lastActive: '1 hour ago' },
    { name: 'Sandun Jayasuriya', role: 'CTOS Yard Planner', dept: 'Container Yard', completed: 4, total: 15, percent: 28, lastActive: 'Yesterday' },
    { name: 'Chaminda Silva', role: 'Billing Specialist', dept: 'Commercial & Finance', completed: 2, total: 10, percent: 20, lastActive: '3 days ago' },
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
            Employee Learning Progress &amp; Certifications
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Monitor terminal operator course completions, active video lessons, and mandatory training compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-[#DCE6F1] shadow-xs">
            <span className="text-xs font-bold text-[#64748B]">Average Completion Rate</span>
            <span className="text-3xl font-black text-[#082B4C] block mt-1">33.2%</span>
            <span className="text-[11px] text-green-600 font-bold mt-1 block">+6.4% this month</span>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#DCE6F1] shadow-xs">
            <span className="text-xs font-bold text-[#64748B]">Total Completed Modules</span>
            <span className="text-3xl font-black text-[#1266D5] block mt-1">142</span>
            <span className="text-[11px] text-[#64748B] font-semibold mt-1 block">Across all 7 port systems</span>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#DCE6F1] shadow-xs">
            <span className="text-xs font-bold text-[#64748B]">Certified Operators</span>
            <span className="text-3xl font-black text-[#16A34A] block mt-1">18</span>
            <span className="text-[11px] text-[#64748B] font-semibold mt-1 block">Terminal SOP compliant</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#DCE6F1] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Completed Topics</th>
                <th className="px-6 py-3.5">Progress</th>
                <th className="px-6 py-3.5 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {employeeProgress.map((p) => (
                <tr key={p.name} className="hover:bg-[#F8FAFC]">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#082B4C] text-[13px]">{p.name}</div>
                    <div className="text-[11px] text-[#64748B]">{p.role}</div>
                  </td>
                  <td className="px-6 py-4 text-[#142B45] font-medium">{p.dept}</td>
                  <td className="px-6 py-4 font-semibold text-[#082B4C]">
                    {p.completed} of {p.total} lessons
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-28 bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#10B981] h-full" style={{ width: `${p.percent}%` }} />
                      </div>
                      <span className="font-bold text-[#1266D5]">{p.percent}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-[#64748B] font-medium">
                    {p.lastActive}
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

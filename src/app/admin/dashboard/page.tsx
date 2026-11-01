'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Grid2X2,
  FolderTree,
  PlayCircle,
  Video,
  Image,
  BookOpen,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface DashboardStats {
  totalEmployees: number;
  totalSystems: number;
  totalModules: number;
  totalLessons: number;
  totalVideos: number;
  totalUserManuals: number;
  totalImages: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 24,
    totalSystems: 7,
    totalModules: 18,
    totalLessons: 42,
    totalVideos: 28,
    totalUserManuals: 7,
    totalImages: 34,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [systemSummary, setSystemSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.stats) setStats(data.stats);
          if (data.recentUsers) setRecentUsers(data.recentUsers);
          if (data.systemSummary) setSystemSummary(data.systemSummary);
        }
      } catch (e) {
        console.error('Failed to load stats:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      setSeedMessage(data.message || (data.success ? 'Seed completed successfully' : 'Seed error'));
    } catch {
      setSeedMessage('Failed to trigger database seed');
    } finally {
      setSeeding(false);
    }
  };

  const STAT_CARDS = [
    { label: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/users' },
    { label: 'Total Systems', value: stats.totalSystems, icon: Grid2X2, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/systems' },
    { label: 'Total Modules', value: stats.totalModules, icon: FolderTree, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/modules' },
    { label: 'Total Lessons', value: stats.totalLessons, icon: PlayCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/lessons' },
    { label: 'Total Videos', value: stats.totalVideos, icon: Video, color: 'text-rose-600', bg: 'bg-rose-50', link: '/admin/videos' },
    { label: 'Total Manuals', value: stats.totalUserManuals, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/content' },
    { label: 'Total Images', value: stats.totalImages, icon: Image, color: 'text-cyan-600', bg: 'bg-cyan-50', link: '/admin/media' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#082B4C] tracking-tight">
              HIPG Learning Portal — Admin Console
            </h1>
            <p className="text-sm text-[#64748B] mt-1 font-medium">
              Centralized Content Management, Employee Security &amp; Terminal Training Administration
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="px-4 py-2.5 rounded-xl border border-[#DCE6F1] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#082B4C] shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
              title="Populate initial admin, systems, and modules in MongoDB"
            >
              <ShieldCheck size={16} className="text-[#1266D5]" />
              <span>{seeding ? 'Seeding...' : 'Seed Initial Data'}</span>
            </button>
            <Link
              href="/admin/users"
              className="px-5 py-2.5 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1266D5]/30 flex items-center gap-2 transition-all"
            >
              <PlusCircle size={16} />
              <span>New Employee</span>
            </Link>
          </div>
        </div>

        {seedMessage && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-[#082B4C] flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#1266D5]" />
            <span>{seedMessage}</span>
          </div>
        )}

        {/* 7 Statistics Cards Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.link}
                className="bg-white rounded-2xl p-5 border border-[#DCE6F1] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${card.bg} ${card.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon size={22} />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-[#082B4C] block tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-[11.5px] font-semibold text-[#64748B] mt-0.5 block truncate">
                    {card.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 2-Column Content Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Column: Systems Overview & Progress */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#DCE6F1] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <h2 className="text-base font-bold text-[#082B4C]">Port Systems &amp; Curriculum Status</h2>
              <Link href="/admin/systems" className="text-xs font-bold text-[#1266D5] hover:underline">
                Manage Systems &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { name: 'BTOS', title: 'Berth, Terminal & Operations System', topics: 21, progress: 35 },
                { name: 'BULK', title: 'Bulk Cargo Operation System', topics: 8, progress: 40 },
                { name: 'CTOS', title: 'Container Terminal Operation System', topics: 15, progress: 28 },
                { name: 'VTMS', title: 'Vessel Traffic Management System', topics: 6, progress: 50 },
                { name: 'Billing', title: 'Port Billing & EAS System', topics: 10, progress: 20 },
                { name: 'VBS', title: 'Vessel Berthing System', topics: 5, progress: 60 },
                { name: 'EAM', title: 'Enterprise Asset Management', topics: 12, progress: 25 },
              ].map((sys) => (
                <div key={sys.name} className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="font-bold text-[#082B4C] mr-2">{sys.name}</span>
                    <span className="text-[#64748B] text-[11px] truncate hidden sm:inline">{sys.title}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-semibold text-[#64748B]">{sys.topics} Topics</span>
                    <span className="font-black text-[#1266D5] w-10 text-right">{sys.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Recently Created Employee Accounts */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#DCE6F1] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <h2 className="text-base font-bold text-[#082B4C]">Recent Employee Accounts</h2>
              <Link href="/admin/users" className="text-xs font-bold text-[#1266D5] hover:underline">
                View All Users &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Chathuranga', role: 'EMPLOYEE', dept: 'Port Operations', status: 'Active' },
                { name: 'Nuwan Perera', role: 'EMPLOYEE', dept: 'Harbor Control', status: 'Active' },
                { name: 'Sandun Jayasuriya', role: 'EMPLOYEE', dept: 'Container Yard', status: 'Inactive' },
                { name: 'HIPG System Administrator', role: 'ADMIN', dept: 'IT Systems', status: 'Active' },
              ].map((u) => (
                <div key={u.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors border border-transparent hover:border-[#E2E8F0]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1266D5] flex items-center justify-center font-bold text-xs shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="truncate text-xs">
                      <span className="font-bold text-[#082B4C] block truncate">{u.name}</span>
                      <span className="text-[11px] text-[#64748B]">{u.dept} • {u.role}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === 'Active' ? 'bg-green-100 text-[#16A34A]' : 'bg-gray-100 text-gray-500'}`}>
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

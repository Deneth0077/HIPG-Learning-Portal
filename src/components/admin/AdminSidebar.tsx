'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Grid2X2,
  FolderTree,
  PlayCircle,
  Video,
  Image,
  BookOpen,
  TrendingUp,
  History,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { HipgLogo } from '@/components/common/PortGraphics';

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'User Management', href: '/admin/users', icon: Users },
  { label: 'System Management', href: '/admin/systems', icon: Grid2X2 },
  { label: 'Module Management', href: '/admin/modules', icon: FolderTree },
  { label: 'Lesson Management', href: '/admin/lessons', icon: PlayCircle },
  { label: 'Video Management', href: '/admin/videos', icon: Video },
  { label: 'Media Library', href: '/admin/media', icon: Image },
  { label: 'Content Management', href: '/admin/content', icon: BookOpen },
  { label: 'Learning Progress', href: '/admin/progress', icon: TrendingUp },
  { label: 'Audit Logs', href: '/admin/audit', icon: History },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
    }
  };

  return (
    <aside className="w-72 bg-[#062746] text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 select-none shadow-2xl border-r border-[#0D3B63]/60 transition-all">
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Brand Header with Admin Badge */}
        <div className="p-6 pb-5 border-b border-[#0D3B63]/70">
          <Link href="/admin/dashboard" className="block">
            <HipgLogo inverted={true} />
          </Link>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#1266D5] text-white px-2.5 py-0.5 rounded-full shadow-xs">
              Administrator Portal
            </span>
            <Link
              href="/dashboard"
              className="text-[11px] font-semibold text-[#38BDF8] hover:underline flex items-center gap-0.5"
            >
              <ChevronLeft size={12} /> View Learner UI
            </Link>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex flex-col overflow-y-auto max-h-[calc(100vh-170px)]">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#1266D5] text-white shadow-md shadow-[#1266D5]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0D3B63]/50'
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-[#8FA5BE] group-hover:text-white'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-[#29C5E8] shadow-sm animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout Button */}
      <div className="p-4 border-t border-[#0D3B63]/60 bg-[#041E38]/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-red-300 hover:text-white hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={15} />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
};

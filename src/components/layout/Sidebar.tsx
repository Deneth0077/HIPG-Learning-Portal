'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Grid2X2,
  GraduationCap,
  Clock,
  Bookmark,
  BookOpen,
  Search,
  CircleHelp,
} from 'lucide-react';
import { HipgLogo, SidebarPortCrane } from '@/components/common/PortGraphics';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'All Systems', href: '/systems', icon: Grid2X2 },
  { label: 'My Learning', href: '/my-learning', icon: GraduationCap },
  { label: 'Recently Watched', href: '/recently-watched', icon: Clock },
  { label: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { label: 'User Manuals', href: '/manuals', icon: BookOpen },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Help & Support', href: '/help', icon: CircleHelp },
];

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const pathname = usePathname();

  return (
    <aside
      className="w-72 bg-[#062746] text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 select-none shadow-2xl border-r border-[#0D3B63]/60 transition-all duration-300"
    >
      {/* Top Section */}
      <div className="flex flex-col">
        {/* HIPG Brand Header */}
        <div className="p-7 pb-6 border-b border-[#0D3B63]/70">
          <Link href="/dashboard" className="block focus:outline-none focus:ring-2 focus:ring-[#29C5E8]/50 rounded-lg">
            <HipgLogo inverted={true} />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-5 space-y-2 flex flex-col">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#1266D5] text-white shadow-lg shadow-[#1266D5]/35'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0D3B63]/60'
                }`}
              >
                <Icon
                  size={21}
                  className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-[#8FA5BE] group-hover:text-white'
                  }`}
                />
                <span className="tracking-wide text-[14.5px]">{item.label}</span>
                {isActive && (
                  <span className="absolute right-3 w-2 h-2 rounded-full bg-[#29C5E8] shadow-sm animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section with Container Port Crane Artwork */}
      <div className="mt-auto relative w-full pt-4 pb-4 px-4 border-t border-[#0D3B63]/40">
        <SidebarPortCrane className="w-full" />
        <div className="text-center text-[11px] text-[#64748B] mt-2 font-mono tracking-wider font-medium">
          v2.4.0 • HIPG IT PORTAL
        </div>
      </div>
    </aside>
  );
};

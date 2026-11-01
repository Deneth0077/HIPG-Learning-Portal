'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Globe,
  Menu,
  LogOut,
  ShieldCheck,
  BookMarked
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'SI' | 'ZH'>('EN');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#DCE6F1] px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile hamburger & Portal title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-[#142B45] hover:bg-[#F3F7FC] rounded-lg transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-[17px] font-bold text-[#082B4C] tracking-tight hidden sm:block">
          HIPG Learning Portal
        </h1>
      </div>

      {/* Middle: Rounded Search Input matching reference */}
      <div className="flex-1 max-w-xl mx-4 lg:mx-8">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for systems, features, tutorials..."
            className="w-full bg-[#F3F7FC] border border-[#DCE6F1] rounded-full pl-9 pr-4 py-2 text-xs sm:text-[13px] text-[#142B45] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1266D5]/20 focus:border-[#1266D5] transition-all duration-200"
          />
        </form>
      </div>

      {/* Right Controls: Notification, Language, User Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon with Red Dot Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationPopup(!showNotificationPopup);
              setShowLanguageDropdown(false);
              setShowProfileDropdown(false);
            }}
            className="relative p-2 text-[#475569] hover:text-[#082B4C] hover:bg-[#F3F7FC] rounded-full transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-bold">
              1
            </span>
          </button>

          {showNotificationPopup && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#DCE6F1] py-2 z-50 text-xs">
              <div className="px-4 py-2 font-semibold text-[#082B4C] border-b border-[#DCE6F1] flex justify-between items-center">
                <span>Notifications</span>
                <span className="text-[10px] bg-blue-100 text-[#1266D5] px-1.5 py-0.5 rounded-full font-medium">1 new</span>
              </div>
              <div className="px-4 py-3 hover:bg-[#F3F7FC] transition-colors cursor-pointer">
                <p className="font-medium text-[#142B45]">New Cargo ID module released!</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">Explore the updated BTOS training materials.</p>
                <span className="text-[10px] text-[#94A3B8] mt-1 block">15 minutes ago</span>
              </div>
            </div>
          )}
        </div>

        {/* Language Selector Pill (EN v) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLanguageDropdown(!showLanguageDropdown);
              setShowNotificationPopup(false);
              setShowProfileDropdown(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-[#DCE6F1] rounded-lg text-xs font-semibold text-[#142B45] hover:bg-[#F3F7FC] transition-colors"
          >
            <span>{language}</span>
            <ChevronDown size={14} className="text-[#64748B]" />
          </button>

          {showLanguageDropdown && (
            <div className="absolute right-0 mt-1.5 w-28 bg-white rounded-lg shadow-lg border border-[#DCE6F1] py-1 z-50 text-xs">
              {(['EN', 'SI', 'ZH'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLanguageDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F7FC] transition-colors ${
                    language === lang ? 'text-[#1266D5] font-bold bg-[#F3F7FC]' : 'text-[#475569]'
                  }`}
                >
                  {lang === 'EN' ? 'English' : lang === 'SI' ? 'Sinhala' : 'Chinese'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Pill matching reference with blue avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotificationPopup(false);
              setShowLanguageDropdown(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[#F3F7FC] transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#38BDF8] flex items-center justify-center text-white shadow-sm ring-2 ring-[#29C5E8]/30">
              <User size={18} className="text-[#082B4C]" />
            </div>
            <span className="text-xs font-medium text-[#142B45] hidden md:inline">
              Chathuranga
            </span>
            <ChevronDown size={14} className="text-[#64748B] hidden md:inline" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#DCE6F1] py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-[#DCE6F1]">
                <p className="font-bold text-[#082B4C]">Chathuranga</p>
                <p className="text-[11px] text-[#64748B]">Terminal Operations Eng</p>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-[#475569] hover:bg-[#F3F7FC] hover:text-[#082B4C]"
                onClick={() => setShowProfileDropdown(false)}
              >
                <User size={14} /> Profile & Settings
              </Link>
              <Link
                href="/my-learning"
                className="flex items-center gap-2 px-4 py-2 text-[#475569] hover:bg-[#F3F7FC] hover:text-[#082B4C]"
                onClick={() => setShowProfileDropdown(false)}
              >
                <BookMarked size={14} /> My Certificates
              </Link>
              <div className="border-t border-[#DCE6F1] mt-1 pt-1">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <LogOut size={14} /> Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

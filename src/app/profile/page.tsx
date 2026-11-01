'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { User, Mail, Shield, Award, Calendar, Terminal } from 'lucide-react';

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
            User Profile
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Manage your account credentials, terminal access roles, and preferences.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE6F1] shadow-xs space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#38BDF8] flex items-center justify-center text-white ring-4 ring-[#29C5E8]/30">
              <User size={32} className="text-[#082B4C]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#082B4C]">Chathuranga</h2>
              <p className="text-xs text-[#64748B]">Terminal Operations Engineer • Hambantota International Port</p>
              <span className="inline-block mt-1 text-[10px] font-bold bg-blue-50 text-[#1266D5] px-2 py-0.5 rounded-full">
                Active Session
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#F1F5F9] pt-6 text-xs">
            <div>
              <span className="text-[#64748B] font-semibold block">Employee ID</span>
              <span className="font-bold text-[#082B4C] mt-0.5 block">HIPG-EMP-3049</span>
            </div>
            <div>
              <span className="text-[#64748B] font-semibold block">Department</span>
              <span className="font-bold text-[#082B4C] mt-0.5 block">Port Operations &amp; IT Systems</span>
            </div>
            <div>
              <span className="text-[#64748B] font-semibold block">System Access Roles</span>
              <span className="font-bold text-[#082B4C] mt-0.5 block">BTOS (Supervisor), CTOS (Planner), VTMS (Observer)</span>
            </div>
            <div>
              <span className="text-[#64748B] font-semibold block">Language Preference</span>
              <span className="font-bold text-[#082B4C] mt-0.5 block">English (EN)</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

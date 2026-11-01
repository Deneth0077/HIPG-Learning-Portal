'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { LearningProgress } from '@/components/dashboard/LearningProgress';
import { CONTINUE_LEARNING_ITEMS } from '@/data/portalData';
import { PlayCircle, CheckCircle2, Clock, Filter, Award } from 'lucide-react';

export default function MyLearningPage() {
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed' | 'not-started'>('all');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
            My Learning
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Track your curriculum progress, resumes, and terminal certifications.
          </p>
        </div>

        {/* Top Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-[#DCE6F1] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Overall Completion</span>
                <span className="text-base font-black text-[#1266D5]">28%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden mb-4">
                <div className="bg-[#10B981] h-full rounded-full" style={{ width: '28%' }} />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2 text-center border-t border-[#F1F5F9]">
                <div>
                  <span className="text-xl font-bold text-[#082B4C] block">36</span>
                  <span className="text-[11px] text-[#64748B]">Completed</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-[#1266D5] block">12</span>
                  <span className="text-[11px] text-[#64748B]">In Progress</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-[#64748B] block">80</span>
                  <span className="text-[11px] text-[#64748B]">Not Started</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#082B4C] to-[#1266D5] text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <Award size={22} className="text-[#38BDF8]" />
              </div>
              <h3 className="text-base font-bold">Port Operational Certification</h3>
              <p className="text-xs text-[#CBD5E1] mt-1 leading-relaxed">
                Complete BTOS Operational Modules to earn your certified Tally Clerk credential.
              </p>
            </div>
            <span className="text-[11px] text-[#38BDF8] font-bold mt-4">
              Estimated Completion: 2 weeks
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-[#DCE6F1] pb-3">
          {(['all', 'in-progress', 'completed', 'not-started'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                filter === mode
                  ? 'bg-[#1266D5] text-white shadow-xs'
                  : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'
              }`}
            >
              {mode.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-2xl border border-[#DCE6F1] divide-y divide-[#F1F5F9] shadow-xs">
          {CONTINUE_LEARNING_ITEMS.map((item) => (
            <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1266D5] flex items-center justify-center shrink-0">
                  <PlayCircle size={22} />
                </div>
                <div className="truncate">
                  <Link
                    href={`/systems/${item.systemId}/lessons/${item.id}`}
                    className="text-xs sm:text-sm font-bold text-[#142B45] hover:text-[#1266D5] transition-colors block truncate"
                  >
                    {item.title}
                  </Link>
                  <span className="text-[11px] text-[#64748B]">
                    {item.systemId.toUpperCase()} • Duration: {item.duration}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-bold text-[#142B45]">{item.progressPercent}%</span>
                  <div className="w-24 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-[#10B981] h-full" style={{ width: `${item.progressPercent}%` }} />
                  </div>
                </div>
                <Link
                  href={`/systems/${item.systemId}/lessons/${item.id}`}
                  className="px-4 py-2 rounded-lg bg-[#1266D5] text-white text-xs font-bold hover:bg-[#0D55B8]"
                >
                  Resume
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

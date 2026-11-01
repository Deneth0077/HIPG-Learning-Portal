'use client';

import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { CONTINUE_LEARNING_ITEMS } from '@/data/portalData';
import { Clock, PlayCircle } from 'lucide-react';

export default function RecentlyWatchedPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
            Recently Watched
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Pick up right where you left off across your active video lessons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CONTINUE_LEARNING_ITEMS.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-[#DCE6F1] overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="h-40 bg-gradient-to-br from-[#082B4C] to-[#1266D5] flex items-center justify-center relative">
                <PlayCircle size={44} className="text-white/80" />
                <span className="absolute bottom-2 right-2 bg-black/70 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">
                  {item.duration}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <h3 className="text-sm font-bold text-[#082B4C] line-clamp-1">{item.title}</h3>
                <p className="text-xs text-[#64748B] line-clamp-2">{item.description}</p>
                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#10B981] h-full" style={{ width: `${item.progressPercent}%` }} />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#64748B] font-semibold">{item.progressPercent}% Completed</span>
                  <Link
                    href={`/systems/${item.systemId}/lessons/${item.id}`}
                    className="text-xs font-bold text-[#1266D5] hover:underline"
                  >
                    Resume Lesson &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

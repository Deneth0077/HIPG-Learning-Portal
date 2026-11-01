'use client';

import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Bookmark, FileText, PlayCircle, ExternalLink } from 'lucide-react';

export default function BookmarksPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
            Bookmarks
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Quick access to your saved manuals, guides, and priority training topics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 border border-[#DCE6F1] shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#9333EA] flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-[#1266D5] uppercase">BTOS User Manual</span>
              <h3 className="text-sm font-bold text-[#082B4C] mt-0.5">Cargo ID Generation Step-by-Step</h3>
              <p className="text-xs text-[#64748B] mt-1">Procedure for generating barcode IDs for quayside tally operations.</p>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href="/systems/btos/manuals/cargo-id"
                  className="text-xs font-bold text-[#1266D5] hover:underline flex items-center gap-1"
                >
                  <span>Open Manual</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#DCE6F1] shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1266D5] flex items-center justify-center shrink-0">
              <PlayCircle size={20} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-[#1266D5] uppercase">CTOS Video Lesson</span>
              <h3 className="text-sm font-bold text-[#082B4C] mt-0.5">Create Yard Plan</h3>
              <p className="text-xs text-[#64748B] mt-1">Allocating slot matrix profiles for incoming feeder vessels.</p>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href="/systems/ctos"
                  className="text-xs font-bold text-[#1266D5] hover:underline flex items-center gap-1"
                >
                  <span>Go to System</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

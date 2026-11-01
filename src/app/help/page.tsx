'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CircleHelp, Phone, Mail, FileQuestion, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
            Help &amp; Support
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            HIPG IT Systems Support, technical assistance, and training hotline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-[#DCE6F1] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1266D5] flex items-center justify-center">
              <Phone size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#082B4C]">IT Service Desk</h3>
            <p className="text-xs text-[#64748B]">Internal Ext: <strong>4401 / 4402</strong></p>
            <p className="text-xs text-[#64748B]">Hotline: <strong>+94 47 288 8888</strong></p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DCE6F1] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-[#16A34A] flex items-center justify-center">
              <Mail size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#082B4C]">Email Support</h3>
            <p className="text-xs text-[#64748B]">ithelpdesk@hipg.lk</p>
            <p className="text-xs text-[#64748B]">training.support@hipg.lk</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DCE6F1] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#9333EA] flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#082B4C]">System Guides</h3>
            <p className="text-xs text-[#64748B]">Browse verified SOPs and manuals for all 7 port platforms.</p>
            <Link href="/manuals" className="text-xs font-bold text-[#1266D5] hover:underline block pt-1">
              Browse Manuals &rarr;
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  BookOpen,
  Printer,
  Share2,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MANUAL_CARGO_ID } from '@/data/portalData';

function UserManualContent() {
  const params = useParams();
  const [activeSectionId, setActiveSectionId] = useState<string>('sec-5');

  const activeSection =
    MANUAL_CARGO_ID.find((s) => s.id === activeSectionId) || MANUAL_CARGO_ID[4];

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Breadcrumb matching Reference Image 3 */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
          <Link href="/systems/btos" className="text-[#1266D5] hover:underline flex items-center gap-1">
            <ChevronLeft size={14} />
            <span>BTOS</span>
          </Link>
          <span>&gt;</span>
          <span className="text-[#1266D5]">User Manual</span>
          <span>&gt;</span>
          <span className="text-[#082B4C] font-bold">Cargo ID Generation</span>
        </div>

        {/* 2-Column Manual Layout: Left TOC Sidebar + Main Documentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Table of Contents matching Reference Image 3 */}
          <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-[#DCE6F1] shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Dark Navy Header matching Reference */}
            <div className="bg-[#082B4C] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">User Manual - BTOS</h3>
              <BookOpen size={16} className="text-[#29C5E8]" />
            </div>

            {/* TOC Items matching numbered list 1 to 9 */}
            <nav className="p-3 space-y-1">
              {MANUAL_CARGO_ID.map((section) => {
                const isActive = activeSectionId === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
                      isActive
                        ? 'bg-[#E0F2FE] text-[#0284C7] font-bold shadow-xs'
                        : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#082B4C]'
                    }`}
                  >
                    <span className="text-[#64748B] w-4 shrink-0 font-mono">
                      {section.number}
                    </span>
                    <span className="truncate">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Panel: Main Manual Content matching Reference Image 3 */}
          <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-[#DCE6F1] shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">
            {/* Section Heading */}
            <div className="border-b border-[#DCE6F1] pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#082B4C] tracking-tight">
                  {activeSection.title}
                </h1>
                <p className="text-xs text-[#64748B] mt-1">
                  BTOS Terminal Operational Procedure • Hambantota International Port
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 border border-[#DCE6F1] rounded-lg text-[#64748B] hover:text-[#082B4C] hover:bg-[#F8FAFC] transition-colors"
                  title="Print Manual Section"
                >
                  <Printer size={16} />
                </button>
                <button
                  onClick={() => alert('Manual bookmarked!')}
                  className="p-2 border border-[#DCE6F1] rounded-lg text-[#64748B] hover:text-[#082B4C] hover:bg-[#F8FAFC] transition-colors"
                  title="Bookmark"
                >
                  <Bookmark size={16} />
                </button>
              </div>
            </div>

            {/* General Text Content (if present) */}
            {activeSection.content && (
              <div className="text-xs sm:text-[13px] text-[#334155] leading-relaxed bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl">
                {activeSection.content}
              </div>
            )}

            {/* Step-by-Step Instructions matching Reference Image 3 */}
            {activeSection.steps && (
              <div className="space-y-6">
                {activeSection.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="border border-[#DCE6F1] rounded-xl p-5 bg-[#FFFFFF] shadow-xs space-y-4 hover:border-[#1266D5]/40 transition-colors"
                  >
                    {/* Step Banner & Text */}
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="px-3 py-1 rounded-md bg-[#1266D5] text-white text-xs font-black shrink-0">
                        Step {step.stepNumber}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-[#142B45]">
                        {step.instruction}
                      </p>
                    </div>

                    {/* Step Visual Mockup Box matching Reference Image 3 */}
                    {step.stepNumber === 1 && (
                      <div className="bg-[#082B4C] rounded-lg p-3 text-white max-w-md shadow-inner flex items-center gap-4 text-xs font-medium">
                        <span className="font-bold text-[#38BDF8]">BTOS</span>
                        <span className="text-gray-400">•</span>
                        {/* Red border highlight around Operations matching reference */}
                        <div className="relative px-3 py-1 bg-[#0E3D68] rounded border-b-2 border-red-500 font-bold text-white">
                          Operations
                        </div>
                        <span className="text-gray-300">Reports</span>
                        <span className="text-gray-300">Maintenance</span>
                      </div>
                    )}

                    {step.stepNumber === 2 && (
                      <div className="bg-[#F8FAFC] border border-[#DCE6F1] rounded-lg p-3 max-w-xs shadow-xs space-y-1.5 text-xs">
                        <div className="font-bold text-[#64748B] flex items-center gap-1.5 pb-1 border-b border-[#E2E8F0]">
                          <span>Operations</span>
                        </div>
                        {/* Red border highlight around Cargo ID Generation matching reference */}
                        <div className="px-3 py-2 bg-gradient-to-r from-[#E2E8F0] to-[#F1F5F9] rounded border-2 border-red-500 font-bold text-[#082B4C] flex items-center gap-2 shadow-xs">
                          <span className="text-red-500 text-sm">▶</span>
                          <span>Cargo ID Generation</span>
                        </div>
                        <div className="px-3 py-1.5 text-[#64748B]">Yard Shifting</div>
                        <div className="px-3 py-1.5 text-[#64748B]">Discharge Summary</div>
                      </div>
                    )}

                    {step.stepNumber === 3 && (
                      <div className="bg-[#F8FAFC] border border-[#DCE6F1] rounded-lg p-4 max-w-md shadow-xs space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <label className="text-[#64748B] font-semibold block">Vessel Call:</label>
                            <input
                              disabled
                              value="HIPG-VSL-2026-904"
                              className="w-full bg-white border border-[#CBD5E1] rounded px-2 py-1 text-[#082B4C]"
                            />
                          </div>
                          <div>
                            <label className="text-[#64748B] font-semibold block">Manifest Prefix:</label>
                            <input
                              disabled
                              value="BL-99214-RO"
                              className="w-full bg-white border border-[#CBD5E1] rounded px-2 py-1 text-[#082B4C]"
                            />
                          </div>
                        </div>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => alert('Demo Cargo ID: HIPG-CRG-2026-44091')}
                            className="px-4 py-2 bg-[#1266D5] text-white text-xs font-bold rounded-lg hover:bg-[#0D55B8] shadow-sm flex items-center gap-2"
                          >
                            <span>Generate</span>
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Action</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Important Notes & Tips */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs">
              <Lightbulb size={18} className="text-[#1266D5] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#082B4C] block font-bold">Standard Procedure Note:</strong>
                <span className="text-[#334155] leading-relaxed">
                  In case of barcode printer paper jams, reprint requests can be submitted in BTOS with supervisor authorization without generating duplicate Cargo IDs.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function UserManualPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Loading user manual...</div>}>
      <UserManualContent />
    </Suspense>
  );
}

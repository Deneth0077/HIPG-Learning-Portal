'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
  Clock,
  CheckCircle2,
  Circle,
  FolderOpen,
  Share2,
  Bookmark
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SystemIcon } from '@/components/common/SystemIcon';
import { SYSTEMS_DATA, BTOS_MODULES } from '@/data/portalData';

function SystemDetailContent() {
  const params = useParams();
  const systemId = (params?.systemId as string) || 'btos';
  const system = SYSTEMS_DATA.find((s) => s.id === systemId) || SYSTEMS_DATA[0];

  const [activeTab, setActiveTab] = useState<'curriculum' | 'overview' | 'manual' | 'resources'>('curriculum');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-01': true,
    'mod-02': true,
    'mod-03': false,
    'mod-04': true,
    'mod-05': false,
  });

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb matching Reference Image 5 */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
          <Link
            href="/systems"
            className="flex items-center gap-1 text-[#1266D5] hover:underline"
          >
            <ChevronLeft size={14} />
            <span>All Systems</span>
          </Link>
          <span>&gt;</span>
          <span className="text-[#082B4C]">{system.name}</span>
        </div>

        {/* System Header Hero Card */}
        <div className="bg-white rounded-2xl p-6 lg:p-7 border border-[#DCE6F1] shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* System Big Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#1266D5] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1266D5]/20">
              <SystemIcon type={system.iconType} size={36} />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
                {system.name}
              </h1>
              <h2 className="text-sm font-bold text-[#142B45]">
                {system.fullName}
              </h2>
              <p className="text-xs text-[#64748B] max-w-xl leading-relaxed pt-1">
                Learn how to install, configure and operate {system.name} including billing, HHT, cargo operations and reporting.
              </p>
            </div>
          </div>

          {/* Learning Progress Box */}
          <div className="w-full lg:w-72 bg-[#F8FAFC] border border-[#DCE6F1] rounded-xl p-4 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#082B4C]">Learning Progress</span>
              <span className="text-sm font-black text-[#1266D5]">{system.progressPercent}%</span>
            </div>
            <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                style={{ width: `${system.progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-[#64748B] font-medium mt-2">
              {system.completedTopics} of {system.topicsCount} topics completed
            </span>
          </div>
        </div>

        {/* Quick Statistics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-[#DCE6F1] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#1266D5] flex items-center justify-center shrink-0">
              <FolderOpen size={20} />
            </div>
            <div>
              <span className="text-lg font-black text-[#082B4C] block leading-tight">{system.topicsCount}</span>
              <span className="text-xs text-[#64748B]">Topics</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#DCE6F1] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
              <PlayCircle size={20} />
            </div>
            <div>
              <span className="text-lg font-black text-[#082B4C] block leading-tight">{system.videosCount}</span>
              <span className="text-xs text-[#64748B]">Video Lessons</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#DCE6F1] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-lg font-black text-[#082B4C] block leading-tight">{system.manualsCount}</span>
              <span className="text-xs text-[#64748B]">User Manual</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#DCE6F1] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-lg font-black text-[#082B4C] block leading-tight">{system.totalDuration}</span>
              <span className="text-xs text-[#64748B]">Total Duration</span>
            </div>
          </div>
        </div>

        {/* Content Tabs matching reference */}
        <div>
          <div className="flex items-center gap-2 border-b border-[#DCE6F1] pb-px">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'curriculum'
                  ? 'bg-[#1266D5] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:text-[#082B4C]'
              }`}
            >
              Learning Curriculum
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#1266D5] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:text-[#082B4C]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'manual'
                  ? 'bg-[#1266D5] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:text-[#082B4C]'
              }`}
            >
              User Manual
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'resources'
                  ? 'bg-[#1266D5] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:text-[#082B4C]'
              }`}
            >
              Resources
            </button>
          </div>

          {/* Tab 1: Expandable Curriculum Accordion Modules */}
          {activeTab === 'curriculum' && (
            <div className="bg-white rounded-b-2xl rounded-tr-2xl p-5 border border-[#DCE6F1] shadow-[0_2px_4px_rgba(0,0,0,0.02)] space-y-3">
              {BTOS_MODULES.map((module) => {
                const isExpanded = expandedModules[module.id] ?? false;

                return (
                  <div
                    key={module.id}
                    className="border border-[#DCE6F1] rounded-xl overflow-hidden transition-all duration-200"
                  >
                    {/* Module Accordion Header */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full px-5 py-3.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded-md text-[#64748B]">
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-[#082B4C]">
                          {module.moduleNumber} - {module.title}
                        </span>
                        <span className="text-[11px] text-[#64748B] font-medium">
                          ({module.lessons.length} Topics)
                        </span>
                      </div>

                      {/* Completed Badge Indicator */}
                      <div className="flex items-center gap-2">
                        {module.isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-green-100 text-[#16A34A] flex items-center justify-center">
                            <CheckCircle2 size={16} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full text-[#CBD5E1] flex items-center justify-center">
                            <Circle size={16} />
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Module Lessons List */}
                    {isExpanded && (
                      <div className="divide-y divide-[#F1F5F9] bg-white">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="px-6 py-3 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                  lesson.isCompleted
                                    ? 'bg-green-100 text-[#16A34A]'
                                    : 'bg-blue-50 text-[#1266D5]'
                                }`}
                              >
                                {lesson.isCompleted ? (
                                  <CheckCircle2 size={15} />
                                ) : (
                                  <PlayCircle size={15} />
                                )}
                              </div>
                              <div className="truncate">
                                <Link
                                  href={`/systems/${system.id}/lessons/${lesson.id}`}
                                  className="text-xs sm:text-[13px] font-semibold text-[#142B45] hover:text-[#1266D5] transition-colors block truncate"
                                >
                                  {lesson.title}
                                </Link>
                                <span className="text-[10.5px] text-[#64748B]">
                                  Duration: {lesson.duration}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <Link
                                href={`/systems/${system.id}/lessons/${lesson.id}`}
                                className="px-3 py-1 rounded-md text-[11px] font-bold bg-[#EFF6FF] text-[#1266D5] hover:bg-[#1266D5] hover:text-white transition-colors"
                              >
                                Watch Video
                              </Link>
                              <Link
                                href={`/systems/${system.id}/manuals/cargo-id`}
                                className="px-3 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-[#475569] hover:bg-gray-200 transition-colors hidden sm:inline-block"
                              >
                                Manual
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Overview */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-b-2xl rounded-tr-2xl p-6 border border-[#DCE6F1] space-y-4 text-xs leading-relaxed text-[#475569]">
              <h3 className="text-base font-bold text-[#082B4C]">About {system.fullName}</h3>
              <p>
                The Berth, Terminal & Operations System (BTOS) is the mission-critical terminal operating solution powering Hambantota International Port’s multi-purpose maritime activities. It provides centralized management for vessel scheduling, quayside crane allocation, yard planning, tally clerk handheld operations, and automated billing calculation.
              </p>
              <h4 className="text-sm font-bold text-[#082B4C] pt-2">Key Operational Capabilities</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Real-time synchronization with Vessel Traffic Management (VTMS).</li>
                <li>Direct Handheld Terminal (HHT) integration for Ro-Ro vehicle scan and general cargo tally.</li>
                <li>Automated EDI file parsing for shipping line stowage plans (BAPLIE).</li>
                <li>Instant tariff generation and EAS accounting settlement integration.</li>
              </ul>
            </div>
          )}

          {/* Tab 3: User Manual shortcut */}
          {activeTab === 'manual' && (
            <div className="bg-white rounded-b-2xl rounded-tr-2xl p-6 border border-[#DCE6F1] space-y-4">
              <h3 className="text-sm font-bold text-[#082B4C]">Available User Guides</h3>
              <div className="border border-[#DCE6F1] rounded-xl p-4 flex items-center justify-between bg-[#F8FAFC]">
                <div>
                  <h4 className="text-xs font-bold text-[#142B45]">BTOS Operations Manual – Cargo ID Generation</h4>
                  <p className="text-[11px] text-[#64748B]">Complete guide on generating unique barcodes for discharge cargo.</p>
                </div>
                <Link
                  href="/systems/btos/manuals/cargo-id"
                  className="px-4 py-2 bg-[#1266D5] text-white text-xs font-bold rounded-lg hover:bg-[#0D55B8]"
                >
                  Open Manual
                </Link>
              </div>
            </div>
          )}

          {/* Tab 4: Resources */}
          {activeTab === 'resources' && (
            <div className="bg-white rounded-b-2xl rounded-tr-2xl p-6 border border-[#DCE6F1] space-y-3">
              <h3 className="text-sm font-bold text-[#082B4C]">System Downloads &amp; Documents</h3>
              <p className="text-xs text-[#64748B]">Download official client software and SOP specifications.</p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between p-3 border border-[#E2E8F0] rounded-lg">
                  <span className="text-xs font-semibold text-[#142B45]">BTOS Client v4.8 Installer (Windows x64)</span>
                  <button className="text-xs font-bold text-[#1266D5] hover:underline" onClick={() => alert('Download starting...')}>Download (.msi)</button>
                </div>
                <div className="flex items-center justify-between p-3 border border-[#E2E8F0] rounded-lg">
                  <span className="text-xs font-semibold text-[#142B45]">HIPG Standard Operating Procedure SOP-OPS-004.pdf</span>
                  <button className="text-xs font-bold text-[#1266D5] hover:underline" onClick={() => alert('Opening PDF...')}>Download PDF</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default function SystemDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Loading system details...</div>}>
      <SystemDetailContent />
    </Suspense>
  );
}

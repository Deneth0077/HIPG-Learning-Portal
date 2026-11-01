'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  FileText,
  Bookmark,
  Share2
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BTOS_MODULES, SYSTEMS_DATA } from '@/data/portalData';

function VideoLessonContent() {
  const params = useParams();
  const router = useRouter();
  const systemId = (params?.systemId as string) || 'btos';
  const lessonId = (params?.lessonId as string) || 'cargo-id-gen';

  const [activeTab, setActiveTab] = useState<'overview' | 'manual' | 'step-by-step' | 'screenshots' | 'related'>('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Accordion state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-01': false,
    'mod-02': false,
    'mod-03': false,
    'mod-04': true,
    'mod-05': false,
  });

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleComplete = () => {
    setCompleted(!completed);
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Breadcrumb matching Reference Image 4 */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
          <Link href="/systems/btos" className="text-[#1266D5] hover:underline flex items-center gap-1">
            <ChevronLeft size={14} />
            <span>BTOS</span>
          </Link>
          <span>&gt;</span>
          <span className="text-[#64748B]">Module 04 - Operational Training</span>
          <span>&gt;</span>
          <span className="text-[#082B4C] font-bold">Cargo ID Generation</span>
        </div>

        {/* 2-Column Lesson Layout: Left Curriculum Sidebar + Main Video Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: System Curriculum Sidebar matching Reference Image 4 */}
          <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-[#DCE6F1] shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Dark Navy Header */}
            <div className="bg-[#082B4C] text-white px-5 py-4">
              <h3 className="text-sm font-bold tracking-tight">BTOS Curriculum</h3>
            </div>

            {/* Modules List */}
            <div className="divide-y divide-[#F1F5F9] max-h-[720px] overflow-y-auto">
              {BTOS_MODULES.map((module) => {
                const isExpanded = expandedModules[module.id] ?? false;
                const isCurrentModule = module.id === 'mod-04';

                return (
                  <div key={module.id} className="text-xs">
                    {/* Module Title Row */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                        isCurrentModule ? 'bg-[#F0F7FF] text-[#1266D5] font-bold' : 'hover:bg-[#F8FAFC] text-[#142B45] font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        <span className="truncate">{module.moduleNumber} - {module.title}</span>
                      </div>
                      {module.isCompleted && (
                        <CheckCircle2 size={15} className="text-[#16A34A] shrink-0" />
                      )}
                    </button>

                    {/* Module Lessons */}
                    {isExpanded && (
                      <div className="bg-[#F8FAFC] py-1 border-t border-[#E2E8F0]">
                        {module.lessons.map((lesson) => {
                          const isActive = lesson.id === 'cargo-id-gen';

                          return (
                            <Link
                              key={lesson.id}
                              href={`/systems/btos/lessons/${lesson.id}`}
                              className={`flex items-center gap-2.5 px-6 py-2.5 text-xs transition-colors ${
                                isActive
                                  ? 'bg-[#E0F2FE] text-[#0284C7] font-bold border-l-4 border-[#0284C7]'
                                  : 'text-[#475569] hover:bg-white hover:text-[#082B4C]'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                                  lesson.isCompleted
                                    ? 'bg-green-100 text-[#16A34A]'
                                    : isActive
                                    ? 'bg-[#0284C7] text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {lesson.isCompleted ? (
                                  <CheckCircle2 size={13} />
                                ) : (
                                  <Play size={8} className="fill-current ml-0.5" />
                                )}
                              </div>
                              <span className="truncate">{lesson.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content: Video Player, Tabs & Action Controls */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* Lesson Title */}
            <h1 className="text-xl sm:text-2xl font-black text-[#082B4C] tracking-tight">
              BTOS - Cargo ID Generation
            </h1>

            {/* Video Player Card */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-lg border border-[#DCE6F1] relative group aspect-video max-h-[500px]">
              {/* High-quality Seaport Harbor Backdrop Graphic */}
              <div className="absolute inset-0 bg-[#0A192F] overflow-hidden">
                <svg
                  viewBox="0 0 1000 560"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full object-cover"
                >
                  <rect width="1000" height="560" fill="url(#videoSeaGrad)" />
                  {/* Harbor Quay */}
                  <rect y="380" width="1000" height="180" fill="#1E293B" />
                  {/* Container Ship at Berth */}
                  <path d="M400 380 L440 280 L920 280 L980 380 Z" fill="#0F172A" />
                  {/* Containers on Berth & Ship */}
                  <g opacity="0.95">
                    <rect x="470" y="220" width="45" height="60" fill="#EF4444" rx="1" />
                    <rect x="520" y="200" width="48" height="80" fill="#3B82F6" rx="1" />
                    <rect x="575" y="210" width="45" height="70" fill="#10B981" rx="1" />
                    <rect x="625" y="190" width="48" height="90" fill="#F59E0B" rx="1" />
                    <rect x="680" y="230" width="42" height="50" fill="#6366F1" rx="1" />
                    <rect x="730" y="210" width="46" height="70" fill="#14B8A6" rx="1" />
                    <rect x="785" y="240" width="40" height="40" fill="#EC4899" rx="1" />
                  </g>
                  {/* Giant Yellow/Orange Container Gantry Crane */}
                  <g stroke="#F59E0B" strokeWidth="4" fill="none">
                    <line x1="600" y1="380" x2="630" y2="120" />
                    <line x1="720" y1="380" x2="680" y2="120" />
                    <line x1="480" y1="110" x2="880" y2="110" strokeWidth="6" />
                    <line x1="655" y1="50" x2="480" y2="110" strokeWidth="2.5" />
                    <line x1="655" y1="50" x2="880" y2="110" strokeWidth="2.5" />
                    {/* Spreader holding container */}
                    <rect x="700" y="110" width="28" height="10" fill="#EF4444" stroke="none" />
                    <line x1="714" y1="120" x2="714" y2="210" stroke="#CBD5E1" strokeWidth="1.5" />
                    <rect x="698" y="210" width="32" height="16" fill="#10B981" stroke="none" rx="1" />
                  </g>
                  <defs>
                    <linearGradient id="videoSeaGrad" x1="0" y1="0" x2="1000" y2="560" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#38BDF8" />
                      <stop offset="0.5" stopColor="#0284C7" />
                      <stop offset="1" stopColor="#082B4C" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Big Center Play Circle matching reference */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 hover:bg-[#1266D5] text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-2xl backdrop-blur-xs"
                >
                  {isPlaying ? (
                    <Pause size={32} className="fill-white" />
                  ) : (
                    <Play size={32} className="fill-white ml-1.5" />
                  )}
                </button>
              </div>

              {/* Bottom Video Controls Bar matching reference */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 text-white flex flex-col gap-2">
                {/* Scrubbing Bar */}
                <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden cursor-pointer relative">
                  <div className="bg-[#EF4444] h-full w-[45%]" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="hover:text-[#38BDF8] transition-colors"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="hover:text-[#38BDF8] transition-colors"
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <span className="font-mono text-[11px] text-[#E2E8F0]">
                      0:00 / 12:36
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => alert('HD 1080p Stream (Google Drive Video Bridge ready)')}
                      className="hover:text-[#38BDF8] transition-colors"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => alert('Fullscreen activated')}
                      className="hover:text-[#38BDF8] transition-colors"
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Below Video: Tabs matching reference */}
            <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="flex items-center border-b border-[#DCE6F1] px-5 pt-3 gap-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-[#1266D5] text-[#1266D5]'
                      : 'border-transparent text-[#64748B] hover:text-[#082B4C]'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'manual'
                      ? 'border-[#1266D5] text-[#1266D5]'
                      : 'border-transparent text-[#64748B] hover:text-[#082B4C]'
                  }`}
                >
                  User Manual
                </button>
                <button
                  onClick={() => setActiveTab('step-by-step')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'step-by-step'
                      ? 'border-[#1266D5] text-[#1266D5]'
                      : 'border-transparent text-[#64748B] hover:text-[#082B4C]'
                  }`}
                >
                  Step by Step
                </button>
                <button
                  onClick={() => setActiveTab('screenshots')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'screenshots'
                      ? 'border-[#1266D5] text-[#1266D5]'
                      : 'border-transparent text-[#64748B] hover:text-[#082B4C]'
                  }`}
                >
                  Screenshots
                </button>
                <button
                  onClick={() => setActiveTab('related')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'related'
                      ? 'border-[#1266D5] text-[#1266D5]'
                      : 'border-transparent text-[#64748B] hover:text-[#082B4C]'
                  }`}
                >
                  Related Lessons
                </button>
              </div>

              {/* Tab 1: Overview content matching Reference Image 4 */}
              {activeTab === 'overview' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-8 space-y-2">
                      <h3 className="text-sm font-bold text-[#082B4C]">About this Lesson</h3>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        This video explains how to generate a Cargo ID in BTOS, including required information, step-by-step process and verification.
                      </p>
                    </div>

                    <div className="md:col-span-4 bg-[#F8FAFC] border border-[#DCE6F1] rounded-xl p-4 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#64748B] font-medium">System :</span>
                        <span className="font-bold text-[#082B4C]">BTOS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B] font-medium">Module :</span>
                        <span className="font-bold text-[#082B4C]">Operational Training</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B] font-medium">Duration :</span>
                        <span className="font-bold text-[#082B4C]">12:36</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: User Manual snippet */}
              {activeTab === 'manual' && (
                <div className="p-6 space-y-3">
                  <h3 className="text-sm font-bold text-[#082B4C]">Interactive User Guide</h3>
                  <p className="text-xs text-[#64748B]">Need to view step-by-step interface mockups and instructions?</p>
                  <Link
                    href="/systems/btos/manuals/cargo-id"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1266D5] text-white text-xs font-bold rounded-lg hover:bg-[#0D55B8]"
                  >
                    <FileText size={14} />
                    <span>Open Full BTOS Manual</span>
                  </Link>
                </div>
              )}

              {/* Tab 3: Step-by-Step */}
              {activeTab === 'step-by-step' && (
                <div className="p-6 space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1266D5] font-bold flex items-center justify-center shrink-0">1</span>
                    <p className="text-[#142B45] font-semibold pt-0.5">Login to BTOS and go to Operation menu.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1266D5] font-bold flex items-center justify-center shrink-0">2</span>
                    <p className="text-[#142B45] font-semibold pt-0.5">Click on Cargo ID Generation under Operations submenu.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1266D5] font-bold flex items-center justify-center shrink-0">3</span>
                    <p className="text-[#142B45] font-semibold pt-0.5">Fill the required manifest details and click Generate.</p>
                  </div>
                </div>
              )}

              {/* Tab 4: Screenshots */}
              {activeTab === 'screenshots' && (
                <div className="p-6">
                  <p className="text-xs text-[#64748B] mb-3">Interface references captured from production BTOS terminal:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-[#CBD5E1] rounded-lg p-2 bg-[#F8FAFC] text-center text-xs font-mono text-[#082B4C]">
                      [BTOS Main Toolbar &gt; Operations Menu]
                    </div>
                    <div className="border border-[#CBD5E1] rounded-lg p-2 bg-[#F8FAFC] text-center text-xs font-mono text-[#082B4C]">
                      [Cargo ID Generation Dialog]
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Related Lessons */}
              {activeTab === 'related' && (
                <div className="p-6 space-y-2">
                  <Link href="/systems/btos/lessons/4-3-discharging-cargo-plan" className="block p-3 border border-[#DCE6F1] rounded-lg hover:bg-[#F8FAFC] text-xs">
                    <span className="font-bold text-[#082B4C]">4.3 Discharging Cargo Plan</span>
                    <span className="block text-[11px] text-[#64748B]">Next step after generating Cargo ID</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom Lesson Navigation Bar matching Reference Image 4 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Link
                href="/systems/btos/lessons/4-1-update-vessel-delay-time"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#DCE6F1] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#142B45] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Previous Lesson</span>
              </Link>

              <button
                onClick={handleToggleComplete}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all duration-200 ${
                  completed
                    ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                    : 'bg-[#16A34A] text-white hover:bg-[#15803D]'
                }`}
              >
                <CheckCircle2 size={16} />
                <span>{completed ? 'Lesson Completed ✓' : 'Mark as Completed'}</span>
              </button>

              <Link
                href="/systems/btos/lessons/4-3-discharging-cargo-plan"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#DCE6F1] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#142B45] transition-colors"
              >
                <span>Next Lesson</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function VideoLessonPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Loading video lesson...</div>}>
      <VideoLessonContent />
    </Suspense>
  );
}

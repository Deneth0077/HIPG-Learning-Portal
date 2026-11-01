'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  Share2,
  Video,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BTOS_MODULES, ALL_SYSTEM_MODULES, SYSTEMS_DATA, MANUAL_CARGO_ID } from '@/data/portalData';

interface ManualStep {
  stepNumber: number;
  title: string;
  instruction: string;
  highlightText?: string;
  imageUrl?: string;
  imageDriveId?: string;
}

interface Lesson {
  id: string;
  _id?: string;
  title: string;
  slug?: string;
  duration?: string;
  order?: string;
  description?: string;
  videoDriveId?: string;
  videoUrl?: string;
  manualContent?: string;
  manualSteps?: ManualStep[];
  isCompleted?: boolean;
}

interface ModuleItem {
  id: string;
  moduleNumber: string;
  title: string;
  isCompleted?: boolean;
  lessons: Lesson[];
}

function VideoLessonContent() {
  const params = useParams();
  const router = useRouter();
  const systemId = ((params?.systemId as string) || 'btos').toLowerCase();
  const lessonId = (params?.lessonId as string) || 'btos-uat-install';

  const [modules, setModules] = useState<ModuleItem[]>(BTOS_MODULES as any);
  const [currentModule, setCurrentModule] = useState<ModuleItem | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'manual' | 'step-by-step' | 'screenshots' | 'related'>('overview');
  const [completed, setCompleted] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Accordion state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-01': true,
    'mod-04': true,
  });

  const systemMeta = SYSTEMS_DATA.find((s) => s.id === systemId) || SYSTEMS_DATA[0];

  // Fetch modules and lesson data
  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        const res = await fetch(`/api/systems/${systemId}/modules`);
        const data = await res.json();
        let loadedMods: ModuleItem[] = [];
        if (data.modules && data.modules.length > 0) {
          loadedMods = data.modules;
          setModules(data.modules);
        } else {
          loadedMods = (ALL_SYSTEM_MODULES[systemId] || []) as any;
          setModules(loadedMods);
        }

        // Find active lesson across modules
        let foundLesson: Lesson | null = null;
        let foundMod: ModuleItem | null = null;

        for (const m of loadedMods) {
          const l = (m.lessons || []).find(
            (item) => item.id === lessonId || item.slug === lessonId || item._id === lessonId
          );
          if (l) {
            foundLesson = l;
            foundMod = m;
            break;
          }
        }

        if (foundLesson && foundMod) {
          setCurrentLesson(foundLesson);
          setCurrentModule(foundMod);
          setExpandedModules((prev) => ({ ...prev, [foundMod!.id]: true }));
        } else {
          // Try fetching from /api/lessons/[id]
          try {
            const lesRes = await fetch(`/api/lessons/${lessonId}`);
            const lesData = await lesRes.json();
            if (lesData.lesson) {
              setCurrentLesson(lesData.lesson);
              const mod = loadedMods.find((m) => m.id === lesData.lesson.moduleId) || loadedMods[0];
              setCurrentModule(mod);
            } else {
              // fallback to first lesson of first module
              const fallbackMod = loadedMods[0];
              const fallbackLes = fallbackMod?.lessons?.[0];
              if (fallbackLes) {
                setCurrentLesson(fallbackLes);
                setCurrentModule(fallbackMod);
              }
            }
          } catch {
            const fallbackMod = loadedMods[0];
            const fallbackLes = fallbackMod?.lessons?.[0];
            if (fallbackLes) {
              setCurrentLesson(fallbackLes);
              setCurrentModule(fallbackMod);
            }
          }
        }
      } catch {
        const fallback = (ALL_SYSTEM_MODULES[systemId] || []) as any;
        setModules(fallback);
        if (fallback[0]?.lessons?.[0]) {
          setCurrentModule(fallback[0]);
          setCurrentLesson(fallback[0].lessons[0]);
        }
      }
    };

    loadCurriculum();
  }, [systemId, lessonId]);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleComplete = () => {
    setCompleted(!completed);
  };

  const lessonTitle = currentLesson?.title || 'Terminal Training Lesson';
  const moduleTitle = currentModule ? `${currentModule.moduleNumber} – ${currentModule.title}` : 'Training Module';
  const duration = currentLesson?.duration || '10:00';
  const steps: ManualStep[] =
    currentLesson?.manualSteps && currentLesson.manualSteps.length > 0
      ? currentLesson.manualSteps
      : (MANUAL_CARGO_ID[4].steps as any);

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Dynamic Breadcrumbs matching path */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] flex-wrap">
          <Link href={`/systems/${systemId}`} className="text-[#1266D5] hover:underline flex items-center gap-1 font-bold">
            <ChevronLeft size={14} />
            <span>{systemMeta.name}</span>
          </Link>
          <span>&gt;</span>
          <span className="text-[#64748B] font-medium">{moduleTitle}</span>
          <span>&gt;</span>
          <span className="text-[#082B4C] font-bold">{lessonTitle}</span>
        </div>

        {/* 2-Column Lesson Layout: Left Curriculum Sidebar + Main Video Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: System Curriculum Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-[#DCE6F1] shadow-xs overflow-hidden">
            {/* Dark Navy Header */}
            <div className="bg-[#082B4C] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">{systemMeta.name} Curriculum</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1266D5] text-white px-2 py-0.5 rounded">
                Modules
              </span>
            </div>

            {/* Modules List */}
            <div className="divide-y divide-[#F1F5F9] max-h-[720px] overflow-y-auto">
              {modules.map((module) => {
                const isExpanded = expandedModules[module.id] ?? false;
                const isCurrentModule = currentModule?.id === module.id;

                return (
                  <div key={module.id} className="text-xs">
                    {/* Module Title Row */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isCurrentModule ? 'bg-[#F0F7FF] text-[#1266D5] font-bold' : 'hover:bg-[#F8FAFC] text-[#142B45] font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        <span className="truncate">{module.moduleNumber} – {module.title}</span>
                      </div>
                      {module.isCompleted && (
                        <CheckCircle2 size={15} className="text-[#16A34A] shrink-0" />
                      )}
                    </button>

                    {/* Module Lessons */}
                    {isExpanded && (
                      <div className="bg-[#F8FAFC] py-1 border-t border-[#E2E8F0]">
                        {(module.lessons || []).map((les, lIdx) => {
                          const isActive =
                            currentLesson &&
                            (currentLesson.id === les.id ||
                              currentLesson.slug === les.slug ||
                              currentLesson.title === les.title);

                          return (
                            <Link
                              key={`${module.id || 'mod'}-${les.id || les.slug || 'les'}-${lIdx}`}
                              href={`/systems/${systemId}/lessons/${les.slug || les.id}`}
                              className={`flex items-center gap-2.5 px-6 py-2.5 text-xs transition-colors ${
                                isActive
                                  ? 'bg-[#E0F2FE] text-[#0284C7] font-bold border-l-4 border-[#0284C7]'
                                  : 'text-[#475569] hover:bg-white hover:text-[#082B4C]'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                                  les.isCompleted
                                    ? 'bg-green-100 text-[#16A34A]'
                                    : isActive
                                    ? 'bg-[#0284C7] text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {les.isCompleted ? (
                                  <CheckCircle2 size={13} />
                                ) : (
                                  <Play size={8} className="fill-current ml-0.5" />
                                )}
                              </div>
                              <span className="truncate">{les.title}</span>
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
            {/* Dynamic Lesson Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-[#082B4C] tracking-tight">
                {systemMeta.name} – {lessonTitle}
              </h1>

              {currentLesson?.videoDriveId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 font-mono self-start sm:self-auto">
                  <Video size={13} /> Google Drive Stream
                </span>
              )}
            </div>

            {/* Video Player Card */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-lg border border-[#DCE6F1] relative group aspect-video max-h-[500px]">
              {currentLesson?.videoDriveId ? (
                /* Live Google Drive Video Stream Player */
                <video
                  key={currentLesson.videoDriveId}
                  controls
                  src={`/api/video/stream/${currentLesson.videoDriveId}`}
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                /* Seaport Backdrop Graphic with info overlay when no video is attached */
                <div className="absolute inset-0 bg-[#0A192F] overflow-hidden flex items-center justify-center">
                  <svg
                    viewBox="0 0 1000 560"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full object-cover opacity-60"
                  >
                    <rect width="1000" height="560" fill="url(#videoSeaGrad)" />
                    <rect y="380" width="1000" height="180" fill="#1E293B" />
                    <path d="M400 380 L440 280 L920 280 L980 380 Z" fill="#0F172A" />
                    <g opacity="0.95">
                      <rect x="470" y="220" width="45" height="60" fill="#EF4444" rx="1" />
                      <rect x="520" y="200" width="48" height="80" fill="#3B82F6" rx="1" />
                      <rect x="575" y="210" width="45" height="70" fill="#10B981" rx="1" />
                      <rect x="625" y="190" width="48" height="90" fill="#F59E0B" rx="1" />
                    </g>
                    <defs>
                      <linearGradient id="videoSeaGrad" x1="0" y1="0" x2="1000" y2="560" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38BDF8" />
                        <stop offset="0.5" stopColor="#0284C7" />
                        <stop offset="1" stopColor="#082B4C" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="absolute z-10 text-center p-6 space-y-3 bg-black/40 backdrop-blur-xs rounded-2xl border border-white/20 max-w-md mx-4">
                    <Video size={40} className="mx-auto text-[#38BDF8]" />
                    <h3 className="text-white font-bold text-base sm:text-lg">{lessonTitle}</h3>
                    <p className="text-white/80 text-xs">
                      Video file pending upload. Please refer to the step-by-step user manual below for procedure instructions.
                    </p>
                    <button
                      onClick={() => setActiveTab('step-by-step')}
                      className="px-4 py-2 bg-[#1266D5] text-white rounded-xl text-xs font-bold hover:bg-[#0D55B8] transition-colors"
                    >
                      View Step-by-Step Instructions
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Below Video: Tabs */}
            <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-xs overflow-hidden">
              <div className="flex items-center border-b border-[#DCE6F1] px-5 pt-3 gap-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'border-[#1266D5] text-[#1266D5]'
                      : 'border-transparent text-[#64748B] hover:text-[#082B4C]'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('step-by-step')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'step-by-step'
                      ? 'border-[#1266D5] text-[#1266D5]'
                      : 'border-transparent text-[#64748B] hover:text-[#082B4C]'
                  }`}
                >
                  <FileText size={15} />
                  <span>Step by Step Manual</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-[#1266D5]">
                    {steps.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('screenshots')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'screenshots'
                      ? 'border-[#1266D5] text-[#1266D5]'
                      : 'border-transparent text-[#64748B] hover:text-[#082B4C]'
                  }`}
                >
                  <ImageIcon size={15} />
                  <span>Screenshots</span>
                  {steps.filter((s) => s.imageUrl).length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-green-100 text-green-700">
                      {steps.filter((s) => s.imageUrl).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'manual'
                      ? 'border-[#1266D5] text-[#1266D5]'
                      : 'border-transparent text-[#64748B] hover:text-[#082B4C]'
                  }`}
                >
                  User Manual Document
                </button>
              </div>

              {/* Tab 1: Overview content */}
              {activeTab === 'overview' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-8 space-y-3">
                      <h3 className="text-sm font-bold text-[#082B4C]">About this Lesson</h3>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        {currentLesson?.description ||
                          'Complete step-by-step operating guidelines and interactive instructions for Hambantota International Port Group terminal management operations.'}
                      </p>
                      {currentLesson?.manualContent && (
                        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-[#1E3A8A]">
                          <strong className="block font-bold mb-1">Operational Scope:</strong>
                          <p>{currentLesson.manualContent}</p>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-4 bg-[#F8FAFC] border border-[#DCE6F1] rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#64748B] font-medium">System :</span>
                        <span className="font-bold text-[#082B4C]">{systemMeta.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B] font-medium">Module :</span>
                        <span className="font-bold text-[#082B4C]">{currentModule?.title || 'Operational'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B] font-medium">Duration :</span>
                        <span className="font-bold text-[#082B4C] font-mono">{duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B] font-medium">Manual Steps :</span>
                        <span className="font-bold text-[#1266D5]">{steps.length} Steps</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Step-by-Step Instructions with Screenshots */}
              {activeTab === 'step-by-step' && (
                <div className="p-6 space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#082B4C]">Step-by-Step Procedure Guide</h3>
                    <p className="text-xs text-[#64748B]">
                      Follow the sequential instructions and refer to the attached software screenshots.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {steps.map((st, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-4 sm:p-5 rounded-2xl border border-[#DCE6F1] bg-[#F8FAFC] space-y-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-[#1266D5] text-white font-black text-xs flex items-center justify-center shrink-0">
                            {st.stepNumber || sIdx + 1}
                          </span>
                          <h4 className="font-bold text-sm text-[#082B4C]">
                            {st.title || `Step ${sIdx + 1}`}
                          </h4>
                        </div>

                        <p className="text-xs text-[#334155] leading-relaxed pl-9">
                          {st.instruction}
                        </p>

                        {st.highlightText && (
                          <div className="ml-9 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11.5px] text-amber-900 font-medium">
                            {st.highlightText}
                          </div>
                        )}

                        {/* Step Screenshot */}
                        {st.imageUrl && (
                          <div className="ml-9 mt-2">
                            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                              Step Screenshot:
                            </span>
                            <div className="relative rounded-xl overflow-hidden border border-[#CBD5E1] bg-black/5 max-w-xl group">
                              <img
                                src={st.imageUrl}
                                alt={st.title || `Step ${sIdx + 1}`}
                                className="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => setPreviewImage(st.imageUrl || null)}
                              />
                              <button
                                onClick={() => setPreviewImage(st.imageUrl || null)}
                                className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/70 hover:bg-black text-white text-[10px] font-bold rounded-lg backdrop-blur-xs flex items-center gap-1"
                              >
                                <Maximize2 size={11} /> Click to View Full Size
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Screenshots Gallery */}
              {activeTab === 'screenshots' && (
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#082B4C]">Lesson Screenshot Gallery</h3>
                    <p className="text-xs text-[#64748B]">All terminal interface screenshots saved for this lesson.</p>
                  </div>

                  {steps.filter((s) => s.imageUrl).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {steps
                        .filter((s) => s.imageUrl)
                        .map((s, idx) => (
                          <div
                            key={idx}
                            className="border border-[#DCE6F1] rounded-2xl overflow-hidden bg-white shadow-xs group"
                          >
                            <div className="relative aspect-video bg-black/5 overflow-hidden">
                              <img
                                src={s.imageUrl}
                                alt={s.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                onClick={() => setPreviewImage(s.imageUrl || null)}
                              />
                            </div>
                            <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
                              <span className="text-xs font-bold text-[#082B4C] truncate">{s.title}</span>
                              <button
                                onClick={() => setPreviewImage(s.imageUrl || null)}
                                className="text-[11px] font-bold text-[#1266D5] hover:underline"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-[#64748B] border border-dashed border-[#CBD5E1] rounded-2xl">
                      <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                      <p>No screenshots uploaded for this lesson yet.</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Admins can upload screenshots directly from the Module &amp; Lesson Management panel.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: User Manual */}
              {activeTab === 'manual' && (
                <div className="p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[#082B4C]">Official Operating Document</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {currentLesson?.manualContent ||
                      'Standard operating procedure manual for Hambantota International Port Group operations.'}
                  </p>
                  <Link
                    href={`/systems/${systemId}/manuals/${lessonId}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1266D5] text-white text-xs font-bold rounded-xl hover:bg-[#0D55B8] shadow-sm transition-colors"
                  >
                    <FileText size={15} />
                    <span>Open Interactive Documentation Screen</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Full Size Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-5xl max-h-[90vh] bg-black rounded-2xl overflow-hidden border border-white/20">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
              >
                ✕
              </button>
              <img
                src={previewImage}
                alt="Enlarged screenshot"
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function VideoLessonPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading lesson...</div>}>
      <VideoLessonContent />
    </Suspense>
  );
}

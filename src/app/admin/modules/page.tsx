'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  PlusCircle,
  Trash2,
  Edit2,
  X,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Video,
  FileText,
  Image as ImageIcon,
  Clock,
  Plus,
  CheckCircle2,
  ExternalLink,
  Upload,
  Link2
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SYSTEMS_DATA, BTOS_MODULES } from '@/data/portalData';

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
  thumbnailUrl?: string;
  isCompleted?: boolean;
}

interface ModuleItem {
  id: string;
  _id?: string;
  moduleNumber: string;
  title: string;
  slug?: string;
  description?: string;
  lessons: Lesson[];
  isPublished?: boolean;
}

export default function ModuleManagementPage() {
  const [selectedSystem, setSelectedSystem] = useState('btos');
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-01': true,
    'mod-02': false,
    'mod-03': false,
    'mod-04': true,
    'mod-05': false,
  });

  // Modals state
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);
  const [showLessonModal, setShowLessonModal] = useState<string | null>(null); // moduleId
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: Lesson } | null>(null);
  const [showAttachVideoModal, setShowAttachVideoModal] = useState<Lesson | null>(null);

  // Form states
  const [moduleForm, setModuleForm] = useState({
    moduleNumber: 'Module 06',
    title: '',
    description: '',
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    duration: '10:00',
    order: '1.1',
    description: '',
    videoDriveId: '',
    thumbnailUrl: '',
  });

  const [videoForm, setVideoForm] = useState({
    driveFileId: '',
    duration: '12:30',
  });

  const fetchModules = async () => {
    try {
      const res = await fetch(`/api/systems/${selectedSystem}/modules`);
      const data = await res.json();
      if (data.modules && data.modules.length > 0) {
        setModules(data.modules);
      } else {
        if (selectedSystem === 'btos') setModules(BTOS_MODULES as any);
        else setModules([]);
      }
    } catch {
      if (selectedSystem === 'btos') setModules(BTOS_MODULES as any);
      else setModules([]);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [selectedSystem]);

  const toggleExpand = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Add / Edit Module
  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModule) {
      // Edit module
      setModules((prev) =>
        prev.map((m) =>
          m.id === editingModule.id
            ? { ...m, moduleNumber: moduleForm.moduleNumber, title: moduleForm.title, description: moduleForm.description }
            : m
        )
      );
    } else {
      // Add module
      const newMod: ModuleItem = {
        id: `mod-${Date.now()}`,
        moduleNumber: moduleForm.moduleNumber,
        title: moduleForm.title,
        description: moduleForm.description,
        lessons: [],
        isPublished: true,
      };
      setModules((prev) => [...prev, newMod]);
      setExpandedModules((prev) => ({ ...prev, [newMod.id]: true }));
    }
    setShowModuleModal(false);
    setEditingModule(null);
    setModuleForm({ moduleNumber: 'Module 06', title: '', description: '' });
  };

  // Add / Edit Lesson
  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetModuleId = showLessonModal || (editingLesson ? editingLesson.moduleId : null);
    if (!targetModuleId) return;

    if (editingLesson) {
      // Update existing lesson
      setModules((prev) =>
        prev.map((m) => {
          if (m.id !== targetModuleId) return m;
          return {
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === editingLesson.lesson.id
                ? {
                    ...l,
                    title: lessonForm.title,
                    duration: lessonForm.duration,
                    order: lessonForm.order,
                    description: lessonForm.description,
                    videoDriveId: lessonForm.videoDriveId || l.videoDriveId,
                    thumbnailUrl: lessonForm.thumbnailUrl || l.thumbnailUrl,
                  }
                : l
            ),
          };
        })
      );
    } else {
      // Create new lesson in this module
      const newLes: Lesson = {
        id: `les-${Date.now()}`,
        title: lessonForm.title,
        duration: lessonForm.duration,
        order: lessonForm.order,
        description: lessonForm.description,
        videoDriveId: lessonForm.videoDriveId || '1-0TwN8EfD_5UMGbKhs4G2wnC5qGsiOyw',
        thumbnailUrl: lessonForm.thumbnailUrl,
      };

      setModules((prev) =>
        prev.map((m) => {
          if (m.id !== targetModuleId) return m;
          return {
            ...m,
            lessons: [...(m.lessons || []), newLes],
          };
        })
      );
    }

    setShowLessonModal(null);
    setEditingLesson(null);
    setLessonForm({ title: '', duration: '10:00', order: '1.1', description: '', videoDriveId: '', thumbnailUrl: '' });
  };

  // Attach Google Drive Video
  const handleAttachVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAttachVideoModal) return;

    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) =>
          l.id === showAttachVideoModal.id
            ? { ...l, videoDriveId: videoForm.driveFileId, duration: videoForm.duration }
            : l
        ),
      }))
    );

    setShowAttachVideoModal(null);
  };

  // Delete Lesson
  const handleDeleteLesson = (modId: string, lesId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        return {
          ...m,
          lessons: m.lessons.filter((l) => l.id !== lesId),
        };
      })
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
              Curriculum, Modules &amp; Lessons Manager
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Click any module to view, add, or edit attached Video Lessons, Google Drive files, and User Manual topics.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingModule(null);
              setModuleForm({ moduleNumber: `Module 0${modules.length + 1}`, title: '', description: '' });
              setShowModuleModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1266D5]/30 flex items-center gap-2 transition-all"
          >
            <PlusCircle size={16} />
            <span>Add New Module</span>
          </button>
        </div>

        {/* System Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DCE6F1]">
          {SYSTEMS_DATA.map((sys) => (
            <button
              key={sys.id}
              onClick={() => setSelectedSystem(sys.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedSystem === sys.id
                  ? 'bg-[#1266D5] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:text-[#082B4C]'
              }`}
            >
              {sys.name}
            </button>
          ))}
        </div>

        {/* Interactive Expandable Modules & Lessons List */}
        <div className="space-y-4">
          {modules.map((m, mIdx) => {
            const isExpanded = expandedModules[m.id] ?? false;
            const lessonCount = m.lessons?.length || 0;

            return (
              <div
                key={m.id || mIdx}
                className="bg-white rounded-2xl border border-[#DCE6F1] shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Module Bar Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between bg-[#F8FAFC] border-b border-[#E2E8F0] gap-4">
                  <button
                    onClick={() => toggleExpand(m.id)}
                    className="flex items-center gap-3.5 text-left flex-1 min-w-0 group"
                  >
                    <div className="p-1 rounded-lg text-[#64748B] group-hover:bg-[#E2E8F0] transition-colors">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>

                    <span className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1266D5] font-black text-xs flex items-center justify-center shrink-0">
                      0{mIdx + 1}
                    </span>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#082B4C] text-sm sm:text-base group-hover:text-[#1266D5] transition-colors truncate">
                          {m.moduleNumber} – {m.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-[#16A34A] shrink-0">
                          Published
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {lessonCount} Learning Lessons &bull; Interactive Manuals Attached
                      </p>
                    </div>
                  </button>

                  {/* Actions for Module */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setShowLessonModal(m.id);
                        setEditingLesson(null);
                        setLessonForm({
                          title: '',
                          duration: '10:00',
                          order: `${mIdx + 1}.${lessonCount + 1}`,
                          description: '',
                          videoDriveId: '',
                          thumbnailUrl: '',
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#1266D5] hover:bg-[#0D55B8] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      title="Add a lesson under this module"
                    >
                      <Plus size={14} />
                      <span className="hidden sm:inline">Add Lesson</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingModule(m);
                        setModuleForm({
                          moduleNumber: m.moduleNumber,
                          title: m.title,
                          description: m.description || '',
                        });
                        setShowModuleModal(true);
                      }}
                      className="p-1.5 rounded-lg border border-[#DCE6F1] text-[#64748B] hover:text-[#1266D5] hover:bg-white"
                      title="Edit Module Details"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded Lessons Content Inside Module */}
                {isExpanded && (
                  <div className="divide-y divide-[#F1F5F9] bg-white">
                    {m.lessons && m.lessons.length > 0 ? (
                      m.lessons.map((les, lIdx) => (
                        <div
                          key={les.id || lIdx}
                          className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors"
                        >
                          {/* Lesson Info */}
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1266D5] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                              <PlayCircle size={20} />
                            </div>

                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-[13.5px] font-bold text-[#142B45] truncate">
                                  {les.title}
                                </h4>
                                {les.videoDriveId && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-green-50 text-green-700 border border-green-200">
                                    <Video size={10} /> Drive Video
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-[#64748B] mt-1 font-medium">
                                <span className="flex items-center gap-1">
                                  <Clock size={12} /> {les.duration || '10:00'}
                                </span>
                                <span>&bull;</span>
                                <span className="truncate max-w-sm">
                                  {les.description || 'Step-by-step instructions available in portal'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Lesson Action Controls */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            {/* Attach / View Video */}
                            <button
                              onClick={() => {
                                setShowAttachVideoModal(les);
                                setVideoForm({
                                  driveFileId: les.videoDriveId || '1-0TwN8EfD_5UMGbKhs4G2wnC5qGsiOyw',
                                  duration: les.duration || '12:30',
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-[#DCE6F1] text-[11px] font-semibold text-[#142B45] hover:border-[#1266D5] hover:text-[#1266D5] flex items-center gap-1 bg-white"
                              title="Attach or replace Google Drive video file"
                            >
                              <Video size={13} className="text-[#1266D5]" />
                              <span>{les.videoDriveId ? 'Edit Video' : 'Add Video'}</span>
                            </button>

                            {/* Edit Manual Content */}
                            <Link
                              href={`/admin/content?lessonId=${les.id || les.slug}`}
                              className="px-2.5 py-1.5 rounded-lg border border-[#DCE6F1] text-[11px] font-semibold text-[#142B45] hover:border-purple-600 hover:text-purple-600 flex items-center gap-1 bg-white"
                              title="Edit User Manual text & screenshots"
                            >
                              <FileText size={13} className="text-purple-600" />
                              <span>Manual &amp; Steps</span>
                            </Link>

                            {/* View Live on Learner Portal */}
                            <Link
                              href={`/systems/${selectedSystem}/lessons/${les.id || les.slug || 'cargo-id-gen'}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-[#DCE6F1] text-[#64748B] hover:text-[#1266D5] hover:bg-blue-50"
                              title="Open live learner view"
                            >
                              <ExternalLink size={14} />
                            </Link>

                            {/* Edit Lesson Metadata */}
                            <button
                              onClick={() => {
                                setEditingLesson({ moduleId: m.id, lesson: les });
                                setLessonForm({
                                  title: les.title,
                                  duration: les.duration || '10:00',
                                  order: les.order || '1.1',
                                  description: les.description || '',
                                  videoDriveId: les.videoDriveId || '',
                                  thumbnailUrl: les.thumbnailUrl || '',
                                });
                              }}
                              className="p-1.5 rounded-lg border border-[#DCE6F1] text-[#64748B] hover:text-[#1266D5] hover:bg-white"
                              title="Edit Title & Description"
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Delete Lesson */}
                            <button
                              onClick={() => handleDeleteLesson(m.id, les.id)}
                              className="p-1.5 rounded-lg border border-[#DCE6F1] text-[#64748B] hover:text-red-600 hover:bg-red-50"
                              title="Delete Lesson"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-[#64748B]">
                        <p>No lessons added to this module yet.</p>
                        <button
                          onClick={() => {
                            setShowLessonModal(m.id);
                            setEditingLesson(null);
                            setLessonForm({
                              title: '',
                              duration: '10:00',
                              order: `${mIdx + 1}.1`,
                              description: '',
                              videoDriveId: '',
                              thumbnailUrl: '',
                            });
                          }}
                          className="mt-2 text-xs font-bold text-[#1266D5] hover:underline"
                        >
                          + Click here to add the first lesson
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* MODAL 1: CREATE / EDIT MODULE                            */}
        {/* ======================================================== */}
        {showModuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE6F1]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-base font-bold text-[#082B4C]">
                  {editingModule ? 'Edit Module' : `Add Module to ${selectedSystem.toUpperCase()}`}
                </h3>
                <button onClick={() => setShowModuleModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleModuleSubmit} className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Module Number *</label>
                  <input
                    required
                    value={moduleForm.moduleNumber}
                    onChange={(e) => setModuleForm({ ...moduleForm, moduleNumber: e.target.value })}
                    placeholder="e.g. Module 06"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Module Title *</label>
                  <input
                    required
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    placeholder="e.g. Terminal Inventory &amp; Gate Pass"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    placeholder="Overview of operational procedures covered in this module"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setShowModuleModal(false)}
                    className="px-4 py-2 border rounded-lg font-bold text-[#64748B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1266D5] text-white rounded-lg font-bold hover:bg-[#0D55B8]"
                  >
                    Save Module
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: ADD / EDIT LESSON                               */}
        {/* ======================================================== */}
        {(showLessonModal || editingLesson) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DCE6F1]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-base font-bold text-[#082B4C]">
                  {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                </h3>
                <button
                  onClick={() => {
                    setShowLessonModal(null);
                    setEditingLesson(null);
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleLessonSubmit} className="space-y-3 mt-4 text-xs">
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Lesson Title *</label>
                  <input
                    required
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="e.g. 4.3 Discharging Cargo Plan to Yard"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Duration (MM:SS) *</label>
                    <input
                      required
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                      placeholder="12:30"
                      className="w-full border border-[#DCE6F1] rounded-lg p-2.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Order Index</label>
                    <input
                      value={lessonForm.order}
                      onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })}
                      placeholder="4.3"
                      className="w-full border border-[#DCE6F1] rounded-lg p-2.5 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#142B45] block mb-1">
                    Google Drive Video File ID (or paste full link)
                  </label>
                  <input
                    value={lessonForm.videoDriveId}
                    onChange={(e) => {
                      let val = e.target.value.trim();
                      // Auto extract ID if full drive link pasted
                      const match = val.match(/folders\/([a-zA-Z0-9_-]+)/) || val.match(/d\/([a-zA-Z0-9_-]+)/);
                      if (match) val = match[1];
                      setLessonForm({ ...lessonForm, videoDriveId: val });
                    }}
                    placeholder="e.g. 1-0TwN8EfD_5UMGbKhs4G2wnC5qGsiOyw"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5 font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-[#64748B] mt-0.5 block">
                    Saved directly in your configured &quot;HIPG Learning Videos&quot; Drive storage.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Description / Summary</label>
                  <textarea
                    rows={3}
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    placeholder="Short description of operational steps demonstrated in this lesson"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLessonModal(null);
                      setEditingLesson(null);
                    }}
                    className="px-4 py-2 border rounded-lg font-bold text-[#64748B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1266D5] text-white rounded-lg font-bold hover:bg-[#0D55B8]"
                  >
                    Save Lesson
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3: ATTACH / EDIT GOOGLE DRIVE VIDEO                */}
        {/* ======================================================== */}
        {showAttachVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE6F1]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div>
                  <h3 className="text-base font-bold text-[#082B4C]">Attach Google Drive Video</h3>
                  <p className="text-[11px] text-[#64748B] truncate max-w-xs">{showAttachVideoModal.title}</p>
                </div>
                <button onClick={() => setShowAttachVideoModal(null)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAttachVideoSubmit} className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">
                    Google Drive File ID or Shareable URL *
                  </label>
                  <input
                    required
                    value={videoForm.driveFileId}
                    onChange={(e) => {
                      let val = e.target.value.trim();
                      const match = val.match(/file\/d\/([a-zA-Z0-9_-]+)/) || val.match(/folders\/([a-zA-Z0-9_-]+)/);
                      if (match) val = match[1];
                      setVideoForm({ ...videoForm, driveFileId: val });
                    }}
                    placeholder="e.g. 1-0TwN8EfD_5UMGbKhs4G2wnC5qGsiOyw"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Video Duration (MM:SS)</label>
                  <input
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                    placeholder="12:30"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5 font-mono"
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-[#082B4C] space-y-1">
                  <span className="font-bold block flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-[#1266D5]" /> Protected Internal Playback
                  </span>
                  <p className="text-[#64748B]">
                    Employees will watch this via authenticated streaming without download buttons.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setShowAttachVideoModal(null)}
                    className="px-4 py-2 border rounded-lg font-bold text-[#64748B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1266D5] text-white rounded-lg font-bold hover:bg-[#0D55B8]"
                  >
                    Save Video Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

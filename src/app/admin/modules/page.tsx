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
  Clock,
  Plus,
  CheckCircle2,
  ExternalLink,
  Upload,
  Link2,
  Save,
  Folder,
  Layers,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  Loader2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SYSTEMS_DATA, BTOS_MODULES, MANUAL_CARGO_ID } from '@/data/portalData';

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
  systemId?: string;
  moduleId?: string;
  title: string;
  slug?: string;
  duration?: string;
  order?: string;
  description?: string;
  videoDriveId?: string | null;
  videoUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  isCompleted?: boolean;
  manualContent?: string;
  manualSteps?: ManualStep[];
}

interface ModuleItem {
  id: string;
  _id?: string;
  systemId?: string;
  moduleNumber: string;
  title: string;
  slug?: string;
  description?: string;
  lessons: Lesson[];
  isPublished?: boolean;
}

export default function UnifiedCurriculumManagerPage() {
  const [selectedSystem, setSelectedSystem] = useState('btos');
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-01': true,
    'mod-04': true,
  });

  // Modal / Drawer states
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);

  // Unified Lesson Editor Modal (Lesson Info + Google Drive Video + Step-by-Step Manual)
  const [activeEditor, setActiveEditor] = useState<{
    moduleId: string;
    moduleTitle: string;
    lesson: Lesson;
    isNew: boolean;
  } | null>(null);

  const [activeEditorTab, setActiveEditorTab] = useState<'info' | 'video' | 'manual'>('video');
  const [uploadingDriveFile, setUploadingDriveFile] = useState(false);
  const [uploadingStepImageIdx, setUploadingStepImageIdx] = useState<number | null>(null);
  const [statusAlert, setStatusAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);

  // Form state for current lesson being edited
  const [lessonFormData, setLessonFormData] = useState<{
    title: string;
    duration: string;
    order: string;
    description: string;
    videoDriveId: string;
    manualContent: string;
    manualSteps: ManualStep[];
  }>({
    title: '',
    duration: '12:30',
    order: '1.1',
    description: '',
    videoDriveId: '',
    manualContent: '',
    manualSteps: [],
  });

  const [moduleForm, setModuleForm] = useState({
    moduleNumber: 'Module 06',
    title: '',
    description: '',
  });

  // Fetch modules for selected system from API
  const fetchModules = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [selectedSystem]);

  const toggleExpand = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Open Unified Editor for a lesson
  const openLessonEditor = (moduleId: string, moduleTitle: string, lesson?: Lesson) => {
    if (lesson) {
      // Edit existing lesson
      setActiveEditor({
        moduleId,
        moduleTitle,
        lesson,
        isNew: false,
      });
      setLessonFormData({
        title: lesson.title,
        duration: lesson.duration || '12:30',
        order: lesson.order || '1.1',
        description: lesson.description || '',
        videoDriveId: lesson.videoDriveId || '',
        manualContent:
          lesson.manualContent ||
          'Complete terminal operating guide and step-by-step procedures for Hambantota International Port employees.',
        manualSteps:
          lesson.manualSteps && lesson.manualSteps.length > 0
            ? lesson.manualSteps
            : lesson.id === 'cargo-id-gen'
            ? (MANUAL_CARGO_ID[4].steps as any)
            : [
                {
                  stepNumber: 1,
                  title: 'Step 1: Access System Menu',
                  instruction: 'Login to the operational portal and navigate to the module screen.',
                },
                {
                  stepNumber: 2,
                  title: 'Step 2: Enter Transaction Details',
                  instruction: 'Verify data inputs, confirm operational parameters, and click Submit.',
                },
              ],
      });
    } else {
      // Create new lesson in this module
      const targetMod = modules.find((m) => m.id === moduleId);
      const nextOrder = `${(targetMod?.lessons?.length || 0) + 1}.1`;

      const newLessonObj: Lesson = {
        id: `les-${Date.now()}`,
        title: '',
        duration: '10:00',
        order: nextOrder,
        description: '',
        videoDriveId: '',
      };

      setActiveEditor({
        moduleId,
        moduleTitle,
        lesson: newLessonObj,
        isNew: true,
      });

      setLessonFormData({
        title: '',
        duration: '10:00',
        order: nextOrder,
        description: '',
        videoDriveId: '',
        manualContent: 'Enter standard operating instructions and guidelines here.',
        manualSteps: [
          {
            stepNumber: 1,
            title: 'Step 1: Open System Menu',
            instruction: 'Open the operational subsystem and select the target procedure.',
          },
          {
            stepNumber: 2,
            title: 'Step 2: Confirm Information & Save',
            instruction: 'Enter required fields and click Submit to complete transaction.',
          },
        ],
      });
    }
    setActiveEditorTab('video');
  };

  // Save Lesson from Unified Editor to MongoDB database
  const handleSaveLesson = async () => {
    if (!activeEditor || !lessonFormData.title.trim()) {
      alert('Please enter a lesson title');
      return;
    }

    setSavingLesson(true);
    const lessonId = activeEditor.lesson.id || activeEditor.lesson._id || `les-${Date.now()}`;
    const slug = lessonFormData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const lessonPayload = {
      id: lessonId,
      systemId: selectedSystem,
      moduleId: activeEditor.moduleId,
      title: lessonFormData.title,
      slug,
      duration: lessonFormData.duration,
      order: lessonFormData.order,
      description: lessonFormData.description,
      videoDriveId: lessonFormData.videoDriveId || undefined,
      manualContent: lessonFormData.manualContent,
      manualSteps: lessonFormData.manualSteps,
      isPublished: true,
    };

    try {
      if (activeEditor.isNew) {
        // Create in DB
        await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonPayload),
        });
      } else {
        // Update in DB
        await fetch(`/api/lessons/${lessonId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonPayload),
        });
      }

      // Update local state immediately
      const updatedLesson: Lesson = {
        ...activeEditor.lesson,
        ...lessonPayload,
      };

      setModules((prev) =>
        prev.map((m) => {
          if (m.id !== activeEditor.moduleId) return m;
          if (activeEditor.isNew) {
            return { ...m, lessons: [...(m.lessons || []), updatedLesson] };
          } else {
            return {
              ...m,
              lessons: (m.lessons || []).map((l) =>
                l.id === updatedLesson.id || l._id === updatedLesson._id ? updatedLesson : l
              ),
            };
          }
        })
      );

      setStatusAlert({
        message: `Lesson "${lessonFormData.title}" successfully saved & linked!`,
        type: 'success',
      });
      setTimeout(() => setStatusAlert(null), 4000);
      setActiveEditor(null);
    } catch (err) {
      console.error('Failed to save lesson:', err);
      // Fallback local update
      const updatedLesson: Lesson = {
        ...activeEditor.lesson,
        ...lessonPayload,
      };
      setModules((prev) =>
        prev.map((m) => {
          if (m.id !== activeEditor.moduleId) return m;
          if (activeEditor.isNew) {
            return { ...m, lessons: [...(m.lessons || []), updatedLesson] };
          } else {
            return {
              ...m,
              lessons: (m.lessons || []).map((l) => (l.id === updatedLesson.id ? updatedLesson : l)),
            };
          }
        })
      );
      setStatusAlert({
        message: `Lesson saved locally!`,
        type: 'success',
      });
      setTimeout(() => setStatusAlert(null), 4000);
      setActiveEditor(null);
    } finally {
      setSavingLesson(false);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (moduleId: string, les: Lesson) => {
    if (!confirm(`Are you sure you want to delete lesson "${les.title}"?`)) return;

    try {
      const lesId = les.id || les._id;
      if (lesId) {
        await fetch(`/api/lessons/${lesId}`, { method: 'DELETE' });
      }
    } catch {
      // ignore
    }

    setModules((prev) =>
      prev.map((mod) =>
        mod.id !== moduleId
          ? mod
          : { ...mod, lessons: (mod.lessons || []).filter((l) => l.id !== les.id && l._id !== les._id) }
      )
    );

    setStatusAlert({ message: `Lesson "${les.title}" deleted.`, type: 'success' });
    setTimeout(() => setStatusAlert(null), 3000);
  };

  // Upload video directly into Google Drive System/Module folder
  const handleDirectDriveVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeEditor) return;

    setUploadingDriveFile(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('systemName', selectedSystem.toUpperCase());
    formData.append('moduleName', activeEditor.moduleTitle);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

    try {
      const res = await fetch('/api/admin/drive/module-upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.fileId) {
        setLessonFormData((prev) => ({
          ...prev,
          videoDriveId: data.fileId,
        }));
        setStatusAlert({
          message: `Video uploaded directly to Google Drive Folder: "${selectedSystem.toUpperCase()} / ${activeEditor.moduleTitle}"!`,
          type: 'success',
        });
        setTimeout(() => setStatusAlert(null), 5000);
      } else {
        alert(data.error || 'Drive video upload error');
      }
    } catch {
      alert('Failed to connect to Google Drive API');
    } finally {
      setUploadingDriveFile(false);
    }
  };

  // Upload step screenshot directly into Google Drive under module folder
  const handleStepImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeEditor) return;

    setUploadingStepImageIdx(idx);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('systemName', selectedSystem.toUpperCase());
    formData.append('moduleName', activeEditor.moduleTitle);
    formData.append('title', `${lessonFormData.title || 'Step'} - Step ${idx + 1}`);

    try {
      const res = await fetch('/api/admin/drive/module-upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.fileId) {
        const streamUrl = `/api/video/stream/${data.fileId}`;
        setLessonFormData((prev) => {
          const steps = [...prev.manualSteps];
          steps[idx] = {
            ...steps[idx],
            imageUrl: streamUrl,
            imageDriveId: data.fileId,
          };
          return { ...prev, manualSteps: steps };
        });
        setStatusAlert({
          message: `Screenshot for Step ${idx + 1} saved to Google Drive Module folder!`,
          type: 'success',
        });
        setTimeout(() => setStatusAlert(null), 4000);
      } else {
        alert(data.error || 'Failed to upload screenshot');
      }
    } catch {
      alert('Failed to upload image to Google Drive');
    } finally {
      setUploadingStepImageIdx(null);
    }
  };

  // Step instruction helpers
  const handleUpdateStepTitle = (idx: number, title: string) => {
    setLessonFormData((prev) => {
      const steps = [...prev.manualSteps];
      steps[idx] = { ...steps[idx], title };
      return { ...prev, manualSteps: steps };
    });
  };

  const handleUpdateStepInstruction = (idx: number, text: string) => {
    setLessonFormData((prev) => {
      const steps = [...prev.manualSteps];
      steps[idx] = { ...steps[idx], instruction: text };
      return { ...prev, manualSteps: steps };
    });
  };

  const handleUpdateStepHighlight = (idx: number, highlight: string) => {
    setLessonFormData((prev) => {
      const steps = [...prev.manualSteps];
      steps[idx] = { ...steps[idx], highlightText: highlight };
      return { ...prev, manualSteps: steps };
    });
  };

  const handleRemoveStepImage = (idx: number) => {
    setLessonFormData((prev) => {
      const steps = [...prev.manualSteps];
      steps[idx] = { ...steps[idx], imageUrl: undefined, imageDriveId: undefined };
      return { ...prev, manualSteps: steps };
    });
  };

  const handleAddManualStep = () => {
    setLessonFormData((prev) => {
      const steps = [...prev.manualSteps];
      const nextNum = steps.length + 1;
      steps.push({
        stepNumber: nextNum,
        title: `Step ${nextNum}: New Procedure`,
        instruction: 'Enter step instruction details here.',
      });
      return { ...prev, manualSteps: steps };
    });
  };

  const handleRemoveStep = (idx: number) => {
    setLessonFormData((prev) => {
      const steps = prev.manualSteps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 }));
      return { ...prev, manualSteps: steps };
    });
  };

  // Add / Edit Module
  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleForm.title.trim()) return;

    const slug = moduleForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingModule) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === editingModule.id
            ? { ...m, moduleNumber: moduleForm.moduleNumber, title: moduleForm.title, description: moduleForm.description }
            : m
        )
      );
      setStatusAlert({ message: `Module "${moduleForm.title}" updated.`, type: 'success' });
    } else {
      const newMod: ModuleItem = {
        id: `mod-${Date.now()}`,
        systemId: selectedSystem,
        moduleNumber: moduleForm.moduleNumber,
        title: moduleForm.title,
        slug,
        description: moduleForm.description,
        lessons: [],
        isPublished: true,
      };

      try {
        await fetch(`/api/systems/${selectedSystem}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMod),
        });
      } catch {
        // local fallback
      }

      setModules((prev) => [...prev, newMod]);
      setExpandedModules((prev) => ({ ...prev, [newMod.id]: true }));
      setStatusAlert({ message: `Module "${moduleForm.title}" created!`, type: 'success' });
    }
    setTimeout(() => setStatusAlert(null), 3000);
    setShowModuleModal(false);
    setEditingModule(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
              Module &amp; Curriculum Management
            </h1>
            <p className="text-xs text-[#64748B] mt-1 font-medium">
              Organize topics into structured learning modules for each operational system. Click any module to manage lessons, videos, and step-by-step manuals.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingModule(null);
              setModuleForm({ moduleNumber: `Module 0${modules.length + 1}`, title: '', description: '' });
              setShowModuleModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1266D5]/30 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>+ Add Module</span>
          </button>
        </div>

        {statusAlert && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-sm border ${
              statusAlert.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <CheckCircle2 size={16} className="text-green-600 shrink-0" />
            <span>{statusAlert.message}</span>
          </div>
        )}

        {/* System Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DCE6F1]">
          {SYSTEMS_DATA.map((sys) => (
            <button
              key={sys.id}
              onClick={() => setSelectedSystem(sys.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedSystem === sys.id
                  ? 'bg-[#1266D5] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:text-[#082B4C]'
              }`}
            >
              {sys.name}
            </button>
          ))}
        </div>

        {/* Modules Hierarchy View */}
        <div className="space-y-4">
          {modules.map((m, mIdx) => {
            const isExpanded = expandedModules[m.id] ?? false;
            const lessonCount = m.lessons?.length || 0;

            return (
              <div
                key={m.id || mIdx}
                className="bg-white rounded-2xl border border-[#DCE6F1] shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Module Bar Header (Clickable row) */}
                <div className="p-4 sm:p-5 flex items-center justify-between bg-[#F8FAFC] border-b border-[#E2E8F0] gap-4">
                  <button
                    onClick={() => toggleExpand(m.id)}
                    className="flex items-center gap-3.5 text-left flex-1 min-w-0 group cursor-pointer"
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
                      <p className="text-[11px] text-[#64748B] mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{lessonCount} Learning Lessons</span>
                        <span>&bull;</span>
                        <span className="font-mono text-[#082B4C] text-[10.5px]">
                          📁 Drive: HIPG Learning Videos/{selectedSystem.toUpperCase()}/{m.title}
                        </span>
                      </p>
                    </div>
                  </button>

                  {/* Actions for Module */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openLessonEditor(m.id, m.title)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Add a lesson under this module"
                    >
                      <Plus size={14} />
                      <span>+ Add Lesson</span>
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
                      className="p-1.5 rounded-lg border border-[#DCE6F1] text-[#64748B] hover:text-[#1266D5] hover:bg-white cursor-pointer"
                      title="Edit Module Details"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded Lesson Management inside this Module */}
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
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1266D5] flex items-center justify-center shrink-0">
                              <PlayCircle size={20} />
                            </div>

                            <div className="truncate">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-[13.5px] font-bold text-[#142B45] truncate">
                                  {les.order ? `${les.order} ` : ''}{les.title}
                                </h4>
                                {les.videoDriveId ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold bg-green-50 text-green-700 border border-green-200 font-mono">
                                    <Video size={10} /> Drive Video Attached
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-[#64748B]">
                                    No Video
                                  </span>
                                )}
                                {les.manualSteps && les.manualSteps.length > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold bg-blue-50 text-[#1266D5] border border-blue-200">
                                    <FileText size={10} /> {les.manualSteps.length} Steps
                                    {les.manualSteps.some((s) => s.imageUrl) && (
                                      <span className="ml-0.5 text-blue-600 font-semibold">(Screenshots)</span>
                                    )}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-[#64748B] mt-1 font-medium">
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock size={12} /> {les.duration || '10:00'}
                                </span>
                                <span>&bull;</span>
                                <span className="truncate max-w-sm">
                                  {les.description || 'Instruction manual & video tutorial ready'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Lesson Action Controls */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            {/* Complete Edit Button */}
                            <button
                              onClick={() => openLessonEditor(m.id, m.title, les)}
                              className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#1266D5] hover:bg-[#1266D5] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Edit all components (Video, Manual, Steps, Info)"
                            >
                              <Edit2 size={13} />
                              <span>Edit Lesson &amp; Content</span>
                            </button>

                            {/* View Live on Learner Portal */}
                            <Link
                              href={`/systems/${selectedSystem}/lessons/${les.id || les.slug || 'cargo-id-gen'}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-[#DCE6F1] text-[#64748B] hover:text-[#1266D5] hover:bg-blue-50 transition-colors"
                              title="Open live learner view in new tab"
                            >
                              <ExternalLink size={14} />
                            </Link>

                            {/* Delete Lesson */}
                            <button
                              onClick={() => handleDeleteLesson(m.id, les)}
                              className="p-1.5 rounded-lg border border-[#DCE6F1] text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Lesson"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-[#64748B] space-y-2">
                        <p>No lessons added to this module yet.</p>
                        <button
                          onClick={() => openLessonEditor(m.id, m.title)}
                          className="px-4 py-2 bg-[#1266D5] text-white rounded-xl font-bold hover:bg-[#0D55B8] inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus size={14} /> Add First Lesson to this Module
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* UNIFIED LESSON & CONTENT EDITOR MODAL                                      */}
        {/* All in one place: Info, Google Drive Video, Step-by-Step Manual & Images  */}
        {/* ========================================================================= */}
        {activeEditor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-4xl w-full h-[92vh] shadow-2xl border border-[#DCE6F1] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-5 sm:px-7 bg-[#062746] text-white flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8] flex items-center gap-1.5">
                    <Folder size={12} /> {selectedSystem.toUpperCase()} &bull; {activeEditor.moduleTitle}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black mt-0.5 truncate max-w-xl">
                    {activeEditor.isNew ? 'Add New Lesson to Module' : `Edit: ${lessonFormData.title || 'Lesson Content'}`}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveEditor(null)}
                  className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Editor Tabs: Video, Manual Steps & Screenshots, Lesson Info */}
              <div className="flex items-center px-6 border-b border-[#DCE6F1] bg-[#F8FAFC] gap-6 text-xs font-bold shrink-0">
                <button
                  onClick={() => setActiveEditorTab('video')}
                  className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                    activeEditorTab === 'video'
                      ? 'border-[#1266D5] text-[#1266D5]'
                      : 'border-transparent text-[#64748B] hover:text-[#082B4C]'
                  }`}
                >
                  <Video size={16} />
                  <span>Google Drive Video</span>
                  {lessonFormData.videoDriveId && (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </button>

                <button
                  onClick={() => setActiveEditorTab('manual')}
                  className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                    activeEditorTab === 'manual'
                      ? 'border-[#1266D5] text-[#1266D5]'
                      : 'border-transparent text-[#64748B] hover:text-[#082B4C]'
                  }`}
                >
                  <FileText size={16} />
                  <span>Step-by-Step Manual &amp; Screenshots</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-[#1266D5]">
                    {lessonFormData.manualSteps.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveEditorTab('info')}
                  className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                    activeEditorTab === 'info'
                      ? 'border-[#1266D5] text-[#1266D5]'
                      : 'border-transparent text-[#64748B] hover:text-[#082B4C]'
                  }`}
                >
                  <FolderTree size={16} />
                  <span>Overview &amp; Details</span>
                </button>
              </div>

              {/* Tab Contents (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 text-xs">
                {/* Basic Title & Duration Input (Always at top of editor) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pb-4 border-b border-[#F1F5F9]">
                  <div className="sm:col-span-8">
                    <label className="font-bold text-[#142B45] block mb-1">Lesson Title *</label>
                    <input
                      required
                      value={lessonFormData.title}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                      placeholder="e.g. 4.2 Cargo ID Generation"
                      className="w-full border border-[#DCE6F1] rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1266D5]/30 focus:border-[#1266D5]"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="font-bold text-[#142B45] block mb-1">Duration (MM:SS) *</label>
                    <input
                      required
                      value={lessonFormData.duration}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })}
                      placeholder="12:30"
                      className="w-full border border-[#DCE6F1] rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1266D5]/30 focus:border-[#1266D5]"
                    />
                  </div>
                </div>

                {/* TAB 1: GOOGLE DRIVE VIDEO */}
                {activeEditorTab === 'video' && (
                  <div className="space-y-5">
                    {/* Folder Structure Indicator */}
                    <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl flex items-start gap-3">
                      <Folder size={20} className="text-[#1266D5] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#082B4C] block font-bold">Google Drive Storage Destination:</strong>
                        <p className="text-[11.5px] text-[#1E40AF] mt-0.5 font-mono">
                          📁 HIPG Learning Videos &gt; 📁 {selectedSystem.toUpperCase()} &gt; 📁 {activeEditor.moduleTitle}
                        </p>
                        <span className="text-[11px] text-[#64748B] mt-1 block">
                          Videos uploaded here will automatically create subfolders and stay organized by module.
                        </span>
                      </div>
                    </div>

                    {/* Direct Upload to Google Drive */}
                    <div className="border-2 border-dashed border-[#CBD5E1] rounded-2xl p-6 text-center space-y-3 bg-[#F8FAFC]">
                      <Video size={36} className="mx-auto text-[#1266D5]" />
                      <div>
                        <h4 className="font-bold text-[#082B4C] text-sm">Upload Video to this Module</h4>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Directly uploads into Google Drive folder: <strong>{activeEditor.moduleTitle}</strong>
                        </p>
                      </div>

                      <label className="cursor-pointer px-5 py-2.5 bg-[#1266D5] hover:bg-[#0D55B8] text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-colors">
                        {uploadingDriveFile ? <Loader2 size={16} className="animate-spin" /> : <Upload size={14} />}
                        <span>{uploadingDriveFile ? 'Uploading to Drive Module Folder...' : 'Select MP4 Video File'}</span>
                        <input
                          type="file"
                          accept="video/mp4,video/*"
                          onChange={handleDirectDriveVideoUpload}
                          disabled={uploadingDriveFile}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Or Paste Drive File ID / URL */}
                    <div className="space-y-1.5 pt-2">
                      <label className="font-bold text-[#142B45] block">
                        Google Drive File ID or Shareable URL
                      </label>
                      <div className="relative">
                        <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                          value={lessonFormData.videoDriveId}
                          onChange={(e) => {
                            let val = e.target.value.trim();
                            const match = val.match(/file\/d\/([a-zA-Z0-9_-]+)/) || val.match(/folders\/([a-zA-Z0-9_-]+)/);
                            if (match) val = match[1];
                            setLessonFormData({ ...lessonFormData, videoDriveId: val });
                          }}
                          placeholder="e.g. 1-0TwN8EfD_5UMGbKhs4G2wnC5qGsiOyw or full Drive Link"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DCE6F1] rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#1266D5]/30 focus:border-[#1266D5]"
                        />
                      </div>
                    </div>

                    {/* Live In-Modal Video Preview Player */}
                    {lessonFormData.videoDriveId && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-[#082B4C] flex items-center gap-1.5 text-xs">
                            <Eye size={14} className="text-[#1266D5]" />
                            <span>In-App Live Video Player Preview</span>
                          </label>
                          <span className="text-[10.5px] font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                            ID: {lessonFormData.videoDriveId}
                          </span>
                        </div>
                        <div className="rounded-2xl overflow-hidden bg-black aspect-video max-h-60 border border-[#CBD5E1] flex items-center justify-center">
                          <video
                            controls
                            src={`/api/video/stream/${lessonFormData.videoDriveId}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: STEP-BY-STEP USER MANUAL & SCREENSHOTS */}
                {activeEditorTab === 'manual' && (
                  <div className="space-y-6">
                    {/* General Section Description */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-[#142B45] block">Manual Overview &amp; Operating Guidelines</label>
                      <textarea
                        rows={2}
                        value={lessonFormData.manualContent}
                        onChange={(e) => setLessonFormData({ ...lessonFormData, manualContent: e.target.value })}
                        placeholder="Explain prerequisites, system roles, and precautions before starting this procedure"
                        className="w-full border border-[#DCE6F1] rounded-xl p-3 text-xs leading-relaxed"
                      />
                    </div>

                    {/* Step-by-Step Instruction Cards */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1">
                        <div>
                          <h4 className="font-bold text-[#082B4C] text-sm">Step-by-Step Instructions &amp; Screenshots</h4>
                          <p className="text-[11px] text-[#64748B]">
                            Organized procedure steps with screenshots auto-saved into Google Drive module folder
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddManualStep}
                          className="px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] text-[#1266D5] border border-[#BFDBFE] hover:bg-[#1266D5] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus size={14} /> Add Step
                        </button>
                      </div>

                      <div className="space-y-4">
                        {lessonFormData.manualSteps.map((st, idx) => (
                          <div
                            key={idx}
                            className="p-4 sm:p-5 border border-[#DCE6F1] rounded-2xl bg-[#F8FAFC] space-y-3.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-3 py-1 rounded-lg bg-[#1266D5] text-white text-[11px] font-black">
                                Step {idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveStep(idx)}
                                className="text-[#64748B] hover:text-red-600 p-1 cursor-pointer transition-colors"
                                title="Remove this step"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {/* Step Title */}
                            <div>
                              <label className="block text-[11px] font-bold text-[#142B45] mb-1">Step Title</label>
                              <input
                                value={st.title || `Step ${idx + 1}`}
                                onChange={(e) => handleUpdateStepTitle(idx, e.target.value)}
                                placeholder="e.g. Step 1: Open Operation Menu"
                                className="w-full bg-white border border-[#CBD5E1] rounded-xl p-2.5 text-xs font-bold text-[#082B4C]"
                              />
                            </div>

                            {/* Step Description */}
                            <div>
                              <label className="block text-[11px] font-bold text-[#142B45] mb-1">Instruction Details</label>
                              <textarea
                                rows={2}
                                value={st.instruction}
                                onChange={(e) => handleUpdateStepInstruction(idx, e.target.value)}
                                placeholder="Detailed operational instruction for terminal operators"
                                className="w-full bg-white border border-[#CBD5E1] rounded-xl p-2.5 text-xs font-medium"
                              />
                            </div>

                            {/* Step Highlight / Note */}
                            <div>
                              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Important Highlight Note (Optional)</label>
                              <input
                                value={st.highlightText || ''}
                                onChange={(e) => handleUpdateStepHighlight(idx, e.target.value)}
                                placeholder="e.g. Note: Ensure previous batch has been settled before generating ID"
                                className="w-full bg-white border border-[#CBD5E1] rounded-xl p-2 text-xs"
                              />
                            </div>

                            {/* Step Screenshot / Image upload */}
                            <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-[11px] font-bold text-[#082B4C] flex items-center gap-1.5">
                                  <ImageIcon size={14} className="text-[#1266D5]" />
                                  <span>Step Screenshot / Image (Saved in Google Drive: {activeEditor.moduleTitle})</span>
                                </label>
                                {st.imageUrl && (
                                  <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                    Screenshot Attached
                                  </span>
                                )}
                              </div>

                              {st.imageUrl ? (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-xl border border-[#CBD5E1]">
                                  <div className="relative w-full sm:w-40 h-24 bg-black/5 rounded-lg overflow-hidden border border-[#CBD5E1] shrink-0">
                                    <img
                                      src={st.imageUrl}
                                      alt={`Step ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <span className="text-xs font-bold text-[#082B4C] block truncate">
                                      {st.title || `Step ${idx + 1} Screenshot`}
                                    </span>
                                    <span className="text-[10.5px] text-[#64748B] font-mono block truncate">
                                      {st.imageDriveId ? `Google Drive ID: ${st.imageDriveId}` : st.imageUrl}
                                    </span>
                                    <div className="flex items-center gap-2 pt-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveStepImage(idx)}
                                        className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg font-bold cursor-pointer transition-colors"
                                      >
                                        Remove Screenshot
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <label className="cursor-pointer px-4 py-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1266D5] rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors shrink-0">
                                    {uploadingStepImageIdx === idx ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      <Upload size={14} />
                                    )}
                                    <span>
                                      {uploadingStepImageIdx === idx
                                        ? 'Uploading to Drive...'
                                        : '+ Upload Step Screenshot to Drive'}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleStepImageUpload(idx, e)}
                                      disabled={uploadingStepImageIdx === idx}
                                      className="hidden"
                                    />
                                  </label>

                                  <span className="text-[11px] text-[#94A3B8] text-center sm:text-left font-medium">or</span>

                                  <div className="flex-1 relative">
                                    <input
                                      value={st.imageUrl || ''}
                                      onChange={(e) => {
                                        const val = e.target.value.trim();
                                        setLessonFormData((prev) => {
                                          const steps = [...prev.manualSteps];
                                          steps[idx] = { ...steps[idx], imageUrl: val };
                                          return { ...prev, manualSteps: steps };
                                        });
                                      }}
                                      placeholder="Paste Image URL or Drive File ID"
                                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-[#1266D5]"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: LESSON METADATA & OBJECTIVES */}
                {activeEditorTab === 'info' && (
                  <div className="space-y-4">
                    <div>
                      <label className="font-bold text-[#142B45] block mb-1">Description / Summary</label>
                      <textarea
                        rows={3}
                        value={lessonFormData.description}
                        onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                        placeholder="Brief summary of the lesson shown on the dashboard and system overview"
                        className="w-full border border-[#DCE6F1] rounded-xl p-3 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#142B45] block mb-1">Order Sequence (e.g. 4.2)</label>
                      <input
                        value={lessonFormData.order}
                        onChange={(e) => setLessonFormData({ ...lessonFormData, order: e.target.value })}
                        className="w-full border border-[#DCE6F1] rounded-xl p-2.5 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-4 sm:px-7 bg-[#F8FAFC] border-t border-[#DCE6F1] flex items-center justify-between shrink-0">
                <span className="text-[11px] text-[#64748B] hidden sm:inline">
                  Module: <strong>{activeEditor.moduleTitle}</strong>
                </span>

                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setActiveEditor(null)}
                    className="px-5 py-2.5 border border-[#DCE6F1] rounded-xl font-bold text-xs text-[#64748B] hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={savingLesson}
                    onClick={handleSaveLesson}
                    className="px-6 py-2.5 bg-[#1266D5] hover:bg-[#0D55B8] text-white rounded-xl font-bold text-xs shadow-md shadow-[#1266D5]/30 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {savingLesson ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    <span>{savingLesson ? 'Saving Lesson...' : 'Save & Publish Lesson'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADD / EDIT MODULE MODAL                                                   */}
        {/* ========================================================================= */}
        {showModuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE6F1]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-base font-bold text-[#082B4C]">
                  {editingModule ? 'Edit Module' : `Add Module to ${selectedSystem.toUpperCase()}`}
                </h3>
                <button
                  onClick={() => setShowModuleModal(false)}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer"
                >
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
                    placeholder="Overview of operational procedures in this module"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setShowModuleModal(false)}
                    className="px-4 py-2 border rounded-lg font-bold text-[#64748B] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1266D5] text-white rounded-lg font-bold hover:bg-[#0D55B8] cursor-pointer"
                  >
                    Save Module
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

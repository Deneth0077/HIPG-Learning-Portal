'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PlayCircle,
  PlusCircle,
  Edit2,
  Trash2,
  Video,
  FileText,
  Clock,
  CheckCircle2,
  Eye,
  X
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { BTOS_MODULES, SYSTEMS_DATA } from '@/data/portalData';

export default function LessonManagementPage() {
  const [selectedSystem, setSelectedSystem] = useState('btos');
  const [lessons, setLessons] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    duration: '10:00',
    order: '4.3',
    description: '',
    systemId: 'btos',
    moduleId: 'mod-04',
    videoDriveId: '',
  });

  const fetchLessons = async () => {
    try {
      const res = await fetch(`/api/lessons?systemId=${selectedSystem}`);
      const data = await res.json();
      if (data.lessons && data.lessons.length > 0) {
        setLessons(data.lessons);
      } else {
        const fallback = BTOS_MODULES.flatMap(m => m.lessons);
        setLessons(fallback);
      }
    } catch {
      const fallback = BTOS_MODULES.flatMap(m => m.lessons);
      setLessons(fallback);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [selectedSystem]);

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }),
      });
      setShowModal(false);
      setFormData({
        title: '',
        slug: '',
        duration: '10:00',
        order: '4.3',
        description: '',
        systemId: selectedSystem,
        moduleId: 'mod-04',
        videoDriveId: '',
      });
      fetchLessons();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
              Lesson &amp; Topic Management
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Manage video training topics, durations, user manuals, and learning objectives.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1266D5]/30 flex items-center gap-2"
          >
            <PlusCircle size={16} />
            <span>Create New Lesson</span>
          </button>
        </div>

        {/* System tabs */}
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

        {/* Lessons List Table */}
        <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#DCE6F1] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Lesson Title</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Content Components</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {lessons.map((lesson) => (
                <tr key={lesson.id || lesson._id} className="hover:bg-[#F8FAFC]">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#082B4C] text-[13px]">{lesson.title}</div>
                    <div className="text-[11px] text-[#64748B] line-clamp-1 max-w-md">{lesson.description}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-[#142B45]">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#64748B]" />
                      <span>{lesson.duration}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#1266D5] font-semibold text-[10px]">
                        <Video size={11} /> Video
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold text-[10px]">
                        <FileText size={11} /> Manual
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-[#16A34A]">
                      Published
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/systems/${selectedSystem}/lessons/${lesson.id || lesson.slug}`}
                        className="p-1.5 rounded-lg border border-[#DCE6F1] text-[#64748B] hover:text-[#1266D5]"
                        title="Preview Lesson"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/admin/content?lessonId=${lesson.id || lesson.slug}`}
                        className="p-1.5 rounded-lg border border-[#DCE6F1] text-[#64748B] hover:text-[#1266D5]"
                        title="Edit User Manual Content"
                      >
                        <Edit2 size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal: Create Lesson */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DCE6F1]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-base font-bold text-[#082B4C]">Create Lesson</h3>
                <button onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleCreateLesson} className="space-y-3 mt-4 text-xs">
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Lesson Title *</label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 4.4 Loading Cargo Plan"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Duration (MM:SS) *</label>
                    <input
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Order Index</label>
                    <input
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                      className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Google Drive Video File ID (Optional)</label>
                  <input
                    value={formData.videoDriveId}
                    onChange={(e) => setFormData({ ...formData, videoDriveId: e.target.value })}
                    placeholder="e.g. 1AbC_xyz_google_drive_file_id"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg font-bold text-[#64748B]">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#1266D5] text-white rounded-lg font-bold">Save Lesson</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Grid2X2,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Layers,
  FolderOpen,
  PlayCircle,
  FileText,
  Clock,
  ExternalLink,
  Save,
  Loader2
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SystemIcon } from '@/components/common/SystemIcon';
import { SYSTEMS_DATA } from '@/data/portalData';

interface SystemItem {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  fullName: string;
  description: string;
  iconType: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
  topicsCount?: number;
  videosCount?: number;
  manualsCount?: number;
  totalDuration?: string;
}

export default function SystemManagementPage() {
  const [systems, setSystems] = useState<SystemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState<SystemItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    fullName: string;
    description: string;
    iconType: string;
    color: string;
    topicsCount: number;
    videosCount: number;
    manualsCount: number;
    totalDuration: string;
  }>({
    name: '',
    slug: '',
    fullName: '',
    description: '',
    iconType: 'btos',
    color: '#1266D5',
    topicsCount: 12,
    videosCount: 10,
    manualsCount: 1,
    totalDuration: '3.5 hrs',
  });

  const fetchSystems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/systems');
      const data = await res.json();
      if (data.systems && data.systems.length > 0) {
        setSystems(data.systems);
      } else {
        setSystems(SYSTEMS_DATA as any);
      }
    } catch {
      setSystems(SYSTEMS_DATA as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const openCreateModal = () => {
    setEditingSystem(null);
    setFormData({
      name: '',
      slug: '',
      fullName: '',
      description: '',
      iconType: 'btos',
      color: '#1266D5',
      topicsCount: 10,
      videosCount: 8,
      manualsCount: 1,
      totalDuration: '3.0 hrs',
    });
    setShowModal(true);
  };

  const openEditModal = (sys: SystemItem) => {
    setEditingSystem(sys);
    setFormData({
      name: sys.name,
      slug: sys.slug || sys.id || sys.name.toLowerCase(),
      fullName: sys.fullName || sys.name,
      description: sys.description || '',
      iconType: sys.iconType || 'btos',
      color: sys.color || '#1266D5',
      topicsCount: sys.topicsCount ?? 12,
      videosCount: sys.videosCount ?? 10,
      manualsCount: sys.manualsCount ?? 1,
      totalDuration: sys.totalDuration || '3.5 hrs',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.fullName.trim()) {
      alert('Please fill in required fields');
      return;
    }

    setSaving(true);
    const targetSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const payload = {
      ...formData,
      slug: targetSlug,
    };

    try {
      if (editingSystem) {
        // Update existing system
        const sysId = editingSystem.slug || editingSystem.id || editingSystem._id || targetSlug;
        const res = await fetch(`/api/systems/${sysId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setSystems((prev) =>
            prev.map((s) => (s.slug === sysId || s.id === sysId || s._id === sysId ? { ...s, ...payload } : s))
          );
          setAlertMsg({ message: `System "${formData.name}" successfully updated!`, type: 'success' });
        }
      } else {
        // Create new system
        const res = await fetch('/api/systems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          setSystems((prev) => [...prev, data.system || payload]);
          setAlertMsg({ message: `New system "${formData.name}" created!`, type: 'success' });
        }
      }
      setShowModal(false);
      setTimeout(() => setAlertMsg(null), 3000);
      fetchSystems();
    } catch (e) {
      console.error(e);
      alert('Failed to save system.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sys: SystemItem) => {
    const sysId = sys.slug || sys.id || sys._id;
    if (!confirm(`Are you sure you want to delete system "${sys.name}"? This will hide it from the learner dashboard.`)) {
      return;
    }

    try {
      if (sysId) {
        await fetch(`/api/systems/${sysId}`, { method: 'DELETE' });
      }
      setSystems((prev) => prev.filter((s) => s.slug !== sysId && s.id !== sysId && s._id !== sysId));
      setAlertMsg({ message: `System "${sys.name}" deleted.`, type: 'success' });
      setTimeout(() => setAlertMsg(null), 3000);
    } catch {
      alert('Failed to delete system');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
              Operational Systems Management
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Add, edit, and configure all port platforms displayed on the employee portal, statistics, and learning paths.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1266D5]/30 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle size={16} />
            <span>+ Add New System</span>
          </button>
        </div>

        {alertMsg && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              alertMsg.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <CheckCircle2 size={16} className="text-green-600" />
            <span>{alertMsg.message}</span>
          </div>
        )}

        {/* Systems Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {systems.map((sys, idx) => (
            <div
              key={sys.slug || sys.id || idx}
              className="bg-white rounded-2xl border border-[#DCE6F1] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="p-5 sm:p-6 space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: sys.color || '#1266D5' }}
                    >
                      <SystemIcon type={(sys.iconType as any) || 'btos'} size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#082B4C] text-base leading-tight">
                        {sys.name}
                      </h3>
                      <p className="text-xs text-[#64748B] font-medium mt-0.5">
                        {sys.fullName}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 font-mono">
                    Active
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">
                  {sys.description}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center text-xs">
                  <div>
                    <span className="block font-black text-[#082B4C]">{sys.topicsCount ?? 0}</span>
                    <span className="text-[10.5px] text-[#64748B]">Topics</span>
                  </div>
                  <div>
                    <span className="block font-black text-[#1266D5]">{sys.videosCount ?? 0}</span>
                    <span className="text-[10.5px] text-[#64748B]">Videos</span>
                  </div>
                  <div>
                    <span className="block font-black text-[#10B981]">{sys.totalDuration || '3h'}</span>
                    <span className="text-[10.5px] text-[#64748B]">Duration</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
                <Link
                  href={`/systems/${sys.slug || sys.id || sys.name.toLowerCase()}`}
                  target="_blank"
                  className="text-xs font-bold text-[#1266D5] hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={13} />
                  <span>View in Portal</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(sys)}
                    className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#64748B] hover:text-[#1266D5] hover:bg-white cursor-pointer"
                    title="Edit System Details"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(sys)}
                    className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#64748B] hover:text-red-600 hover:bg-white cursor-pointer"
                    title="Delete System"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* ADD / EDIT SYSTEM MODAL                                                   */}
        {/* ========================================================================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DCE6F1]">
              <div className="p-5 sm:px-7 bg-[#062746] text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
                    Platform Configuration
                  </span>
                  <h3 className="text-lg font-black mt-0.5">
                    {editingSystem ? `Edit System: ${editingSystem.name}` : 'Create New Operational System'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/70 hover:text-white p-1 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">System Code/Name *</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. BTOS, CTOS"
                      className="w-full border border-[#DCE6F1] rounded-xl p-2.5 font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Slug / URL Identifier *</label>
                    <input
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                      placeholder="e.g. btos, ctos"
                      className="w-full border border-[#DCE6F1] rounded-xl p-2.5 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Full System Name *</label>
                  <input
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Bulk Terminal Operating System"
                    className="w-full border border-[#DCE6F1] rounded-xl p-2.5 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#142B45] block mb-1">System Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Explain the role and capabilities of this operational system for port employees..."
                    className="w-full border border-[#DCE6F1] rounded-xl p-3 leading-relaxed"
                  />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="font-semibold text-[#142B45] block mb-1">Topics Count</label>
                    <input
                      type="number"
                      value={formData.topicsCount}
                      onChange={(e) => setFormData({ ...formData, topicsCount: parseInt(e.target.value) || 0 })}
                      className="w-full border border-[#DCE6F1] rounded-xl p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#142B45] block mb-1">Videos Count</label>
                    <input
                      type="number"
                      value={formData.videosCount}
                      onChange={(e) => setFormData({ ...formData, videosCount: parseInt(e.target.value) || 0 })}
                      className="w-full border border-[#DCE6F1] rounded-xl p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#142B45] block mb-1">Manuals Count</label>
                    <input
                      type="number"
                      value={formData.manualsCount}
                      onChange={(e) => setFormData({ ...formData, manualsCount: parseInt(e.target.value) || 1 })}
                      className="w-full border border-[#DCE6F1] rounded-xl p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#142B45] block mb-1">Total Duration</label>
                    <input
                      value={formData.totalDuration}
                      onChange={(e) => setFormData({ ...formData, totalDuration: e.target.value })}
                      placeholder="e.g. 4.5 hrs"
                      className="w-full border border-[#DCE6F1] rounded-xl p-2 font-mono"
                    />
                  </div>
                </div>

                {/* Icon & Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Icon Style</label>
                    <select
                      value={formData.iconType}
                      onChange={(e) => setFormData({ ...formData, iconType: e.target.value })}
                      className="w-full border border-[#DCE6F1] rounded-xl p-2.5 bg-white font-medium"
                    >
                      <option value="btos">BTOS (Bulk)</option>
                      <option value="ctos">CTOS (Container Crane)</option>
                      <option value="vtms">VTMS (Radar/Traffic)</option>
                      <option value="billing">Billing (Invoicing)</option>
                      <option value="vbs">VBS (Berthing)</option>
                      <option value="eam">EAM (Asset/Maintenance)</option>
                      <option value="bulk">General Bulk</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#142B45] block mb-1">Theme Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-[#DCE6F1] p-0.5"
                      />
                      <input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#1266D5"
                        className="flex-1 border border-[#DCE6F1] rounded-xl p-2.5 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 border border-[#DCE6F1] rounded-xl font-bold text-[#64748B] hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#1266D5] text-white rounded-xl font-bold hover:bg-[#0D55B8] flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>{saving ? 'Saving...' : 'Save System'}</span>
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

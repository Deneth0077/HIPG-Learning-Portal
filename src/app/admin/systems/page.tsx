'use client';

import React, { useEffect, useState } from 'react';
import {
  Grid2X2,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Layers
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SystemIcon } from '@/components/common/SystemIcon';

interface SystemItem {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  fullName: string;
  description: string;
  iconType: string;
  displayOrder?: number;
  isActive?: boolean;
  topicsCount: number;
  videosCount: number;
}

export default function SystemManagementPage() {
  const [systems, setSystems] = useState<SystemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState<SystemItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    fullName: '',
    description: '',
    iconType: 'btos',
  });

  const fetchSystems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/systems');
      const data = await res.json();
      if (data.systems) setSystems(data.systems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setFormData({ name: '', slug: '', fullName: '', description: '', iconType: 'btos' });
      fetchSystems();
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
              System Management
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Manage all terminal operating systems and enterprise platforms.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingSystem(null);
              setShowModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1266D5]/30 flex items-center gap-2 transition-all"
          >
            <PlusCircle size={16} />
            <span>Create New System</span>
          </button>
        </div>

        {/* Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {systems.map((s) => (
            <div key={s.name} className="bg-white rounded-2xl p-6 border border-[#DCE6F1] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1266D5] flex items-center justify-center">
                    <SystemIcon type={s.iconType} size={26} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-[#16A34A]">
                    Active
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#082B4C]">{s.name}</h3>
                <p className="text-xs font-semibold text-[#142B45] mt-0.5">{s.fullName}</p>
                <p className="text-[11.5px] text-[#64748B] line-clamp-2 mt-2">{s.description}</p>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#64748B]">
                  {s.topicsCount} Topics • {s.videosCount} Videos
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingSystem(s);
                      setFormData({
                        name: s.name,
                        slug: s.slug || s.name.toLowerCase(),
                        fullName: s.fullName,
                        description: s.description,
                        iconType: s.iconType,
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg border border-[#DCE6F1] text-[#64748B] hover:text-[#1266D5]"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create / Edit System Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE6F1]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-base font-bold text-[#082B4C]">
                  {editingSystem ? 'Edit System' : 'Create New System'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-[#64748B]">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">System Name (Acronym) *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase() })}
                    placeholder="e.g. BTOS"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Full System Title *</label>
                  <input
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Berth, Terminal & Operations System"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">System Icon Type</label>
                  <select
                    value={formData.iconType}
                    onChange={(e) => setFormData({ ...formData, iconType: e.target.value })}
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5 bg-white"
                  >
                    <option value="btos">Cargo Vessel (BTOS)</option>
                    <option value="bulk">Bulk Cargo Heap (BULK)</option>
                    <option value="ctos">Gantry Crane (CTOS)</option>
                    <option value="vtms">Tower Radar (VTMS)</option>
                    <option value="billing">Invoice Receipt (Billing)</option>
                    <option value="vbs">Calendar Berth (VBS)</option>
                    <option value="eam">Gear Asset (EAM)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-[#DCE6F1] rounded-lg font-bold text-[#64748B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1266D5] text-white rounded-lg font-bold hover:bg-[#0D55B8]"
                  >
                    Save System
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

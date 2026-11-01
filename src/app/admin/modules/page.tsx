'use client';

import React, { useEffect, useState } from 'react';
import { FolderTree, PlusCircle, Trash2, Edit2, X, ChevronRight } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SYSTEMS_DATA, BTOS_MODULES } from '@/data/portalData';

export default function ModuleManagementPage() {
  const [selectedSystem, setSelectedSystem] = useState('btos');
  const [modules, setModules] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    moduleNumber: 'Module 06',
    title: '',
    slug: '',
    description: '',
  });

  const fetchModules = async () => {
    try {
      const res = await fetch(`/api/systems/${selectedSystem}/modules`);
      const data = await res.json();
      if (data.modules) setModules(data.modules);
    } catch {
      if (selectedSystem === 'btos') setModules(BTOS_MODULES);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [selectedSystem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/systems/${selectedSystem}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setFormData({ moduleNumber: '', title: '', slug: '', description: '' });
      fetchModules();
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
              Module &amp; Curriculum Management
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Organize topics into structured learning modules for each operational system.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1266D5]/30 flex items-center gap-2"
          >
            <PlusCircle size={16} />
            <span>Add Module</span>
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

        {/* Modules List */}
        <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-xs divide-y divide-[#F1F5F9]">
          {modules.map((m, idx) => (
            <div key={m.id || idx} className="p-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#1266D5] font-black text-xs flex items-center justify-center">
                  0{idx + 1}
                </span>
                <div>
                  <h3 className="font-bold text-[#082B4C] text-sm">
                    {m.moduleNumber || `Module 0${idx + 1}`} – {m.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {m.lessons ? `${m.lessons.length} Learning Lessons` : 'Curriculum Unit'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-[#16A34A]">
                  Published
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Module Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE6F1]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-base font-bold text-[#082B4C]">Add Module to {selectedSystem.toUpperCase()}</h3>
                <button onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Module Number *</label>
                  <input
                    required
                    value={formData.moduleNumber}
                    onChange={(e) => setFormData({ ...formData, moduleNumber: e.target.value })}
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#142B45] block mb-1">Module Title *</label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="e.g. Weighbridge System Setup"
                    className="w-full border border-[#DCE6F1] rounded-lg p-2.5"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg font-bold text-[#64748B]">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#1266D5] text-white rounded-lg font-bold">Save Module</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

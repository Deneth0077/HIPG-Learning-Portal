'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Eye,
  FileText
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MANUAL_CARGO_ID } from '@/data/portalData';

export default function ContentManagementPage() {
  const [sections, setSections] = useState<any[]>(MANUAL_CARGO_ID);
  const [activeSectionId, setActiveSectionId] = useState('sec-5');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  const handleUpdateContent = (newContent: string) => {
    setSections(prev =>
      prev.map(s => s.id === activeSectionId ? { ...s, content: newContent } : s)
    );
  };

  const handleUpdateStep = (stepIdx: number, newInstruction: string) => {
    setSections(prev =>
      prev.map(s => {
        if (s.id !== activeSectionId || !s.steps) return s;
        const updatedSteps = [...s.steps];
        updatedSteps[stepIdx] = { ...updatedSteps[stepIdx], instruction: newInstruction };
        return { ...s, steps: updatedSteps };
      })
    );
  };

  const handleAddStep = () => {
    setSections(prev =>
      prev.map(s => {
        if (s.id !== activeSectionId) return s;
        const currentSteps = s.steps || [];
        const nextStepNumber = currentSteps.length + 1;
        return {
          ...s,
          steps: [
            ...currentSteps,
            {
              stepNumber: nextStepNumber,
              title: `Step ${nextStepNumber}`,
              instruction: 'New instruction detail for BTOS procedure.',
            },
          ],
        };
      })
    );
  };

  const handleSave = () => {
    setSaveMessage('Manual documentation saved & published to employee frontend.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
              User Manual &amp; CMS Editor
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Edit step-by-step instructions, troubleshooting notes, and interface callouts without writing code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1266D5]/30 flex items-center gap-2"
            >
              <Save size={16} />
              <span>Save &amp; Publish Manual</span>
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-xs font-semibold text-green-700 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{saveMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table of Contents Selector */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#DCE6F1] shadow-xs overflow-hidden">
            <div className="bg-[#082B4C] text-white px-5 py-4 flex items-center justify-between">
              <span className="font-bold text-sm">BTOS – Cargo ID Sections</span>
              <BookOpen size={16} className="text-[#29C5E8]" />
            </div>

            <nav className="p-3 space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                    activeSectionId === sec.id
                      ? 'bg-[#E0F2FE] text-[#0284C7] font-bold'
                      : 'text-[#475569] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span className="text-[#64748B] w-4 font-mono">{sec.number}</span>
                  <span className="truncate">{sec.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content Editor */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#DCE6F1] shadow-xs p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#DCE6F1] pb-4">
              <span className="text-[10px] font-bold uppercase bg-blue-50 text-[#1266D5] px-2 py-0.5 rounded">
                Editing Section {activeSection.number}
              </span>
              <h2 className="text-xl font-black text-[#082B4C] mt-1">{activeSection.title}</h2>
            </div>

            {/* General section text editor */}
            {activeSection.content !== undefined && (
              <div className="space-y-2 text-xs">
                <label className="font-bold text-[#142B45] block">Section Content Text</label>
                <textarea
                  rows={6}
                  value={activeSection.content}
                  onChange={(e) => handleUpdateContent(e.target.value)}
                  className="w-full border border-[#DCE6F1] rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1266D5]/20 focus:border-[#1266D5]"
                />
              </div>
            )}

            {/* Step by step editor */}
            {activeSection.steps && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#082B4C]">Step-by-Step Instruction Cards</h3>
                  <button
                    onClick={handleAddStep}
                    className="px-3 py-1.5 rounded-lg border border-[#DCE6F1] text-xs font-bold text-[#1266D5] hover:bg-blue-50 flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add Step
                  </button>
                </div>

                <div className="space-y-3">
                  {activeSection.steps.map((step: any, idx: number) => (
                    <div key={step.stepNumber} className="p-4 border border-[#DCE6F1] rounded-xl bg-[#F8FAFC] space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-[#082B4C]">
                        <span>Step {step.stepNumber}</span>
                      </div>
                      <input
                        value={step.instruction}
                        onChange={(e) => handleUpdateStep(idx, e.target.value)}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

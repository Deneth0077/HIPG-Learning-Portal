'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Filter,
  FileText,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  Download,
  Printer,
  Clock,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SYSTEMS_DATA, MANUAL_CARGO_ID } from '@/data/portalData';

interface ManualCardItem {
  id: string;
  systemId: string;
  systemName: string;
  systemColor: string;
  title: string;
  code: string;
  description: string;
  stepsCount: number;
  readTime: string;
  category: string;
  link: string;
  version: string;
}

const ALL_MANUALS: ManualCardItem[] = [
  {
    id: 'man-cargo-id',
    systemId: 'btos',
    systemName: 'BTOS',
    systemColor: '#0284C7',
    title: 'Cargo ID Generation Procedure',
    code: 'SOP-BTOS-OPS-04',
    description: 'Complete step-by-step procedure for generating unique terminal barcode IDs for general cargo, Ro-Ro, and bulk consignments before quayside discharge.',
    stepsCount: 9,
    readTime: '12 min',
    category: 'Operations',
    link: '/systems/btos/manuals/cargo-id',
    version: 'v3.2',
  },
  {
    id: 'man-discharging-plan',
    systemId: 'btos',
    systemName: 'BTOS',
    systemColor: '#0284C7',
    title: 'Discharging Cargo Plan Execution',
    code: 'SOP-BTOS-OPS-05',
    description: 'Terminal operating rules for assigning vessel discharge bays to quayside yard blocks and tally clerk coordination.',
    stepsCount: 7,
    readTime: '10 min',
    category: 'Vessel Operations',
    link: '/systems/btos/lessons/4-3-discharging-cargo-plan',
    version: 'v2.8',
  },
  {
    id: 'man-uat-install',
    systemId: 'btos',
    systemName: 'BTOS',
    systemColor: '#0284C7',
    title: 'BTOS UAT & Client Environment Setup',
    code: 'SOP-BTOS-SYS-01',
    description: 'Workstation prerequisites, Java runtime requirements, firewall rules, and desktop shortcut configuration for terminal operators.',
    stepsCount: 5,
    readTime: '8 min',
    category: 'Installation & IT',
    link: '/systems/btos/lessons/btos-uat-install',
    version: 'v4.0',
  },
  {
    id: 'man-ctos-yard-plan',
    systemId: 'ctos',
    systemName: 'CTOS',
    systemColor: '#1266D5',
    title: 'CTOS Container Yard Planning SOP',
    code: 'SOP-CTOS-YRD-02',
    description: 'Allocating container slots, assigning stack profiles, and coordinating with rubber-tyred gantry (RTG) crane dispatch.',
    stepsCount: 8,
    readTime: '15 min',
    category: 'Yard Management',
    link: '/systems/ctos/lessons/ctos-create-yard-plan',
    version: 'v2.4',
  },
  {
    id: 'man-bulk-survey',
    systemId: 'bulk',
    systemName: 'BULK',
    systemColor: '#D97706',
    title: 'Bulk Discharge Survey & Weighbridge Procedures',
    code: 'SOP-BULK-OPS-01',
    description: 'Standard guidelines for weighbridge tare weight recording, draft survey integration, and hopper conveyor belt operations.',
    stepsCount: 6,
    readTime: '11 min',
    category: 'Bulk Handling',
    link: '/systems/bulk/manuals/cargo-id',
    version: 'v1.9',
  },
  {
    id: 'man-billing-tariff',
    systemId: 'billing',
    systemName: 'SAP Billing',
    systemColor: '#2563EB',
    title: 'Tariff Calculation & Invoice Settlement',
    code: 'SOP-SAP-FIN-03',
    description: 'Detailed instructions on generating container handling tariffs, wharfage charges, demurrage invoices, and electronic bank receipts.',
    stepsCount: 8,
    readTime: '14 min',
    category: 'Finance & Billing',
    link: '/systems/billing/lessons/billing-for-container',
    version: 'v3.1',
  },
  {
    id: 'man-eam-maintenance',
    systemId: 'eam',
    systemName: 'EAM',
    systemColor: '#10B981',
    title: 'Quay Crane Preventive Maintenance Log',
    code: 'SOP-EAM-ENG-06',
    description: 'Logging operational hours, inspection checklists, work order dispatch, and spare parts requisition in Enterprise Asset Management.',
    stepsCount: 6,
    readTime: '9 min',
    category: 'Engineering & Assets',
    link: '/systems/eam',
    version: 'v2.0',
  },
];

export default function ManualsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');

  const filteredManuals = useMemo(() => {
    return ALL_MANUALS.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.systemName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSystem = selectedSystem === 'all' || m.systemId === selectedSystem;

      return matchesSearch && matchesSystem;
    });
  }, [searchQuery, selectedSystem]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
          <Link href="/dashboard" className="text-[#1266D5] hover:underline">
            Dashboard
          </Link>
          <span>&gt;</span>
          <span className="text-[#082B4C] font-bold">Standard Operating Procedures &amp; User Manuals</span>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#062746] via-[#082B4C] to-[#1266D5] p-6 sm:p-8 text-white shadow-md">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-white/15 text-[#38BDF8] border border-white/20 uppercase tracking-wider backdrop-blur-xs">
              <BookOpen size={13} /> HIPG Operations Knowledge Base
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              User Manuals &amp; Terminal Operating Procedures
            </h1>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Access official Standard Operating Procedures (SOPs), step-by-step system walkthroughs, and technical user documentation across all Hambantota International Port IT systems.
            </p>

            {/* Quick Search */}
            <div className="pt-2">
              <div className="relative max-w-lg">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" size={17} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search manuals by title, system, SOP code, or procedure..."
                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-white/60 outline-none backdrop-blur-sm transition-all focus:border-white/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedSystem('all')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
              selectedSystem === 'all'
                ? 'bg-[#082B4C] text-white shadow-xs'
                : 'bg-white border border-[#DCE6F1] text-[#64748B] hover:text-[#082B4C] hover:bg-[#F8FAFC]'
            }`}
          >
            All Systems ({ALL_MANUALS.length})
          </button>
          {['btos', 'ctos', 'bulk', 'billing', 'eam'].map((sysId) => {
            const count = ALL_MANUALS.filter((m) => m.systemId === sysId).length;
            const meta = SYSTEMS_DATA.find((s) => s.id === sysId);
            return (
              <button
                key={sysId}
                onClick={() => setSelectedSystem(sysId)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedSystem === sysId
                    ? 'bg-[#1266D5] text-white shadow-xs'
                    : 'bg-white border border-[#DCE6F1] text-[#64748B] hover:text-[#082B4C] hover:bg-[#F8FAFC]'
                }`}
              >
                <span>{meta?.name || sysId.toUpperCase()}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Featured Manual: BTOS Cargo ID Generation */}
        <div className="bg-white border-2 border-[#BFDBFE] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-gradient-to-br from-blue-50/50 to-white">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#1266D5] text-white uppercase tracking-wider">
                Featured Manual
              </span>
              <span className="text-xs font-mono text-[#64748B]">SOP-BTOS-OPS-04</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#082B4C]">
              BTOS – Cargo ID Generation Interactive Procedure Manual
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Step-by-step illustrated manual explaining required manifest information, system menu navigation, validation checks, and Cargo ID barcode generation for terminal dispatch.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#64748B] pt-1">
              <span className="flex items-center gap-1 font-semibold text-[#1266D5]">
                <FileText size={13} /> 9 Interactive Steps
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} /> 12 min read
              </span>
            </div>
          </div>

          <Link
            href="/systems/btos/manuals/cargo-id"
            className="px-5 py-2.5 bg-[#1266D5] hover:bg-[#0D55B8] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all shrink-0 active:scale-95 cursor-pointer"
          >
            <span>Open Interactive Manual</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* Manuals Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#082B4C]">
              Available System Manuals ({filteredManuals.length})
            </h3>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-[#1266D5] hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>

          {filteredManuals.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#DCE6F1] space-y-3">
              <BookOpen size={36} className="mx-auto text-[#94A3B8]" />
              <h4 className="font-bold text-sm text-[#082B4C]">No manuals match your query</h4>
              <p className="text-xs text-[#64748B]">Try searching with a different keyword or system name.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredManuals.map((man) => (
                <div
                  key={man.id}
                  className="bg-white border border-[#DCE6F1] hover:border-[#1266D5] rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between group hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Header: System Tag & Code */}
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black text-white"
                        style={{ backgroundColor: man.systemColor }}
                      >
                        {man.systemName}
                      </span>
                      <span className="text-[10.5px] font-mono text-[#64748B] font-semibold">
                        {man.code}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-sm text-[#082B4C] group-hover:text-[#1266D5] transition-colors leading-snug">
                      {man.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed">
                      {man.description}
                    </p>
                  </div>

                  {/* Footer Meta & Action Link */}
                  <div className="pt-4 mt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                      <span className="flex items-center gap-1 font-semibold text-[#1266D5]">
                        <FileText size={12} /> {man.stepsCount} Steps
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {man.readTime}
                      </span>
                    </div>

                    <Link
                      href={man.link}
                      className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] text-[#1266D5] hover:bg-[#1266D5] hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Read</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SystemCard } from '@/components/dashboard/SystemCard';
import { SYSTEMS_DATA } from '@/data/portalData';
import { Search, Filter } from 'lucide-react';

export default function AllSystemsPage() {
  const [systems, setSystems] = useState<any[]>(SYSTEMS_DATA);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/systems')
      .then((res) => res.json())
      .then((data) => {
        if (data.systems && data.systems.length > 0) {
          const mapped = data.systems.map((s: any) => ({
            ...s,
            id: s.slug || s.id,
            progressPercent: s.progressPercent ?? 25,
            completedTopics: s.completedTopics ?? 3,
            color: s.color || '#1266D5',
          }));
          setSystems(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const filteredSystems = systems.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#082B4C] tracking-tight">
              All Systems
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Explore and master all terminal operating and enterprise applications at HIPG.
            </p>
          </div>

          {/* Search within systems */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter systems..."
              className="w-full bg-white border border-[#DCE6F1] rounded-full pl-9 pr-4 py-2 text-xs text-[#142B45] focus:outline-none focus:ring-2 focus:ring-[#1266D5]/20 focus:border-[#1266D5]"
            />
          </div>
        </div>

        {/* Systems Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSystems.map((system) => (
            <SystemCard key={system.slug || system.id} system={system} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

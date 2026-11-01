'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { StatisticsCards } from '@/components/dashboard/StatisticsCards';
import { SystemCard } from '@/components/dashboard/SystemCard';
import { ContinueLearning } from '@/components/dashboard/ContinueLearning';
import { LearningProgress } from '@/components/dashboard/LearningProgress';
import { SYSTEMS_DATA } from '@/data/portalData';

export default function DashboardPage() {
  const [systems, setSystems] = useState<any[]>(SYSTEMS_DATA);

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

  return (
    <MainLayout>
      <div className="space-y-7 lg:space-y-8 w-full">
        {/* Section 1: Welcome Hero */}
        <WelcomeBanner />

        {/* Section 2: Statistics Cards */}
        <StatisticsCards systemsCount={systems.length} />

        {/* Section 3 & 4: Systems Grid + Right Side Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 lg:gap-8 items-start">
          {/* Left Column: Explore Systems */}
          <div className="xl:col-span-8 2xl:col-span-9 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-[#082B4C] tracking-tight">
                Explore Systems
              </h2>
              <span className="text-xs sm:text-sm font-bold text-[#64748B] bg-white px-3 py-1 rounded-full border border-[#DCE6F1]">
                {systems.length} Operational Platforms
              </span>
            </div>

            {/* Grid of systems */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {systems.map((system) => (
                <SystemCard key={system.slug || system.id} system={system} />
              ))}
            </div>
          </div>

          {/* Right Column: Continue Learning + Your Learning Progress */}
          <div className="xl:col-span-4 2xl:col-span-3 space-y-6">
            <ContinueLearning />
            <LearningProgress />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

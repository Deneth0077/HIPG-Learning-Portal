'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { StatisticsCards } from '@/components/dashboard/StatisticsCards';
import { SystemCard } from '@/components/dashboard/SystemCard';
import { ContinueLearning } from '@/components/dashboard/ContinueLearning';
import { LearningProgress } from '@/components/dashboard/LearningProgress';
import { SYSTEMS_DATA } from '@/data/portalData';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-7 lg:space-y-8 w-full">
        {/* Section 1: Welcome Hero */}
        <WelcomeBanner />

        {/* Section 2: Statistics Cards */}
        <StatisticsCards />

        {/* Section 3 & 4: Systems Grid + Right Side Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 lg:gap-8 items-start">
          {/* Left Column: Explore Systems (Takes 8 of 12 columns on xl, 9 on 2xl) */}
          <div className="xl:col-span-8 2xl:col-span-9 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-[#082B4C] tracking-tight">
                Explore Systems
              </h2>
              <span className="text-xs sm:text-sm font-bold text-[#64748B] bg-white px-3 py-1 rounded-full border border-[#DCE6F1]">
                7 Operational Platforms
              </span>
            </div>

            {/* Grid matching reference: 4 cards in first row, 3 cards in second row, nicely proportioned on widescreen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {SYSTEMS_DATA.map((system) => (
                <SystemCard key={system.id} system={system} />
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

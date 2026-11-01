import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { System } from '@/types';
import { SystemIcon } from '@/components/common/SystemIcon';

interface SystemCardProps {
  system: System;
}

export const SystemCard: React.FC<SystemCardProps> = ({ system }) => {
  const getIconBg = (id: string) => {
    switch (id) {
      case 'btos':
        return 'bg-[#EFF6FF] text-[#1266D5]';
      case 'bulk':
        return 'bg-[#FEF3C7] text-[#D97706]';
      case 'ctos':
        return 'bg-[#DCFCE7] text-[#16A34A]';
      case 'vtms':
        return 'bg-[#E0F2FE] text-[#0284C7]';
      case 'billing':
        return 'bg-[#FEE2E2] text-[#EF4444]';
      case 'vbs':
        return 'bg-[#DBEAFE] text-[#2563EB]';
      case 'eam':
        return 'bg-[#D1FAE5] text-[#10B981]';
      default:
        return 'bg-blue-50 text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DCE6F1] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-xl hover:border-[#1266D5]/40 transition-all duration-300 group min-h-[300px]">
      <div>
        {/* Top Header: System Icon - enlarged */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getIconBg(
              system.id
            )} transition-transform duration-300 group-hover:scale-110 shadow-xs`}
          >
            <SystemIcon type={system.iconType} size={30} />
          </div>
        </div>

        {/* System Name & Full Title with larger desktop typography */}
        <h3 className="text-lg sm:text-xl font-black text-[#082B4C] tracking-tight group-hover:text-[#1266D5] transition-colors">
          {system.name}
        </h3>
        <p className="text-xs sm:text-[13px] text-[#64748B] font-medium leading-relaxed line-clamp-2 mt-1.5 min-h-[38px]">
          {system.fullName}
        </p>

        {/* Meta Stats: Topics & Videos */}
        <div className="text-xs sm:text-[13px] text-[#64748B] font-semibold mt-4 flex items-center gap-2">
          <span>{system.topicsCount} Topics</span>
          <span className="text-[#94A3B8]">•</span>
          <span>{system.videosCount} Videos</span>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs sm:text-[13px] font-bold text-[#142B45] mb-1.5">
            <span className="text-[#64748B] font-medium">Progress</span>
            <span className="text-[#1266D5] font-black">{system.progressPercent}%</span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[#10B981]"
              style={{ width: `${system.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Button: View System -> with bigger hit target and font */}
      <div className="mt-6 pt-4 border-t border-[#F1F5F9]">
        <Link
          href={`/systems/${system.id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#EFF6FF] hover:bg-[#1266D5] text-[#1266D5] hover:text-white text-xs sm:text-sm font-bold transition-all duration-200 group-hover:shadow-sm"
        >
          <span>View System</span>
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

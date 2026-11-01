import React from 'react';
import { Layers, PlayCircle, CheckCircle2, BarChart2 } from 'lucide-react';

interface StatItem {
  id: string;
  count: string | number;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
}

const STATS: StatItem[] = [
  {
    id: 'systems',
    count: '7',
    label: 'Systems',
    icon: Layers,
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#1266D5]',
  },
  {
    id: 'topics',
    count: '128',
    label: 'Learning Topics',
    icon: PlayCircle,
    iconBg: 'bg-[#E0F2FE]',
    iconColor: 'text-[#0284C7]',
  },
  {
    id: 'completed',
    count: '36',
    label: 'Completed',
    icon: CheckCircle2,
    iconBg: 'bg-[#DCFCE7]',
    iconColor: 'text-[#16A34A]',
  },
  {
    id: 'progress',
    count: '28%',
    label: 'Overall Progress',
    icon: BarChart2,
    iconBg: 'bg-[#F3E8FF]',
    iconColor: 'text-[#9333EA]',
  },
];

export const StatisticsCards: React.FC<{ systemsCount?: number }> = ({ systemsCount }) => {
  const dynamicStats = STATS.map((s) => {
    if (s.id === 'systems' && systemsCount) {
      return { ...s, count: systemsCount.toString() };
    }
    return s;
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
      {dynamicStats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-[#DCE6F1] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center gap-5 hover:shadow-lg hover:border-[#1266D5]/30 transition-all duration-200 group"
          >
            {/* Circular colored icon background - scaled up */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${stat.iconBg} ${stat.iconColor} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-xs`}
            >
              <IconComponent size={28} className="stroke-[2.2]" />
            </div>

            {/* Statistic Content with bigger numbers and crisp typography */}
            <div className="flex flex-col min-w-0">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#082B4C] leading-none tracking-tight">
                {stat.count}
              </span>
              <span className="text-xs sm:text-sm lg:text-[15px] text-[#64748B] font-semibold truncate mt-1.5">
                {stat.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

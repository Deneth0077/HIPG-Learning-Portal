import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { CONTINUE_LEARNING_ITEMS } from '@/data/portalData';

export const ContinueLearning: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DCE6F1] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      {/* Header with Title and 'View All' */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-[#082B4C] tracking-tight">
          Continue Learning
        </h3>
        <Link
          href="/my-learning"
          className="text-xs sm:text-sm font-bold text-[#1266D5] hover:text-[#0D55B8] transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Lesson List with larger thumbnails and readable desktop typography */}
      <div className="space-y-4">
        {CONTINUE_LEARNING_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={`/systems/${item.systemId}/lessons/${item.id}`}
            className="flex items-center gap-3.5 group p-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors border border-transparent hover:border-[#E2E8F0]"
          >
            {/* Video Thumbnail with duration badge and port harbor graphic */}
            <div className="relative w-24 h-15 sm:w-26 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-[#082B4C] to-[#1266D5] flex items-center justify-center border border-[#CBD5E1]/50 shadow-xs">
              <svg
                viewBox="0 0 100 65"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full object-cover opacity-60 pointer-events-none"
              >
                <rect width="100" height="65" fill="#1E3A8A" />
                <path d="M10 50 L20 40 L70 40 L80 50 Z" fill="#38BDF8" opacity="0.7" />
                <line x1="30" y1="40" x2="40" y2="15" stroke="#93C5FD" strokeWidth="2" />
                <line x1="20" y1="15" x2="55" y2="15" stroke="#93C5FD" strokeWidth="2" />
              </svg>
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-white/95 flex items-center justify-center shadow-sm">
                  <Play size={12} className="fill-[#1266D5] text-[#1266D5] ml-0.5" />
                </div>
              </div>
              {/* Timestamp badge */}
              <span className="absolute bottom-1 right-1 bg-black/85 text-[10px] font-mono font-medium text-white px-1.5 py-0.5 rounded">
                {item.duration}
              </span>
            </div>

            {/* Title, System and Progress */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-[13.5px] font-bold text-[#142B45] truncate group-hover:text-[#1266D5] transition-colors">
                {item.title}
              </h4>
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#64748B] font-semibold mt-2">
                <span className="text-[#082B4C]">{item.systemId.toUpperCase()}</span>
                <span className="text-[#1266D5] font-bold">{item.progressPercent}%</span>
              </div>
              {/* Thin progress bar */}
              <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full rounded-full bg-[#10B981] transition-all duration-300"
                  style={{ width: `${item.progressPercent}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

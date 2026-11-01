import React from 'react';

export const LearningProgress: React.FC = () => {
  const percentage = 28;
  const strokeDashoffset = 100 - percentage;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DCE6F1] shadow-[0_2px_8px_rgba(0,0,0,0.03)] relative overflow-hidden">
      <h3 className="text-base font-bold text-[#082B4C] tracking-tight mb-5">
        Your Learning Progress
      </h3>

      <div className="flex items-center gap-5">
        {/* Circular Progress Gauge - enlarged for desktop view */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background ring */}
            <path
              className="text-[#E2E8F0]"
              strokeWidth="3.2"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progress highlight ring */}
            <path
              className="text-[#10B981]"
              strokeDasharray="100, 100"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="3.2"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black text-[#082B4C]">{percentage}%</span>
          </div>
        </div>

        {/* Text information with crisp sizing */}
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[#142B45]">Overall Completion</span>
          <span className="text-xs sm:text-[13px] text-[#64748B] mt-1">
            <strong className="text-[#082B4C]">36</strong> of <strong className="text-[#082B4C]">128</strong> lessons completed
          </span>
          <span className="text-xs text-[#16A34A] font-bold mt-2 bg-green-50 px-2.5 py-1 rounded-full inline-block w-max">
            +4 this week
          </span>
        </div>
      </div>

      {/* Decorative subtle port crane watermark in corner */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-10">
        <svg width="110" height="75" viewBox="0 0 120 80" fill="none">
          <line x1="30" y1="70" x2="45" y2="20" stroke="#082B4C" strokeWidth="2" />
          <line x1="60" y1="70" x2="50" y2="20" stroke="#082B4C" strokeWidth="2" />
          <line x1="15" y1="20" x2="90" y2="20" stroke="#082B4C" strokeWidth="2.5" />
        </svg>
      </div>
    </div>
  );
};

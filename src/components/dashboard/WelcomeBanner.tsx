import React from 'react';
import Link from 'next/link';
import { Play, HelpCircle } from 'lucide-react';

export const WelcomeBanner: React.FC = () => {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#DCE6F1] bg-gradient-to-r from-[#082B4C] via-[#0E3D68] to-[#1266D5] text-white min-h-[220px] lg:min-h-[260px] flex items-center">
      {/* Background Seaport Container Terminal Photography Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1440 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Dawn Sky Gradient */}
          <rect width="1440" height="380" fill="url(#heroSkyGrad)" />

          {/* Deep Sea */}
          <rect y="250" width="1440" height="130" fill="#061D33" />

          {/* Distant Hills / Horizon */}
          <path d="M0 250 Q 300 220 700 240 T 1440 230 L 1440 250 L 0 250 Z" fill="#0C2E50" opacity="0.5" />

          {/* Giant Ocean Container Carrier Vessel at Quayside Berth */}
          <path d="M720 250 L770 170 L1300 170 L1400 250 Z" fill="#0F2B48" />
          <path d="M770 170 L785 130 L920 130 L920 170 Z" fill="#29C5E8" opacity="0.85" />
          
          {/* Detailed Stacked Containers on Ship Deck */}
          <g opacity="0.95">
            {/* Bay 1 */}
            <rect x="930" y="110" width="55" height="60" fill="#E05252" rx="2" />
            <rect x="930" y="70" width="55" height="38" fill="#2498F2" rx="2" />
            {/* Bay 2 */}
            <rect x="990" y="95" width="60" height="75" fill="#16A6A0" rx="2" />
            <rect x="990" y="60" width="60" height="32" fill="#F59E0B" rx="2" />
            {/* Bay 3 */}
            <rect x="1055" y="105" width="58" height="65" fill="#2563EB" rx="2" />
            <rect x="1055" y="75" width="58" height="28" fill="#10B981" rx="2" />
            {/* Bay 4 */}
            <rect x="1118" y="120" width="60" height="50" fill="#E05252" rx="2" />
            <rect x="1118" y="85" width="60" height="32" fill="#F59E0B" rx="2" />
            {/* Bay 5 */}
            <rect x="1183" y="130" width="55" height="40" fill="#2498F2" rx="2" />
            <rect x="1243" y="140" width="50" height="30" fill="#16A6A0" rx="2" />
          </g>

          {/* 3 Giant High-Tech Quayside STS Container Cranes with Lattice Booms */}
          {/* Crane 1 */}
          <g stroke="#38BDF8" strokeWidth="3.5" fill="none">
            <line x1="910" y1="250" x2="945" y2="50" />
            <line x1="995" y1="250" x2="960" y2="50" />
            <line x1="820" y1="45" x2="1140" y2="45" strokeWidth="5" />
            <line x1="952" y1="10" x2="820" y2="45" strokeWidth="2.5" />
            <line x1="952" y1="10" x2="1140" y2="45" strokeWidth="2.5" />
            <line x1="952" y1="10" x2="952" y2="45" strokeWidth="2.5" />
            {/* Spreader Trolley */}
            <rect x="1030" y="45" width="28" height="10" fill="#F59E0B" stroke="none" />
            <line x1="1044" y1="55" x2="1044" y2="100" stroke="#93C5FD" strokeWidth="2" />
          </g>

          {/* Crane 2 */}
          <g stroke="#29C5E8" strokeWidth="3.5" fill="none">
            <line x1="1080" y1="250" x2="1115" y2="50" />
            <line x1="1165" y1="250" x2="1130" y2="50" />
            <line x1="990" y1="45" x2="1310" y2="45" strokeWidth="5" />
            <line x1="1122" y1="10" x2="990" y2="45" strokeWidth="2.5" />
            <line x1="1122" y1="10" x2="1310" y2="45" strokeWidth="2.5" />
          </g>

          {/* Crane 3 */}
          <g stroke="#60A5FA" strokeWidth="3.5" fill="none">
            <line x1="1250" y1="250" x2="1285" y2="60" />
            <line x1="1335" y1="250" x2="1300" y2="60" />
            <line x1="1160" y1="55" x2="1440" y2="55" strokeWidth="5" />
            <line x1="1292" y1="20" x2="1160" y2="55" strokeWidth="2.5" />
            <line x1="1292" y1="20" x2="1440" y2="55" strokeWidth="2.5" />
          </g>

          <defs>
            <linearGradient id="heroSkyGrad" x1="0" y1="0" x2="1440" y2="380" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E3A8A" />
              <stop offset="0.5" stopColor="#0284C7" />
              <stop offset="0.9" stopColor="#38BDF8" />
              <stop offset="1" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Dark Gradient Overlay for flawless contrast and readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#062746] via-[#082B4C]/90 to-transparent z-1" />

      {/* Hero Content with Larger Enterprise Typography */}
      <div className="relative z-10 px-8 lg:px-12 py-10 lg:py-12 max-w-3xl flex flex-col justify-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
          Welcome to
          <br />
          <span className="text-white drop-shadow-md">HIPG Learning Portal</span>
        </h2>
        <p className="text-base sm:text-lg text-[#E2E8F0] font-normal leading-relaxed mb-8 max-w-xl">
          Learn, understand and master HIPG operational systems.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/systems/btos"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] active:bg-[#084293] text-white text-sm sm:text-base font-bold shadow-lg shadow-[#1266D5]/35 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Play size={16} className="fill-white" />
            <span>Start Learning</span>
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-sm sm:text-base font-semibold backdrop-blur-md transition-all duration-200"
          >
            <HelpCircle size={16} />
            <span>How It Works</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

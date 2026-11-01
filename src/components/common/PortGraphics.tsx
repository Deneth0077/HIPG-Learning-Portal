import React from 'react';

// HIPG Official Logo SVG as shown in the top sidebar reference
export const HipgLogo: React.FC<{ className?: string; inverted?: boolean }> = ({
  className = "w-full",
  inverted = true,
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Mountain & Wave Graphic */}
      <div className="relative w-12 h-10 flex-shrink-0">
        <svg viewBox="0 0 70 55" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Stylized White/Ice Mountain */}
          <path
            d="M8 32C10 26 15 16 23 15C31 14 36 22 41 18C44 15 45 8 50 8C55 8 60 20 63 32H8Z"
            fill="url(#mountainGrad)"
          />
          {/* Inner Mountain shading */}
          <path
            d="M26 17C31 23 34 32 37 32C42 32 45 19 49 11C47 20 46 28 42 32H26Z"
            fill="#CBD5E1"
            fillOpacity="0.45"
          />
          {/* Ocean Waves */}
          <path
            d="M5 36C12 33 22 33 29 36C36 39 46 39 53 36C59 33 65 34 67 36"
            stroke="#29C5E8"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M4 42C12 39 20 39 28 42C36 45 45 45 53 42C59 39 64 40 66 42"
            stroke="#1266D5"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M6 48C13 45 22 45 30 48C38 51 47 51 55 48C60 46 64 47 66 48"
            stroke="#0284C7"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="mountainGrad" x1="10" y1="8" x2="60" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.7" stopColor="#E2E8F0" />
              <stop offset="1" stopColor="#94A3B8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col text-left">
        <span
          className={`font-black text-xl tracking-wider leading-tight ${
            inverted ? 'text-white' : 'text-[#082B4C]'
          }`}
          style={{ letterSpacing: '0.04em' }}
        >
          HIPG
        </span>
        <span
          className={`text-[9px] font-medium leading-tight tracking-tight ${
            inverted ? 'text-[#94A3B8]' : 'text-[#64748B]'
          }`}
        >
          Hambantota International
          <br />
          Port Group
        </span>
      </div>
    </div>
  );
};

// Subtle Decorative Port Crane at the bottom of the sidebar
export const SidebarPortCrane: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`pointer-events-none select-none relative overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 240 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto opacity-30"
      >
        {/* Sea Level / Waves */}
        <path
          d="M0 108 C30 105, 60 112, 90 108 C120 104, 150 112, 180 108 C210 104, 230 110, 240 108 L240 120 L0 120 Z"
          fill="#0D3B63"
        />
        <path
          d="M0 113 C35 111, 70 117, 105 113 C140 109, 175 117, 210 113 L240 114 L240 120 L0 120 Z"
          fill="#1266D5"
          fillOpacity="0.4"
        />

        {/* Cargo Vessel Silhouette */}
        <path
          d="M10 104 L20 92 L65 92 L75 104 Z"
          fill="#1D4E75"
        />
        <rect x="25" y="86" width="12" height="6" fill="#2498F2" fillOpacity="0.8" />
        <rect x="40" y="84" width="14" height="8" fill="#29C5E8" fillOpacity="0.7" />
        <rect x="18" y="80" width="4" height="12" fill="#38BDF8" fillOpacity="0.6" />

        {/* Massive STS Container Gantry Crane */}
        {/* Vertical Leg A */}
        <line x1="85" y1="106" x2="105" y2="40" stroke="#38BDF8" strokeWidth="2.5" />
        <line x1="125" y1="106" x2="115" y2="40" stroke="#38BDF8" strokeWidth="2.5" />
        {/* Horizontal Bracing */}
        <line x1="93" y1="80" x2="121" y2="80" stroke="#38BDF8" strokeWidth="1.5" />
        <line x1="99" y1="60" x2="118" y2="60" stroke="#38BDF8" strokeWidth="1.5" />
        {/* Cross Bracing */}
        <line x1="93" y1="80" x2="118" y2="60" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="121" y1="80" x2="99" y2="60" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />

        {/* Crane Tower Upper Structure */}
        <polygon points="105,40 115,40 120,25 102,25" fill="#38BDF8" fillOpacity="0.3" stroke="#38BDF8" strokeWidth="2" />
        
        {/* Main Crane Boom (Horizontal Arm stretching over water) */}
        <line x1="45" y1="36" x2="175" y2="36" stroke="#38BDF8" strokeWidth="3" />
        <line x1="45" y1="36" x2="110" y2="15" stroke="#38BDF8" strokeWidth="1.5" />
        <line x1="175" y1="36" x2="112" y2="15" stroke="#38BDF8" strokeWidth="1.5" />
        <line x1="110" y1="15" x2="112" y2="36" stroke="#38BDF8" strokeWidth="1.5" />

        {/* Trolley & Spreader Cables */}
        <rect x="70" y="36" width="10" height="4" fill="#60A5FA" />
        <line x1="72" y1="40" x2="72" y2="65" stroke="#93C5FD" strokeWidth="1" />
        <line x1="78" y1="40" x2="78" y2="65" stroke="#93C5FD" strokeWidth="1" />
        {/* Container being lifted */}
        <rect x="68" y="65" width="14" height="7" fill="#F59E0B" fillOpacity="0.8" rx="0.5" />

        {/* Second Crane (Background Silhouette) */}
        <line x1="145" y1="106" x2="160" y2="52" stroke="#1E3A5F" strokeWidth="2" />
        <line x1="180" y1="106" x2="170" y2="52" stroke="#1E3A5F" strokeWidth="2" />
        <line x1="120" y1="48" x2="200" y2="48" stroke="#1E3A5F" strokeWidth="2" />
        <line x1="120" y1="48" x2="165" y2="32" stroke="#1E3A5F" strokeWidth="1" />
        <line x1="200" y1="48" x2="167" y2="32" stroke="#1E3A5F" strokeWidth="1" />
      </svg>
    </div>
  );
};

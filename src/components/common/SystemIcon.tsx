import React from 'react';

interface SystemIconProps {
  type: 'btos' | 'bulk' | 'ctos' | 'vtms' | 'billing' | 'vbs' | 'eam' | string;
  className?: string;
  size?: number;
}

export const SystemIcon: React.FC<SystemIconProps> = ({ type, className = "w-6 h-6", size = 24 }) => {
  switch (type) {
    case 'btos':
      // Blue Cargo Ship / Vessel icon matching reference
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M3 17L5 19H19L21 17L20 13H4L3 17Z" />
          <path d="M7 11V13H17V11H7Z" />
          <path d="M9 8V11H15V8H9Z" />
          <path d="M11 5V8H13V5H11Z" />
          <path d="M3 20H21C21 20 20 22 17 22C14 22 13 21 11 21C9 21 8 22 5 22C3 22 3 20 3 20Z" opacity="0.6" />
        </svg>
      );

    case 'bulk':
      // Gold/Amber Bulk Cargo / Aggregate Heap icon matching reference
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M3 18H21L19 14L15 9L12 6L9 9L5 14L3 18Z" />
          <path d="M7 19C5 19 3 20.5 3 21H21C21 20.5 19 19 17 19C15 19 14 20 12 20C10 20 9 19 7 19Z" opacity="0.7"/>
        </svg>
      );

    case 'ctos':
      // Emerald Green Container Gantry Crane matching reference
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 21L7 6H17L21 21" />
          <path d="M5 14H19" />
          <path d="M2 6H22" />
          <rect x="9" y="10" width="6" height="4" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />
          <line x1="12" y1="6" x2="12" y2="10" />
        </svg>
      );

    case 'vtms':
      // Deep Blue Maritime Tower / Vessel Radar matching reference
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M4 17L6 19H18L20 17L19 14H5L4 17Z" />
          <rect x="8" y="10" width="8" height="4" rx="0.5" />
          <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 8 8.5 9.5 10 10H14C15.5 9.5 16.5 8 16.5 6.5C16.5 4 14.5 2 12 2ZM12 4C13.4 4 14.5 5.1 14.5 6.5C14.5 7.9 13.4 9 12 9C10.6 9 9.5 7.9 9.5 6.5C9.5 5.1 10.6 4 12 4Z" />
          <circle cx="12" cy="6.5" r="1.5" />
        </svg>
      );

    case 'billing':
      // Coral Red Invoice / Receipt icon matching reference
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <line x1="8" y1="8" x2="16" y2="8" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="13" y2="16" />
        </svg>
      );

    case 'vbs':
      // Blue Vessel Berthing Calendar icon matching reference
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="12" cy="15" r="1.5" fill="currentColor" />
        </svg>
      );

    case 'eam':
      // Teal Green Gear / Cog / Asset Management icon matching reference
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );

    default:
      return null;
  }
};

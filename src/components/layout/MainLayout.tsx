'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { X } from 'lucide-react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F7FC] flex antialiased text-[#142B45] selection:bg-[#1266D5] selection:text-white">
      {/* Desktop Sidebar (wider 72 (18rem / 288px) matching large displays) */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-xs bg-[#062746] shadow-2xl z-10">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-3 text-white/70 hover:text-white p-1 rounded-md"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Content Container - full width without excessive max-w restriction */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-6 lg:p-8 xl:p-10 w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

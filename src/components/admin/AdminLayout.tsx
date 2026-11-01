'use client';

import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Header } from '@/components/layout/Header';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F3F7FC] flex antialiased text-[#142B45] selection:bg-[#1266D5] selection:text-white">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Header />
        <main className="flex-1 p-6 lg:p-8 xl:p-10 w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

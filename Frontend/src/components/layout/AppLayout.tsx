import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#12231e] text-forest-100">
      {/* Primary Sidebar */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-5 md:p-6 bg-[#12231e]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};


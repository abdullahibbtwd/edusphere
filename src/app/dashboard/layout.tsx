import React from 'react';
import SideBar from '@/components/SuperAdmin/SideBar';
import Navbar from '@/components/SuperAdmin/Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-bg transition-colors duration-200">
      {/* Sidebar */}
      <div className='md:w-1/6'>
        <SideBar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 w-5/6 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
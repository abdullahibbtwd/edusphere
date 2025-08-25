"use client";
import React from "react";
import SideBar from "@/components/SuperAdmin/SideBar"
import Navbar from "@/components/SuperAdmin/Navbar";
const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar (sticky full height) */}
      <aside className="hidden md:block w-64 bg-surface text-text shadow-lg sticky top-0 h-screen">
        <SideBar />
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
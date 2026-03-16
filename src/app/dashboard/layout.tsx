"use client";
import { useState } from "react";
import { motion } from "framer-motion";
// trigger rebuild
import SideBar from "@/components/SuperAdmin/SideBar";
import Navbar from "@/components/SuperAdmin/Navbar";
import { X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <div className="flex h-screen bg-bg">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Desktop: sticky, Mobile: animated overlay */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className={`
        fixed md:sticky top-0 h-screen w-72 md:w-64 bg-surface text-text shadow-lg z-50
        md:translate-x-0
      `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg)] md:hidden"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        <div onClick={closeSidebar}>
          <SideBar />
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar with Mobile Menu Button */}
        <Navbar onMenuClick={openSidebar} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
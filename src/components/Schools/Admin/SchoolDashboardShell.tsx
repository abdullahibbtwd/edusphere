"use client";

import { useState, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Schools/Admin/Sidebar";
import Navbar from "@/components/SuperAdmin/Navbar";
import { X } from "lucide-react";

/** Matches `w-64` (256px) off-screen offset for the slide animation. */
const SIDEBAR_OFF_X = -256;

export default function SchoolDashboardShell({
  school,
  children,
}: {
  school: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMdUp, setIsMdUp] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsMdUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  const sidebarX = isMdUp ? 0 : sidebarOpen ? 0 : SIDEBAR_OFF_X;

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden
        />
      )}

      <motion.aside
        initial={{ x: sidebarX }}
        animate={{ x: sidebarX }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="fixed md:sticky top-0 h-screen w-64 shrink-0 bg-surface text-text shadow-lg z-50"
      >
        <button
          type="button"
          onClick={closeSidebar}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg)] md:hidden z-10"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="h-full overflow-y-auto" onClick={closeSidebar}>
          <Sidebar school={school} />
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <header className="z-10 bg-bg/80 backdrop-blur-md sticky top-0">
          <Navbar onMenuClick={openSidebar} />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}

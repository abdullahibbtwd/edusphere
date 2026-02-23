"use client";
import ApplicationForm from "@/components/ApplicationForm";
import ApplicationStatusView from "@/components/ApplicationStatusView";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ClipboardList } from "lucide-react";

export default function ApplicationPage() {
  const params = useParams();
  const schoolId = params.school as string;
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [schoolName, setSchoolName] = useState("");
  const [activeTab, setActiveTab] = useState<"form" | "status">("form");

  const checkStatus = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(`/api/schools/${schoolId}/student-applications/my-application`);
      const data = await response.json();

      if (response.ok && data.application) {
        setApplication(data.application);
        setSchoolName(data.schoolName);
        if (!silent) setActiveTab("status");
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleApplySuccess = () => {
    // Re-fetch status and switch tab
    checkStatus(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse tracking-widest text-sm font-bold uppercase">Preparing Application...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "form", label: "Admission Form", icon: FileText },
    { id: "status", label: "My Status", icon: ClipboardList, disabled: !application },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Tab Navigation */}
      <div className="w-full bg-surface/50 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                disabled={tab.disabled}
                className={`relative py-6 px-8 flex items-center gap-3 border-b-2 transition-all duration-300 ${activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  } ${tab.disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "animate-pulse" : ""}`} />
                <span className="text-sm font-black uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-4px_12px_rgba(var(--primary-rgb),0.5)]"
                  />
                )}
                {tab.id === "status" && application && (
                  <span className="absolute top-4 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {activeTab === "form" ? (
              <div className="max-w-4xl mx-auto">
                <ApplicationForm onSuccess={handleApplySuccess} />
              </div>
            ) : (
              <ApplicationStatusView
                application={application}
                schoolName={schoolName}
                schoolId={schoolId}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

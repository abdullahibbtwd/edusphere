"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, FileText, ArrowRight, ShieldCheck, Download } from "lucide-react";

export default function ApplicationProgressPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.school as string;
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/schools/${schoolId}/student-applications/my-application`);
        const data = await response.json();

        if (response.ok && data.application) {
          setApplication(data.application);
          setSchoolName(data.schoolName);
        } else {
          // If no application found, redirect to apply
          router.push(`/${schoolId}/application`);
        }
      } catch (error) {
        console.error("Error fetching application status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [schoolId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse">Checking your application status...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { id: "SUBMITTED", label: "Application Submitted", icon: FileText, date: application?.createdAt },
    { id: "PROGRESS", label: "Under Review", icon: Clock, date: "Usually within 3-5 days" },
    { id: "SCREENING", label: "Screening/Interview", icon: ShieldCheck, date: "TBD" },
    { id: "ADMITTED", label: "Final Decision", icon: CheckCircle2, date: "Complete" },
  ];

  const currentStatusIndex = application?.status === "ADMITTED" ? 3 : 1;

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-4">Application Status</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for applying to <span className="text-primary font-semibold">{schoolName}</span>.
            We are carefully reviewing your details.
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-surface/40 border border-border/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 border-b border-border/50 pb-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Application ID</p>
              <p className="text-2xl font-bold text-primary">{application?.applicationNumber || "Pending"}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                <Clock className="w-4 h-4 mr-2" />
                In Progress
              </span>
            </div>
          </div>

          {/* Vertical Stepper for Mobile, Horizontal for Desktop? Let's use a nice vertical one */}
          <div className="space-y-12">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative flex gap-6 items-start">
                  {/* Connect Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-10 left-5 w-0.5 h-12 -ml-[1px] ${isCompleted ? "bg-primary" : "bg-muted"}`}></div>
                  )}

                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${isCompleted ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    } ${isCurrent ? "ring-4 ring-primary/20 animate-pulse" : ""}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 pt-1">
                    <h3 className={`text-lg font-bold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {index === 0 ? new Date(step.date).toLocaleDateString() : step.date}
                    </p>
                    {isCurrent && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-2 inline-flex items-center text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded"
                      >
                        Current Stage
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-muted/30 border border-border/50">
            <h4 className="font-semibold mb-2 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Need a copy of your application?
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              You can download your submitted application details as a PDF for your records.
            </p>
            <button
              className="w-full py-3 px-6 rounded-xl bg-surface border border-border hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2"
              onClick={() => {
                // To be implemented: PDF re-generation
                alert("Downloading PDF...");
              }}
            >
              Download Application PDF
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground text-sm">
            Have questions? Contact our admissions office at <a href={`mailto:admissions@${schoolId}.edu`} className="text-primary hover:underline">admissions@edu.com</a>
          </p>
          <button
            onClick={() => router.push(`/${schoolId}`)}
            className="mt-6 inline-flex items-center text-primary font-medium hover:gap-2 transition-all"
          >
            Return to Homepage <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

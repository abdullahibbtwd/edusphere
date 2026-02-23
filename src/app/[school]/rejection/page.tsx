"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, Mail, Info, ExternalLink } from "lucide-react";

export default function ApplicationRejectionPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.school as string;

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 -right-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-surface/40 border border-red-500/20 rounded-3xl p-8 md:p-12 shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-red-500/5">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-4">Application Status Update</h1>
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>
              We appreciate the time and effort you invested in your application to our institution.
            </p>
            <p>
              After a thorough review of your application and current enrollment capacity, we regret to inform you that we are unable to offer admission at this time.
            </p>
            <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 text-left text-base mt-8">
              <h4 className="font-bold text-foreground mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2 text-primary" />
                Common Reasons for this Decision:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Classes for the selected level have reached full capacity.</li>
                <li>Incomplete documentation or academic prerequisites.</li>
                <li>High volume of competitive applications this term.</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(`/${schoolId}`)}
              className="flex-1 py-3 px-6 rounded-xl bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Homepage
            </button>
            <button
              onClick={() => window.location.href = `mailto:admissions@${schoolId}.edu`}
              className="flex-1 py-3 px-6 rounded-xl bg-surface border border-border hover:bg-muted transition-all font-bold flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold mb-4">Helpful Links</p>
          <div className="flex justify-center gap-8">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
              FAQ <ExternalLink className="w-3 h-3" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
              Appeals Process <ExternalLink className="w-3 h-3" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
              Next Term Info <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

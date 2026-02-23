"use client";
import React from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    Clock,
    FileText,
    ShieldCheck,
    Download,
    XCircle,
    Trophy,
    Calendar,
    MapPin,
    ExternalLink,
    Mail,
    ArrowRight
} from "lucide-react";
import generateApplicationPdf from "./ApplicationPdfGenerator";

interface ApplicationStatusViewProps {
    application: any;
    schoolName: string;
    schoolId: string;
}

export default function ApplicationStatusView({ application, schoolName, schoolId }: ApplicationStatusViewProps) {
    if (!application) return null;

    const status = application.status;

    const steps = [
        { id: "SUBMITTED", label: "Application Submitted", icon: FileText, date: application.createdAt },
        { id: "PROGRESS", label: "Under Review", icon: Clock, date: "Usually within 3-5 days" },
        { id: "SCREENING", label: "Screening/Interview", icon: ShieldCheck, date: "TBD" },
        { id: "ADMITTED", label: "Final Decision", icon: CheckCircle2, date: "Complete" },
    ];

    const currentStatusIndex = status === "ADMITTED" ? 3 : (status === "REJECTED" ? 1 : 1);

    const handleDownloadPdf = async () => {
        try {
            const schoolInfo = {
                name: schoolName,
                address: "School Address",
                phone: "School Phone",
                email: "School Email"
            };

            const pdfData = {
                ...application,
                level: application.levelName || application.level,
                className: application.className,
            };

            await generateApplicationPdf(pdfData as any, application.applicationNumber, schoolInfo);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            alert("Failed to generate PDF. Please try again later.");
        }
    };

    const renderStatusContent = () => {
        switch (status) {
            case "ADMITTED":
                return (
                    <div className="space-y-8 text-center">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-500/5">
                            <Trophy className="w-12 h-12 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-foreground mb-2">Congratulations!</h2>
                            <p className="text-muted-foreground text-lg">
                                Your application to <span className="text-primary font-bold">{schoolName}</span> has been <span className="text-green-500 font-bold uppercase tracking-widest">Approved</span>.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10 backdrop-blur-sm">
                                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-green-500" />
                                    Next Steps
                                </h4>
                                <ul className="space-y-3 text-sm text-muted-foreground font-medium">
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                                        Visit the school for physical screening and documentation.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                                        Complete your tuition fee payment.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                                        Get your uniforms and school materials.
                                    </li>
                                </ul>
                            </div>
                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 backdrop-blur-sm">
                                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    Admission Portal
                                </h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    You can now access your student dashboard to complete your registration.
                                </p>
                                <button className="w-full py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                                    Go to Student Portal
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case "REJECTED":
                return (
                    <div className="space-y-8 text-center pt-4">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-500/5">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">Application Update</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Thank you for your interest in <span className="font-bold text-foreground">{schoolName}</span>. After careful review, we regret to inform you that we cannot offer admission at this time.
                            </p>
                        </div>
                        <div className="p-6 bg-muted/20 rounded-2xl border border-border/50 text-left">
                            <h4 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                What does this mean?
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Decisions are based on academic records, available capacity, and overall competition. This decision is final for the current term, but we encourage you to:
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                    Read our Policy <ExternalLink className="w-3 h-3" />
                                </button>
                                <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                    Contact Admissions <Mail className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default: // PROGRESS
                return (
                    <div className="space-y-10 pt-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-8">
                            <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Application Reference</p>
                                <p className="text-2xl font-black text-primary tracking-tight">{application.applicationNumber}</p>
                            </div>
                            <div>
                                <span className="inline-flex items-center px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold border border-primary/20 text-xs uppercase tracking-widest">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Under Review
                                </span>
                            </div>
                        </div>

                        <div className="space-y-12 relative">
                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;
                                const Icon = step.icon;

                                return (
                                    <div key={step.id} className="relative flex gap-6 items-start group">
                                        {index < steps.length - 1 && (
                                            <div className={`absolute top-10 left-5 w-0.5 h-12 -ml-[1px] ${isCompleted ? "bg-primary" : "bg-muted"} transition-all duration-500`}></div>
                                        )}

                                        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ${isCompleted ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
                                            } ${isCurrent ? "ring-4 ring-primary/10 animate-pulse scale-110" : "group-hover:scale-105"}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1 pt-0.5">
                                            <h3 className={`text-lg font-bold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                                                {step.label}
                                            </h3>
                                            <p className="text-xs font-medium text-muted-foreground/60 mt-1 uppercase tracking-wider">
                                                {index === 0 ? new Date(step.date).toLocaleDateString(undefined, { dateStyle: 'long' }) : step.date}
                                            </p>
                                            {isCurrent && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="mt-3 inline-flex items-center text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-md uppercase tracking-wider"
                                                >
                                                    Processing
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
        >
            <div className="backdrop-blur-xl bg-surface/30 border border-border/40 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]"></div>

                {renderStatusContent()}

                {status !== "REJECTED" && (
                    <div className="mt-12 p-6 rounded-3xl bg-surface/40 border border-border/40 backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Download className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Application Copy</h4>
                                <p className="text-xs text-muted-foreground">Keep a digital record for your reference.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDownloadPdf}
                            className="w-full py-4 px-6 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all font-black text-sm uppercase tracking-[0.15em] shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-3"
                        >
                            Download Application PDF
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center space-y-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.25em]">
                    Support ID: {application.id.slice(-8).toUpperCase()}
                </p>
            </div>
        </motion.div>
    );
}

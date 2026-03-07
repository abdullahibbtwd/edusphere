/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import CalendarView from "@/components/CalendarView";
import ExamConfigForm from "@/components/ExamConfigForm";
import ExamTimetableDisplay, { downloadClassExamPdf, downloadTeacherDutiesPdf } from "@/components/ExamTimetableDisplay";
import {
    FiCalendar,
    FiClock,
    FiEye,
    FiEdit2,
    FiZap,
    FiFilter,
    FiSettings,
    FiUser,
    FiAlertCircle,
    FiBookOpen,
    FiDownload,
} from "react-icons/fi";

const TERM_LABELS: Record<string, string> = { FIRST: "First", SECOND: "Second", THIRD: "Third" };

const ExamsPage = () => {
    const params = useParams();
    const schoolId = params.school as string;
    const { role, user } = useUser();

    const [activeSession, setActiveSession] = useState<any>(null);
    const [loadingSession, setLoadingSession] = useState(true);

    const [showViewCalendar, setShowViewCalendar] = useState(false);
    const [showConfigForm, setShowConfigForm] = useState(false);

    const [examConfig, setExamConfig] = useState<any>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);

    const [selectedTerm, setSelectedTerm] = useState<string>("FIRST");
    const [generating, setGenerating] = useState(false);

    const [schoolName, setSchoolName] = useState<string>("");

    // --- Admin: view-by-class ---
    const [levels, setLevels] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [exams, setExams] = useState<any[]>([]);
    const [loadingExams, setLoadingExams] = useState(false);

    // --- Teacher view ---
    const [myExams, setMyExams] = useState<any[]>([]);
    const [loadingMyExams, setLoadingMyExams] = useState(false);
    const [teacherTab, setTeacherTab] = useState<"teaching" | "invigilation">("teaching");

    // --- Student view ---
    const [studentExams, setStudentExams] = useState<any[]>([]);
    const [studentClassName, setStudentClassName] = useState<string>("");
    const [loadingStudentExams, setLoadingStudentExams] = useState(false);

    // ---- fetchers ----
    const fetchSession = useCallback(async () => {
        try {
            setLoadingSession(true);
            const res = await fetch(`/api/schools/${schoolId}/academic-calendar`);
            const data = await res.json();
            if (res.ok) {
                const active = data.sessions?.find((s: any) => s.isActive);
                setActiveSession(active || null);
            }
        } finally {
            setLoadingSession(false);
        }
    }, [schoolId]);

    const fetchConfig = useCallback(async () => {
        try {
            setLoadingConfig(true);
            const res = await fetch(`/api/schools/${schoolId}/exam-timetable/config`);
            const data = await res.json();
            if (res.ok) setExamConfig(data.config || null);
        } finally {
            setLoadingConfig(false);
        }
    }, [schoolId]);

    const fetchLevels = useCallback(async () => {
        const res = await fetch(`/api/schools/${schoolId}/levels?limit=1000`);
        const data = await res.json();
        if (res.ok && data.levels) setLevels(data.levels);
    }, [schoolId]);

    const fetchClasses = useCallback(async (levelId: string) => {
        const res = await fetch(`/api/schools/${schoolId}/classes?levelId=${levelId}&limit=1000`);
        const data = await res.json();
        if (res.ok && data.classes) setClasses(data.classes);
    }, [schoolId]);

    const fetchExams = useCallback(async (classId: string, term: string) => {
        try {
            setLoadingExams(true);
            const res = await fetch(`/api/schools/${schoolId}/exam-timetable?classId=${classId}&term=${term}`);
            const data = await res.json();
            setExams(res.ok ? data.exams || [] : []);
        } finally {
            setLoadingExams(false);
        }
    }, [schoolId]);

    const fetchTeacherExams = useCallback(async (term: string) => {
        if (!user?.name) return;
        try {
            setLoadingMyExams(true);
            const res = await fetch(`/api/schools/${schoolId}/exam-timetable?term=${term}`);
            const data = await res.json();
            if (res.ok) {
                const mine = (data.exams || []).filter(
                    (e: any) => e.teacher?.name === user.name || e.invigilator?.name === user.name
                );
                setMyExams(mine);
            }
        } finally {
            setLoadingMyExams(false);
        }
    }, [schoolId, user?.name]);

    const fetchStudentExams = useCallback(async (term: string) => {
        try {
            setLoadingStudentExams(true);
            const res = await fetch(`/api/schools/${schoolId}/exam-timetable/my-class?term=${term}`);
            const data = await res.json();
            if (res.ok) {
                setStudentExams(data.exams || []);
                setStudentClassName(data.student?.className || "");
            } else {
                setStudentExams([]);
            }
        } finally {
            setLoadingStudentExams(false);
        }
    }, [schoolId]);

    useEffect(() => {
        fetchSession();
        if (role === "admin") {
            fetchConfig();
            fetchLevels();
        }
        fetch(`/api/schools/${schoolId}`)
            .then(r => r.ok ? r.json() : null)
            .then(d => d?.name && setSchoolName(d.name))
            .catch(() => {});
    }, [fetchSession, fetchConfig, fetchLevels, role, schoolId]);

    useEffect(() => {
        if (selectedLevel) {
            fetchClasses(selectedLevel);
            setSelectedClass("");
        } else {
            setClasses([]);
        }
    }, [selectedLevel, fetchClasses]);

    useEffect(() => {
        if (role === "admin" && selectedClass && selectedTerm) {
            fetchExams(selectedClass, selectedTerm);
        } else if (role !== "admin") {
            setExams([]);
        }
    }, [role, selectedClass, selectedTerm, fetchExams]);

    useEffect(() => {
        if (role === "teacher" && selectedTerm) {
            fetchTeacherExams(selectedTerm);
        }
    }, [role, selectedTerm, fetchTeacherExams]);

    useEffect(() => {
        if (role === "student" && selectedTerm) {
            fetchStudentExams(selectedTerm);
        }
    }, [role, selectedTerm, fetchStudentExams]);

    const handleGenerate = async () => {
        if (!selectedTerm) { toast.error("Please select a term"); return; }
        try {
            setGenerating(true);
            const res = await fetch(`/api/schools/${schoolId}/exam-timetable/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ term: selectedTerm }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "Exam timetable generated", { duration: 5000 });
                if (selectedClass) fetchExams(selectedClass, selectedTerm);
            } else {
                toast.error(data.error || "Failed to generate");
            }
        } catch {
            toast.error("Failed to generate exam timetable");
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateClick = async () => {
        if (!examConfig) setShowConfigForm(true);
        else await handleGenerate();
    };

    const handleConfigSuccess = async (config: any) => {
        setExamConfig(config);
        setShowConfigForm(false);
        await handleGenerate();
    };

    const currentTerm = activeSession?.terms?.find((t: any) => t.name === selectedTerm);
    const examEvents = currentTerm?.events?.filter((e: any) => e.type === "EXAM") || [];
    const hasExamWeeks = examEvents.length > 0;
    const selectedClassData = classes.find(c => c.id === selectedClass);
    const selectedLevelData = levels.find(l => l.id === selectedLevel);
    const totalClasses = levels.reduce((s: number, l: any) => s + (l.classCount || 0), 0);

    if (loadingSession) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[280px] py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-muted">Loading…</p>
            </div>
        );
    }

    if (!activeSession) {
        return (
            <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[360px] py-8 text-center px-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <FiCalendar className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-lg font-bold text-text mb-1">No active academic session</h1>
                <p className="text-sm text-muted">
                    Set up an academic calendar with exam weeks before generating exam timetables.
                </p>
            </div>
        );
    }

    // ---- shared header ----
    const pageHeader = (
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
                <h1 className="text-xl font-bold text-text">Exam Timetable</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        <FiCalendar className="w-3 h-3" />
                        {activeSession.name}
                    </span>
                    {currentTerm && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium">
                            <FiClock className="w-3 h-3" />
                            {currentTerm.name} Term
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={() => setShowViewCalendar(true)}
                    className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                    <FiEye className="w-4 h-4" />
                    <span className="hidden sm:inline">View calendar</span>
                </button>
                {role === "admin" && (
                    <button
                        onClick={() => setShowConfigForm(true)}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-surface text-text hover:bg-muted/50 transition-colors"
                        title="Exam configuration"
                    >
                        <FiEdit2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </header>
    );

    return (
        <div className="flex flex-col bg-surface p-4 sm:p-6 m-4 mt-0 flex-1 rounded-2xl shadow-sm gap-6 font-poppins text-text">
            {/* Modals */}
            {showViewCalendar && (
                <CalendarView session={activeSession} onClose={() => setShowViewCalendar(false)} />
            )}
            {showConfigForm && (
                <ExamConfigForm
                    schoolId={schoolId}
                    initialConfig={examConfig}
                    onSuccess={handleConfigSuccess}
                    onCancel={() => setShowConfigForm(false)}
                />
            )}

            {pageHeader}

            {/* ===== ADMIN VIEW ===== */}
            {role === "admin" && (
                <>
                    {examConfig && (
                        <div className="rounded-xl bg-surface p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <FiSettings className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-text">Exam configuration</p>
                                        <p className="text-xs text-muted mt-0.5">
                                            {examConfig.examsPerDay} exam{examConfig.examsPerDay > 1 ? "s" : ""}/day ·{" "}
                                            {examConfig.examDuration} min each · starts {examConfig.examStartTime} ·{" "}
                                            {examConfig.breakBetweenExams} min break
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowConfigForm(true)} className="text-xs text-primary hover:underline font-medium">
                                    Edit
                                </button>
                            </div>
                        </div>
                    )}

                    <section className="rounded-xl bg-surface p-4 sm:p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <FiZap className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-text">Generate exam timetable</h2>
                                    <p className="text-xs text-muted mt-0.5">
                                        {totalClasses} classes · conflict-free invigilator assignment
                                    </p>
                                    {!hasExamWeeks && selectedTerm && (
                                        <div className="mt-2 flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs">
                                            <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            No exam weeks set for this term — mark them in the academic calendar first.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                                <div className="w-full sm:w-36">
                                    <label className="block text-xs font-medium text-muted mb-1">Term</label>
                                    <select
                                        value={selectedTerm}
                                        onChange={e => setSelectedTerm(e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg bg-bg text-text text-sm focus:outline-none transition-all"
                                    >
                                        <option value="FIRST">First Term</option>
                                        <option value="SECOND">Second Term</option>
                                        <option value="THIRD">Third Term</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleGenerateClick}
                                    disabled={generating || loadingConfig}
                                    className="h-9 px-4 rounded-lg bg-primary text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                                >
                                    <FiZap className="w-4 h-4" />
                                    {generating ? "Generating…" : examConfig ? "Generate" : "Configure & Generate"}
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl bg-surface p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <FiFilter className="w-4 h-4 text-primary" />
                            <h2 className="text-sm font-semibold text-text">View by class</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-muted mb-1">Level</label>
                                <select
                                    value={selectedLevel}
                                    onChange={e => setSelectedLevel(e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg bg-bg text-text text-sm focus:outline-none transition-all"
                                >
                                    <option value="">Select level</option>
                                    {levels.map((l: any) => (
                                        <option key={l.id} value={l.id}>{l.name} ({l.classCount || 0} classes)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted mb-1">Class</label>
                                <select
                                    value={selectedClass}
                                    onChange={e => setSelectedClass(e.target.value)}
                                    disabled={!selectedLevel}
                                    className="w-full h-9 px-3 rounded-lg bg-bg text-text text-sm focus:outline-none transition-all disabled:opacity-50"
                                >
                                    <option value="">{selectedLevel ? "Select class" : "Select level first"}</option>
                                    {classes.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.levelName} {c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loadingExams ? (
                            <div className="flex flex-col items-center justify-center min-h-[200px]">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                                <p className="text-xs text-muted">Loading exams…</p>
                            </div>
                        ) : selectedClass && selectedClassData && selectedLevelData ? (
                            <ExamTimetableDisplay
                                exams={exams}
                                className={`${selectedLevelData.name} ${selectedClassData.name}`}
                                term={selectedTerm}
                                schoolName={schoolName || undefined}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[180px] py-8 text-center rounded-lg bg-muted/10">
                                <FiFilter className="w-10 h-10 text-muted mb-2" />
                                <p className="text-sm font-medium text-text mb-0.5">No class selected</p>
                                <p className="text-xs text-muted">
                                    {selectedLevel ? "Choose a class to view its exam timetable" : "Choose a level first"}
                                </p>
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* ===== TEACHER VIEW ===== */}
            {role === "teacher" && (() => {
                const teachingExams = myExams.filter((e: any) => e.teacher?.name === user?.name);
                const invigilationExams = myExams.filter((e: any) => e.invigilator?.name === user?.name);
                const activeList = teacherTab === "teaching" ? teachingExams : invigilationExams;
                const fmt = (s: string) => new Date(s).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
                const fmtDate = (s: string) => { const d = new Date(s); const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]; return `${days[d.getDay()]} ${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`; };

                return (
                    <div className="flex flex-col gap-5">
                        {/* Header bar */}
                        <section className="rounded-xl bg-surface p-4 sm:p-5 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <FiUser className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-text">My Exam Duties</h2>
                                        <p className="text-xs text-muted">{activeSession.name} · {TERM_LABELS[selectedTerm]} Term</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <select
                                        value={selectedTerm}
                                        onChange={e => setSelectedTerm(e.target.value)}
                                        className="h-9 px-3 rounded-lg bg-bg text-text text-sm focus:outline-none transition-all"
                                    >
                                        <option value="FIRST">First Term</option>
                                        <option value="SECOND">Second Term</option>
                                        <option value="THIRD">Third Term</option>
                                    </select>
                                    {myExams.length > 0 && (
                                        <button
                                            onClick={() => downloadTeacherDutiesPdf(user?.name ?? "Teacher", teachingExams, invigilationExams, selectedTerm, schoolName || undefined)}
                                            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                                        >
                                            <FiDownload className="w-4 h-4" />
                                            Download PDF
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Tabs + table */}
                        <section className="rounded-xl bg-surface shadow-sm overflow-hidden">
                            {/* Tab bar */}
                            <div className="flex border-b border-muted/40">
                                <button
                                    onClick={() => setTeacherTab("teaching")}
                                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${teacherTab === "teaching" ? "border-text/60 text-text" : "border-transparent text-muted hover:text-text"}`}
                                >
                                    <FiBookOpen className="w-4 h-4" />
                                    Teaching
                                    <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-muted/50 text-text/50">
                                        {teachingExams.length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setTeacherTab("invigilation")}
                                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${teacherTab === "invigilation" ? "border-text/60 text-text" : "border-transparent text-muted hover:text-text"}`}
                                >
                                    <FiEye className="w-4 h-4" />
                                    Invigilation
                                    <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-muted/50 text-text/50">
                                        {invigilationExams.length}
                                    </span>
                                </button>
                            </div>

                            {/* Content */}
                            {loadingMyExams ? (
                                <div className="flex flex-col items-center justify-center min-h-[220px]">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                                    <p className="text-xs text-muted">Loading…</p>
                                </div>
                            ) : activeList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center min-h-[200px] text-center px-4">
                                    <FiCalendar className="w-10 h-10 text-muted mb-3" />
                                    <p className="text-sm font-medium text-text mb-1">
                                        No {teacherTab === "teaching" ? "teaching" : "invigilation"} duties
                                    </p>
                                    <p className="text-xs text-muted">
                                        {teacherTab === "teaching"
                                            ? "No exams where you are the subject teacher this term."
                                            : "No exams assigned to you as invigilator this term."}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[540px] border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-muted/20 border-b border-muted/40">
                                                {["Subject", "Class", "Date", "Time"].map(h => (
                                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text/50 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...activeList]
                                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                                .map((exam: any) => (
                                                    <tr key={exam.id} className="border-b border-muted/30 last:border-0 hover:bg-muted/10 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-text text-sm">{exam.subject?.name}</td>
                                                        <td className="px-4 py-3 text-xs text-text/70">{exam.level?.name} {exam.class?.name}</td>
                                                        <td className="px-4 py-3 text-xs text-text whitespace-nowrap">{fmtDate(exam.date)}</td>
                                                        <td className="px-4 py-3 text-xs text-text whitespace-nowrap">{fmt(exam.startTime)} – {fmt(exam.endTime)}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>
                );
            })()}

            {/* ===== STUDENT VIEW ===== */}
            {role === "student" && (
                <div className="flex flex-col gap-6">
                    <section className="rounded-xl bg-surface p-4 sm:p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FiBookOpen className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-text">
                                        {studentClassName ? `${studentClassName} — Exam Schedule` : "My exam schedule"}
                                    </h2>
                                    <p className="text-xs text-muted">
                                        {TERM_LABELS[selectedTerm]} Term · {activeSession.name}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full sm:w-40">
                                <label className="block text-xs font-medium text-muted mb-1">Term</label>
                                <select
                                    value={selectedTerm}
                                    onChange={e => setSelectedTerm(e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg bg-bg text-text text-sm focus:outline-none transition-all"
                                >
                                    <option value="FIRST">First Term</option>
                                    <option value="SECOND">Second Term</option>
                                    <option value="THIRD">Third Term</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl bg-surface p-4 sm:p-6 shadow-sm min-h-[300px]">
                        {loadingStudentExams ? (
                            <div className="flex flex-col items-center justify-center min-h-[220px]">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                                <p className="text-xs text-muted">Loading your exam schedule…</p>
                            </div>
                        ) : (
                            <ExamTimetableDisplay
                                exams={studentExams}
                                className={studentClassName || "My Class"}
                                term={selectedTerm}
                                schoolName={schoolName || undefined}
                            />
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default ExamsPage;

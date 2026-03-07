/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FiCalendar, FiClock, FiDownload, FiBookOpen } from "react-icons/fi";
// Note: subject code and exam hall are intentionally excluded from display per requirements

type ExamEntry = {
    id: string;
    subject: { id: string; name: string; code: string; creditUnit: number };
    teacher: { id: string; name: string };
    invigilator: { id: string; name: string } | null;
    examHall: string;
    date: string;
    startTime: string;
    endTime: string;
    class: { id: string; name: string };
    level: { id: string; name: string };
    term: string;
};

type ExamTimetableDisplayProps = {
    exams: ExamEntry[];
    className: string;
    term: string;
    schoolName?: string;
};

const TERM_LABELS: Record<string, string> = {
    FIRST: "First",
    SECOND: "Second",
    THIRD: "Third",
    FULL_SESSION: "Full Session",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${DAY_NAMES[d.getDay()]} ${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;
}

function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDateShort(dateStr: string): string {
    const d = new Date(dateStr);
    return `${DAY_NAMES[d.getDay()]} ${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`;
}

// ─── PDF helpers ────────────────────────────────────────────────────────────

const PDF_STYLES = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #0f172a; }

/* ── Header ── */
.header { background: #1e3a8a; color: #fff; padding: 36px 48px 32px; text-align: center; }
.school { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; opacity: 0.6; margin-bottom: 10px; }
.divider { width: 40px; height: 2px; background: rgba(255,255,255,0.35); margin: 10px auto; border-radius: 2px; }
.title { font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; opacity: 0.7; margin-bottom: 6px; }
.classname { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.1; }
.badge { display: inline-block; margin-top: 12px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; padding: 4px 16px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; }

/* ── Body ── */
.body { padding: 28px 48px 40px; }
table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
thead tr { background: #1e3a8a; }
th { padding: 10px 14px; text-align: left; color: #fff; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
tbody tr { border-bottom: 1px solid #eef2f8; }
tbody tr.alt { background: #f7f9fc; }
tbody tr:last-child { border-bottom: none; }
td { padding: 11px 14px; vertical-align: middle; color: #334155; }
.sname { font-weight: 600; color: #0f172a; }
.time-wrap { white-space: nowrap; }
.time-sep { color: #94a3b8; font-size: 10px; display: block; }

/* ── Section title (teacher PDF) ── */
.section-title { font-size: 11px; font-weight: 700; color: #1e3a8a; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #dde6ff; letter-spacing: 0.5px; text-transform: uppercase; }

/* ── Footer ── */
.footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e9edf5; display: flex; justify-content: space-between; align-items: center; }
.footer span { font-size: 9px; color: #b0b8c8; letter-spacing: 0.3px; }

@media print { @page { margin: 14mm 16mm; size: A4 portrait; } }
`;

function openPrintWindow(html: string) {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
}


/** PDF for class exam timetable (admin / student view) */
export function downloadClassExamPdf(exams: ExamEntry[], className: string, term: string, schoolName?: string) {
    const sorted = [...exams].sort((a, b) => {
        const dc = new Date(a.date).getTime() - new Date(b.date).getTime();
        return dc !== 0 ? dc : new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    const rows = sorted.map((e, i) => `
    <tr class="${i % 2 === 0 ? "" : "alt"}">
      <td class="num">${i + 1}</td>
      <td class="sname">${e.subject.name}</td>
      <td>${formatDateShort(e.date)}</td>
      <td class="time-wrap">${formatTime(e.startTime)}<span class="time-sep">– ${formatTime(e.endTime)}</span></td>
      <td>${e.teacher.name}</td>
      <td>${e.invigilator?.name ?? "—"}</td>
    </tr>`).join("");

    const termLabel = TERM_LABELS[term] ?? term;
    const genDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

    openPrintWindow(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Exam Timetable – ${className}</title>
<style>${PDF_STYLES}</style></head><body>
<div class="header">
  ${schoolName ? `<div class="school">${schoolName}</div><div class="divider"></div>` : ""}
  <div class="title">Exam Timetable</div>
  <div class="classname">${className}</div>
  <div class="badge">${termLabel} Term</div>
</div>
<div class="body">
  <table>
    <thead><tr>
      <th class="c">#</th><th>Subject</th>
      <th>Date</th><th>Time</th><th>Teacher</th><th>Invigilator</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <span>Generated on ${genDate}</span>
    <span>${schoolName ? schoolName + " · " : ""}${termLabel} Term Exam Timetable</span>
  </div>
</div>
<script>window.onload = () => window.print()</script>
</body></html>`);
}

/** PDF for teacher duties (teaching + invigilation sections) */
export function downloadTeacherDutiesPdf(
    teacherName: string,
    teachingExams: any[],
    invigilationExams: any[],
    term: string,
    schoolName?: string,
) {
    const termLabel = TERM_LABELS[term] ?? term;
    const genDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

    const sortFn = (a: any, b: any) => {
        const dc = new Date(a.date).getTime() - new Date(b.date).getTime();
        return dc !== 0 ? dc : new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    };

    const tRows = [...teachingExams].sort(sortFn).map((e, i) => `

    <tr class="${i % 2 === 0 ? "" : "alt"}">
      <td class="num">${i + 1}</td>
      <td class="sname">${e.subject?.name}</td>
      <td>${e.level?.name} ${e.class?.name}</td>
      <td>${formatDateShort(e.date)}</td>
      <td class="time-wrap">${formatTime(e.startTime)}<span class="time-sep">– ${formatTime(e.endTime)}</span></td>
    </tr>`).join("");

    const iRows = [...invigilationExams].sort(sortFn).map((e, i) => `
    <tr class="${i % 2 === 0 ? "" : "alt"}">
      <td class="num">${i + 1}</td>
      <td class="sname">${e.subject?.name}</td>
      <td>${e.level?.name} ${e.class?.name}</td>
      <td>${formatDateShort(e.date)}</td>
      <td class="time-wrap">${formatTime(e.startTime)}<span class="time-sep">– ${formatTime(e.endTime)}</span></td>
    </tr>`).join("");

    openPrintWindow(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Exam Duties – ${teacherName}</title>
<style>${PDF_STYLES}</style></head><body>
<div class="header">
  ${schoolName ? `<div class="school">${schoolName}</div><div class="divider"></div>` : ""}
  <div class="title">Exam Duties</div>
  <div class="classname">${teacherName}</div>
  <div class="badge">${termLabel} Term</div>
</div>
<div class="body">
  ${teachingExams.length > 0 ? `
  <div class="section-title">📚 Teaching Duties — ${teachingExams.length} exam${teachingExams.length !== 1 ? "s" : ""}</div>
  <table>
    <thead><tr>
      <th class="c">#</th><th>Subject</th><th>Class</th>
      <th>Date</th><th>Time</th>
    </tr></thead>
    <tbody>${tRows}</tbody>
  </table>` : ""}
  ${invigilationExams.length > 0 ? `
  <div class="section-title">👁 Invigilation Duties — ${invigilationExams.length} exam${invigilationExams.length !== 1 ? "s" : ""}</div>
  <table>
    <thead><tr>
      <th class="c">#</th><th>Subject</th><th>Class</th>
      <th>Date</th><th>Time</th>
    </tr></thead>
    <tbody>${iRows}</tbody>
  </table>` : ""}
  <div class="footer">
    <span>Generated on ${genDate}</span>
    <span>${schoolName ? schoolName + " · " : ""}${termLabel} Term · ${teacherName}</span>
  </div>
</div>
<script>window.onload = () => window.print()</script>
</body></html>`);
}

// ─── Component ───────────────────────────────────────────────────────────────

const ExamTimetableDisplay = ({ exams, className, term, schoolName }: ExamTimetableDisplayProps) => {
    if (!exams || exams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/10 rounded-2xl">
                <FiCalendar className="w-12 h-12 text-muted mb-3" />
                <p className="text-sm font-medium text-text mb-1">No exam timetable generated</p>
                <p className="text-xs text-muted">Generate the exam timetable to see it here.</p>
            </div>
        );
    }

    const sorted = [...exams].sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <FiBookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-text">{className}</h3>
                        <p className="text-xs text-muted uppercase tracking-wider font-semibold">
                            {TERM_LABELS[term] ?? term} Term Exam
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => downloadClassExamPdf(sorted, className, term, schoolName)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                    <FiDownload className="w-4 h-4" />
                    Download PDF
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl shadow-sm">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                    <thead>
                        <tr className="bg-muted/20 border-b border-muted/40">
                            <th className="p-3 text-left text-xs font-semibold text-text/40 uppercase tracking-wider">Subject</th>
                            <th className="p-3 text-left text-xs font-semibold text-text/40 uppercase tracking-wider">
                                <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" />Date</span>
                            </th>
                            <th className="p-3 text-left text-xs font-semibold text-text/40 uppercase tracking-wider">
                                <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />Time</span>
                            </th>
                            <th className="p-3 text-left text-xs font-semibold text-text/40 uppercase tracking-wider">Teacher</th>
                            <th className="p-3 text-left text-xs font-semibold text-text/40 uppercase tracking-wider">Invigilator</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((exam) => (
                            <tr
                                key={exam.id}
                                className="border-b border-muted/40 last:border-0 hover:bg-muted/10 transition-colors"
                            >
                                <td className="p-3 font-medium text-text">{exam.subject.name}</td>
                                <td className="p-3 text-text text-xs whitespace-nowrap">{formatDate(exam.date)}</td>
                                <td className="p-3 text-text text-xs whitespace-nowrap">
                                    {formatTime(exam.startTime)} – {formatTime(exam.endTime)}
                                </td>
                                <td className="p-3 text-text text-xs">{exam.teacher.name}</td>
                                <td className="p-3 text-xs">
                                    {exam.invigilator ? (
                                        <span className="text-xs text-text/70">{exam.invigilator.name}</span>
                                    ) : (
                                        <span className="text-muted italic">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-muted text-right">{sorted.length} exam{sorted.length !== 1 ? "s" : ""} scheduled</p>
        </div>
    );
};

export default ExamTimetableDisplay;

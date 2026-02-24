"use client";

import { FiClock, FiBookOpen, FiMapPin, FiDownload } from "react-icons/fi";
import { downloadTimetablePdf } from "@/lib/timetable-pdf";

type TeacherTimetableDisplayProps = {
    schedule: Record<string, { subject?: string; teacher?: string; className?: string | null; startTime?: string; endTime?: string }[]>;
    teacherName: string;
    term: string;
    schoolName?: string;
};

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const TeacherTimetableDisplay = ({ schedule, teacherName, term, schoolName }: TeacherTimetableDisplayProps) => {
    if (!schedule || Object.keys(schedule).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-surface/50 rounded-2xl shadow-sm">
                <FiClock className="w-12 h-12 sm:w-16 sm:h-16 text-text/20 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-text/60">No schedule found for this term</p>
                <p className="text-xs sm:text-sm text-text/40 mt-1">Your schedule will appear here once timetables are set.</p>
            </div>
        );
    }

    const maxPeriods = Math.max(
        ...DAYS.map(day => schedule[day]?.length || 0)
    );

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-3 bg-surface/50 p-3 sm:p-4 rounded-2xl shadow-sm flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <FiBookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-xl font-bold text-text flex items-center gap-2">
                            {teacherName}&#39;s Schedule
                        </h3>
                        <p className="text-xs sm:text-sm text-text/60 uppercase tracking-wider font-semibold">{term.replace(/_/g, " ")} Term</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => downloadTimetablePdf(schedule, `${teacherName}'s Schedule - ${term.replace(/_/g, " ")} Term`, "teacher", schoolName)}
                    className="inline-flex cursor-pointer items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    <FiDownload className="w-4 h-4" />
                    Download PDF
                </button>
            </div>

            <div className="overflow-x-auto -mx-1 sm:mx-0 rounded-2xl shadow-sm">
                <table className="w-full min-w-[520px] sm:min-w-0 border-collapse">
                    <thead>
                        <tr className="bg-primary/10">
                            <th className="p-2 sm:p-3 md:p-4 text-left text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider min-w-[70px] sm:min-w-[90px] rounded-tl-xl border-b border-r border-muted/40">
                                Period
                            </th>
                            {DAYS.map((day, i) => (
                                <th
                                    key={day}
                                    className="p-2 sm:p-3 md:p-4 text-left text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider min-w-[88px] sm:min-w-[100px] md:min-w-[120px] border-b border-r border-muted/40 last:border-r-0 last:rounded-tr-xl"
                                >
                                    <span className="hidden sm:inline">{day}</span>
                                    <span className="sm:hidden">{DAY_SHORT[i]}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: maxPeriods }, (_, i) => i + 1).map(period => (
                            <tr key={period} className="hover:bg-bg/30 transition-colors group border-b border-muted/40 last:border-b-0">
                                <td className="p-2 sm:p-3 md:p-4 font-medium text-xs sm:text-sm text-text/70 bg-surface/30 group-hover:bg-primary/5 rounded-l-xl border-r border-muted/40">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-text group-hover:text-primary duration-200">P{period}</span>
                                        {schedule[DAYS[0]]?.[period - 1]?.startTime && (
                                            <span className="text-[10px] sm:text-xs text-text/40 flex items-center gap-0.5 mt-0.5 sm:mt-1">
                                                <FiClock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                                <span className="truncate">{schedule[DAYS[0]][period - 1].startTime}-{schedule[DAYS[0]][period - 1].endTime}</span>
                                            </span>
                                        )}
                                    </div>
                                </td>
                                {DAYS.map(day => {
                                    const entry = schedule[day]?.[period - 1];
                                    const hasClass = entry?.subject && entry.subject.toLowerCase() !== 'free';
                                    return (
                                        <td key={day} className="p-1.5 sm:p-2 md:p-3 align-top border-r border-muted/40 last:border-r-0">
                                            {hasClass ? (
                                                <div className="p-2 sm:p-3 bg-primary/10 rounded-lg hover:bg-primary/15 hover:shadow-sm transition-all cursor-default min-h-[52px] sm:min-h-[64px] flex flex-col justify-center">
                                                    <div className="font-bold text-[11px] sm:text-sm text-primary leading-tight truncate" title={entry.subject}>
                                                        {entry.subject}
                                                    </div>
                                                    {entry.className && (
                                                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-text/70 font-medium mt-0.5 truncate" title={entry.className}>
                                                            <FiMapPin className="w-3 h-3 text-text/50 shrink-0" />
                                                            <span className="truncate">{entry.className}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="p-2 sm:p-3 bg-muted/10 rounded-lg text-center min-h-[52px] sm:min-h-[64px] flex items-center justify-center">
                                                    <span className="text-[10px] sm:text-xs font-medium text-text/30 italic">No Class</span>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherTimetableDisplay;

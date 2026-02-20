"use client";

import { FiClock, FiBookOpen, FiMapPin } from "react-icons/fi";

type TeacherTimetableDisplayProps = {
    schedule: any; // Consolidated schedule object
    teacherName: string;
    term: string;
};

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const TeacherTimetableDisplay = ({ schedule, teacherName, term }: TeacherTimetableDisplayProps) => {
    if (!schedule || Object.keys(schedule).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center bg-surface rounded-xl border border-muted">
                <FiClock className="w-16 h-16 text-text/20 mb-4" />
                <p className="text-text/60">No schedule found for this term</p>
            </div>
        );
    }

    // Get max periods across all days to determine table height
    const maxPeriods = Math.max(
        ...DAYS.map(day => schedule[day]?.length || 0)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-muted shadow-sm">
                <div>
                    <h3 className="text-xl font-bold text-text flex items-center gap-2">
                        <FiBookOpen className="text-primary" />
                        {teacherName}'s Schedule
                    </h3>
                    <p className="text-sm text-text/60 uppercase tracking-wider font-semibold">{term} Term</p>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="overflow-x-auto rounded-xl border border-muted shadow-lg">
                <table className="w-full border-collapse bg-surface overflow-hidden">
                    <thead>
                        <tr className="bg-primary/10 border-b border-primary/20">
                            <th className="p-4 text-left text-xs font-bold text-primary uppercase tracking-widest min-w-[120px]">
                                Period
                            </th>
                            {DAYS.map(day => (
                                <th
                                    key={day}
                                    className="p-4 text-left text-xs font-bold text-primary uppercase tracking-widest min-w-[180px]"
                                >
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: maxPeriods }, (_, i) => i + 1).map(period => (
                            <tr key={period} className="border-b border-muted/30 hover:bg-bg/50 transition-colors group">
                                <td className="p-4 font-medium text-sm text-text/70 bg-bg/30">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-text group-hover:text-primary duration-200">Period {period}</span>
                                        {schedule[DAYS[0]]?.[period - 1]?.startTime && (
                                            <span className="text-xs text-text/40 flex items-center gap-1 mt-1">
                                                <FiClock className="w-3 h-3" />
                                                {schedule[DAYS[0]][period - 1].startTime} - {schedule[DAYS[0]][period - 1].endTime}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                {DAYS.map(day => {
                                    const entry = schedule[day]?.[period - 1];
                                    return (
                                        <td key={day} className="p-3">
                                            {entry && entry.subject && entry.subject.toLowerCase() !== 'free' ? (
                                                <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl hover:shadow-md hover:border-primary/40 transition-all cursor-default">
                                                    <div className="font-bold text-sm text-primary mb-1">
                                                        {entry.subject}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-text/70 font-medium">
                                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">
                                                            <FiMapPin className="w-3 h-3" />
                                                        </div>
                                                        {entry.className}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-muted/5 border border-dashed border-muted/40 rounded-xl text-center opacity-40">
                                                    <span className="text-xs font-medium text-text/30 italic">No Class</span>
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

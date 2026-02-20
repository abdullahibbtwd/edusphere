"use client";

import { FiClock } from "react-icons/fi";

type TimetableDisplayProps = {
    schedule: any; // JSON schedule from database
    className: string;
    term: string;
};

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const TimetableDisplay = ({ schedule, className, term }: TimetableDisplayProps) => {
    if (!schedule) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center">
                <FiClock className="w-16 h-16 text-text/20 mb-4" />
                <p className="text-text/60">No timetable generated yet</p>
            </div>
        );
    }

    // Get max periods across all days
    const maxPeriods = Math.max(
        ...DAYS.map(day => schedule[day]?.length || 0)
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-text">{className}</h3>
                    <p className="text-sm text-text/60">{term} Term</p>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-surface rounded-lg overflow-hidden shadow-sm">
                    <thead>
                        <tr className="bg-primary/10 border-b border-primary/20">
                            <th className="p-3 text-left text-xs font-semibold text-primary uppercase tracking-wider min-w-[100px]">
                                Period
                            </th>
                            {DAYS.map(day => (
                                <th
                                    key={day}
                                    className="p-3 text-left text-xs font-semibold text-primary uppercase tracking-wider min-w-[150px]"
                                >
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: maxPeriods }, (_, i) => i + 1).map(period => (
                            <tr key={period} className="border-b border-muted/30 hover:bg-bg/50 transition-colors">
                                <td className="p-3 font-medium text-sm text-text/70 bg-bg/30">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-text">Period {period}</span>
                                        {schedule[DAYS[0]]?.[period - 1]?.startTime && (
                                            <span className="text-xs text-text/50">
                                                {schedule[DAYS[0]][period - 1].startTime} - {schedule[DAYS[0]][period - 1].endTime}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                {DAYS.map(day => {
                                    const entry = schedule[day]?.[period - 1];
                                    return (
                                        <td key={day} className="p-2">
                                            {entry ? (
                                                <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
                                                    <div className="font-semibold text-sm text-text truncate">
                                                        {entry.subject}
                                                    </div>
                                                    <div className="text-xs text-text/60 truncate">
                                                        {entry.teacher}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-2 bg-muted/20 border border-muted/30 rounded-lg text-center">
                                                    <span className="text-xs text-text/30">Free</span>
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

export default TimetableDisplay;

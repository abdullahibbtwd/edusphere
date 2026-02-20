"use client";

import { useState } from "react";
import { FiX, FiCalendar, FiClock, FiActivity } from "react-icons/fi";

type WeekType = "NORMAL_CLASS" | "CA" | "EXAM" | "REVISION" | "HOLIDAY" | "OTHER";

type CalendarViewProps = {
    session: any;
    onClose: () => void;
};

const CalendarView = ({ session, onClose }: CalendarViewProps) => {
    const [activeTerm, setActiveTerm] = useState(0);

    const mapTypeToTitle = (type: WeekType) => {
        switch (type) {
            case "NORMAL_CLASS": return "Normal Class";
            case "CA": return "Continuous Assessment";
            case "EXAM": return "Examination";
            case "REVISION": return "Revision Week";
            case "HOLIDAY": return "Holiday / Break";
            default: return "Other Activity";
        }
    };

    const getTypeColor = (type: WeekType) => {
        switch (type) {
            case "NORMAL_CLASS": return "bg-blue-50 text-blue-700 border-blue-200";
            case "CA": return "bg-amber-50 text-amber-700 border-amber-200";
            case "EXAM": return "bg-red-50 text-red-700 border-red-200";
            case "REVISION": return "bg-purple-50 text-purple-700 border-purple-200";
            case "HOLIDAY": return "bg-green-50 text-green-700 border-green-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const calculateWeeksFromEvents = (term: any) => {
        if (!term.events || term.events.length === 0) return [];

        const weeks = [];
        const termStart = new Date(term.startDate);
        const termEnd = new Date(term.endDate);
        let current = new Date(termStart);
        let weekNum = 1;

        while (current < termEnd) {
            const weekStart = new Date(current);
            const weekEnd = new Date(current);
            weekEnd.setDate(weekEnd.getDate() + 6);
            const actualEnd = weekEnd > termEnd ? termEnd : weekEnd;

            // Find event that covers this week
            const event = term.events.find((e: any) => {
                const eStart = new Date(e.startDate);
                const eEnd = new Date(e.endDate);
                return weekStart >= eStart && weekStart <= eEnd;
            });

            weeks.push({
                weekNumber: weekNum,
                startDate: weekStart.toISOString().split('T')[0],
                endDate: actualEnd.toISOString().split('T')[0],
                type: event?.type || "NORMAL_CLASS",
                title: event?.title || "Normal Class"
            });

            current.setDate(current.getDate() + 7);
            weekNum++;
        }

        return weeks;
    };

    const currentTerm = session.terms[activeTerm];
    const weeks = calculateWeeksFromEvents(currentTerm);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-5xl bg-surface rounded-xl shadow-2xl relative max-h-[95vh] md:max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-muted">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                            <FiCalendar className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg md:text-2xl font-bold text-text truncate">{session.name}</h2>
                            <p className="text-xs md:text-sm text-text/60 truncate">
                                {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-text/60 hover:text-text transition-colors flex-shrink-0 ml-2"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Term Tabs */}
                <div className="flex gap-2 px-3 md:px-6 border-b border-muted overflow-x-auto h-[100px] scrollbar-hide">
                    {session.terms.map((term: any, idx: number) => (
                        <button
                            key={term.id}
                            onClick={() => setActiveTerm(idx)}
                            className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-medium rounded-t-lg transition-all whitespace-nowrap flex-shrink-0 ${activeTerm === idx
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-bg text-text/60 hover:bg-muted"
                                }`}
                        >
                            <FiClock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">{term.name} Term</span>
                            <span className="sm:hidden">{term.name}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3 md:p-6">
                    {/* Term Info */}
                    <div className="mb-4 md:mb-6 p-3 md:p-4 bg-bg/50 rounded-lg border border-muted">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            <div>
                                <p className="text-xs text-text/60 mb-1">Start Date</p>
                                <p className="font-semibold text-text text-sm md:text-base">
                                    {new Date(currentTerm.startDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-text/60 mb-1">End Date</p>
                                <p className="font-semibold text-text text-sm md:text-base">
                                    {new Date(currentTerm.endDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Weeks Grid */}
                    <div>
                        <h3 className="text-base md:text-lg font-semibold text-text mb-3 md:mb-4 flex items-center gap-2">
                            <FiActivity className="w-4 h-4 md:w-5 md:h-5" />
                            Week Schedule ({weeks.length} weeks)
                        </h3>

                        {weeks.length === 0 ? (
                            <div className="text-center py-10 text-text/40 italic text-sm">
                                No week configuration found for this term.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                                {weeks.map((week) => (
                                    <div
                                        key={week.weekNumber}
                                        className={`p-3 md:p-4 rounded-lg border ${getTypeColor(week.type)} transition-all hover:shadow-md`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-bold text-sm md:text-base">Week {week.weekNumber}</h4>
                                                <p className="text-xs opacity-80 mt-0.5">
                                                    {new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(week.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                            <FiActivity className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-60" />
                                        </div>
                                        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-current/20">
                                            <p className="text-xs font-semibold uppercase tracking-wide">
                                                {mapTypeToTitle(week.type)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Events Summary */}
                    {currentTerm.events && currentTerm.events.length > 0 && (
                        <div className="mt-4 md:mt-6 p-3 md:p-4 bg-bg/50 rounded-lg border border-muted">
                            <h4 className="font-semibold text-sm text-text mb-3">Activity Summary</h4>
                            <div className="space-y-2">
                                {currentTerm.events.map((event: any, idx: number) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs md:text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getTypeColor(event.type).split(' ')[0]}`}></div>
                                            <span className="font-medium">{event.title}</span>
                                        </div>
                                        <span className="text-text/60 text-xs sm:text-sm ml-5 sm:ml-0">
                                            {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 md:p-4 border-t border-muted flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 md:px-6 py-2 bg-muted text-text rounded-lg hover:bg-muted/80 transition-colors text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;

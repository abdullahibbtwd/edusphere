"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FiCalendar, FiChevronRight, FiSave, FiActivity, FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";

type CalendarSetupProps = {
    schoolId: string;
    onSuccess: () => void;
    initialData?: any;
    onCancel?: () => void;
};

type WeekType = "NORMAL_CLASS" | "CA" | "EXAM" | "REVISION" | "HOLIDAY" | "OTHER";

type WeekConfig = {
    weekNumber: number;
    startDate: string;
    endDate: string;
    type: WeekType;
    title: string;
};

type TermData = {
    name: string;
    startDate: string;
    endDate: string;
    id?: string;
    weeks: WeekConfig[];
};

const CalendarSetup = ({ schoolId, onSuccess, initialData, onCancel }: CalendarSetupProps) => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const isEditing = !!initialData;

    const [sessionData, setSessionData] = useState({
        name: "",
        startDate: "",
        endDate: "",
    });

    const [termsData, setTermsData] = useState<TermData[]>([
        { name: "FIRST", startDate: "", endDate: "", weeks: [] },
        { name: "SECOND", startDate: "", endDate: "", weeks: [] },
        { name: "THIRD", startDate: "", endDate: "", weeks: [] },
    ]);

    const [activeTermIndex, setActiveTermIndex] = useState(0);
    const [bulkStart, setBulkStart] = useState(1);
    const [bulkEnd, setBulkEnd] = useState(1);
    const [bulkType, setBulkType] = useState<WeekType>("NORMAL_CLASS");

    // Calculate weeks between two dates
    const calculateWeeks = (start: string, end: string): WeekConfig[] => {
        if (!start || !end) return [];
        const startDate = new Date(start);
        const endDate = new Date(end);
        const weeks: WeekConfig[] = [];
        let current = new Date(startDate);
        let weekNum = 1;

        while (current < endDate) {
            const weekStart = new Date(current);
            const weekEnd = new Date(current);
            weekEnd.setDate(weekEnd.getDate() + 6);
            const actualEnd = weekEnd > endDate ? endDate : weekEnd;

            weeks.push({
                weekNumber: weekNum,
                startDate: weekStart.toISOString().split('T')[0],
                endDate: actualEnd.toISOString().split('T')[0],
                type: "NORMAL_CLASS",
                title: `Week ${weekNum}`,
            });

            current.setDate(current.getDate() + 7);
            weekNum++;
        }
        return weeks;
    };

    // Pre-fill data if editing
    useEffect(() => {
        if (initialData) {
            setSessionData({
                name: initialData.name,
                startDate: new Date(initialData.startDate).toISOString().split('T')[0],
                endDate: new Date(initialData.endDate).toISOString().split('T')[0],
            });

            if (initialData.terms && initialData.terms.length > 0) {
                setTermsData(prevTerms => {
                    return prevTerms.map(defaultTerm => {
                        const existing = initialData.terms.find((t: any) => t.name === defaultTerm.name);
                        if (!existing) return defaultTerm;

                        const calculatedWeeks = calculateWeeks(
                            new Date(existing.startDate).toISOString().split('T')[0],
                            new Date(existing.endDate).toISOString().split('T')[0]
                        );

                        // Overlay existing events onto weeks
                        if (existing.events && existing.events.length > 0) {
                            calculatedWeeks.forEach(w => {
                                const event = existing.events.find((e: any) => {
                                    const eStart = new Date(e.startDate);
                                    const eEnd = new Date(e.endDate);
                                    const wStart = new Date(w.startDate);
                                    return wStart >= eStart && wStart <= eEnd;
                                });
                                if (event) {
                                    w.type = event.type;
                                }
                            });
                        }

                        return {
                            ...defaultTerm,
                            startDate: new Date(existing.startDate).toISOString().split('T')[0],
                            endDate: new Date(existing.endDate).toISOString().split('T')[0],
                            id: existing.id,
                            weeks: calculatedWeeks
                        };
                    });
                });
            }
        }
    }, [initialData]);

    const handleSessionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionData.name || !sessionData.startDate || !sessionData.endDate) {
            toast.error("Please fill in all session details");
            return;
        }
        if (new Date(sessionData.startDate) >= new Date(sessionData.endDate)) {
            toast.error("Session start date must be before end date");
            return;
        }
        setStep(2);
    };

    const handleDatesSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        for (const term of termsData) {
            if (!term.startDate || !term.endDate) {
                toast.error(`Please fill in dates for ${term.name} Term`);
                return;
            }
            if (new Date(term.startDate) >= new Date(term.endDate)) {
                toast.error(`${term.name} Term start date must be before end date`);
                return;
            }
            if (
                new Date(term.startDate) < new Date(sessionData.startDate) ||
                new Date(term.endDate) > new Date(sessionData.endDate)
            ) {
                toast.error(`${term.name} Term dates must be within Session dates`);
                return;
            }
        }

        // Generate/update weeks, preserving existing configurations
        const updatedTerms = termsData.map(term => {
            const newWeeks = calculateWeeks(term.startDate, term.endDate);

            // Preserve existing week types if they exist
            if (term.weeks && term.weeks.length > 0) {
                newWeeks.forEach(newWeek => {
                    const oldWeek = term.weeks.find(w => w.weekNumber === newWeek.weekNumber);
                    if (oldWeek) {
                        newWeek.type = oldWeek.type;
                    }
                });
            }

            return { ...term, weeks: newWeeks };
        });

        setTermsData(updatedTerms);
        setStep(3);
    };

    const handleBulkAssign = () => {
        if (bulkStart > bulkEnd) {
            toast.error("Start week must be before or equal to End week");
            return;
        }

        if (bulkStart < 1 || bulkEnd > currentTermWeeks.length) {
            toast.error(`Week numbers must be between 1 and ${currentTermWeeks.length}`);
            return;
        }

        setTermsData(prev => {
            const newTerms = [...prev];
            const term = newTerms[activeTermIndex];
            const updatedWeeks = term.weeks.map(w => {
                if (w.weekNumber >= bulkStart && w.weekNumber <= bulkEnd) {
                    return { ...w, type: bulkType };
                }
                return w;
            });
            newTerms[activeTermIndex] = { ...term, weeks: updatedWeeks };
            return newTerms;
        });

        toast.success(`Assigned ${mapTypeToTitle(bulkType)} to Weeks ${bulkStart}-${bulkEnd} of ${termsData[activeTermIndex].name} Term`);
    };

    const currentTermWeeks = termsData[activeTermIndex]?.weeks || [];

    const handleFinalSubmit = async () => {
        try {
            setLoading(true);
            let sessionId = initialData?.id;

            if (isEditing) {
                const sessionRes = await fetch(`/api/schools/${schoolId}/academic-calendar/${sessionId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...sessionData,
                        isActive: initialData.isActive,
                    }),
                });
                if (!sessionRes.ok) throw new Error("Failed to update session");
            } else {
                const sessionRes = await fetch(`/api/schools/${schoolId}/academic-calendar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...sessionData,
                        isActive: true,
                    }),
                });
                const sessionResult = await sessionRes.json();
                if (!sessionRes.ok) throw new Error(sessionResult.error);
                sessionId = sessionResult.session.id;
            }

            // Save terms and events
            await Promise.all(
                termsData.map(async (term) => {
                    let termId = term.id;

                    // Save/Update Term
                    if (isEditing && termId) {
                        await fetch(`/api/schools/${schoolId}/academic-calendar/${sessionId}/terms/${termId}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ startDate: term.startDate, endDate: term.endDate })
                        });
                    } else {
                        const termRes = await fetch(`/api/schools/${schoolId}/academic-calendar/${sessionId}/terms`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name: term.name,
                                startDate: term.startDate,
                                endDate: term.endDate,
                                isActive: term.name === "FIRST",
                            }),
                        });
                        const termData = await termRes.json();
                        termId = termData.term.id;
                    }

                    // Save week events (always clear and recreate for consistency)
                    if (termId && term.weeks.length > 0) {
                        // Clear existing events
                        await fetch(`/api/schools/${schoolId}/academic-calendar/terms/${termId}/events`, {
                            method: "DELETE",
                        });

                        // Consolidate contiguous weeks of same type
                        const eventsToCreate = [];
                        let currentEvent: any = null;

                        for (const week of term.weeks) {
                            if (!currentEvent) {
                                currentEvent = { ...week };
                            } else {
                                if (week.type === currentEvent.type) {
                                    currentEvent.endDate = week.endDate;
                                } else {
                                    eventsToCreate.push(currentEvent);
                                    currentEvent = { ...week };
                                }
                            }
                        }
                        if (currentEvent) eventsToCreate.push(currentEvent);

                        // Create consolidated events
                        for (const evt of eventsToCreate) {
                            await fetch(`/api/schools/${schoolId}/academic-calendar/terms/${termId}/events`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    title: mapTypeToTitle(evt.type),
                                    type: evt.type,
                                    startDate: evt.startDate,
                                    endDate: evt.endDate,
                                    description: `Week configuration`
                                })
                            });
                        }
                    }
                })
            );

            toast.success(isEditing ? "Academic Calendar Updated!" : "Academic Calendar Setup Successfully!");
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save calendar");
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-muted w-full max-w-4xl mx-auto h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-muted pb-4 flex-none">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FiCalendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text">{isEditing ? "Edit Academic Calendar" : "Setup Academic Calendar"}</h2>
                        <p className="text-sm text-text/60">
                            {isEditing ? `Update session: ${sessionData.name}` : "Define the academic session, terms, and schedule."}
                        </p>
                    </div>
                </div>
                {onCancel && (
                    <button onClick={onCancel} className="text-sm text-text/50 hover:text-text px-3 py-1 bg-muted/20 rounded-md">Cancel</button>
                )}
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-4 text-sm flex-none">
                <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary font-medium" : "text-text/40"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step >= 1 ? "bg-primary text-white border-primary" : "border-muted"}`}>1</span>
                    Session
                </div>
                <div className="w-8 h-px bg-muted"></div>
                <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary font-medium" : "text-text/40"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step >= 2 ? "bg-primary text-white border-primary" : "border-muted"}`}>2</span>
                    Term Dates
                </div>
                <div className="w-8 h-px bg-muted"></div>
                <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary font-medium" : "text-text/40"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step >= 3 ? "bg-primary text-white border-primary" : "border-muted"}`}>3</span>
                    Week Management
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                {step === 1 && (
                    <form onSubmit={handleSessionSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-text/80">Session Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. 2025/2026 Academic Session"
                                className="w-full px-4 py-2.5 bg-bg border border-muted rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                value={sessionData.name}
                                onChange={(e) => setSessionData({ ...sessionData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text/80">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2.5 bg-bg border border-muted rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    value={sessionData.startDate}
                                    onChange={(e) => setSessionData({ ...sessionData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text/80">End Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2.5 bg-bg border border-muted rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    value={sessionData.endDate}
                                    onChange={(e) => setSessionData({ ...sessionData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2 text-sm font-medium"
                            >
                                Next Step <FiChevronRight />
                            </button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleDatesSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-4">
                            {termsData.map((term, index) => (
                                <div key={term.name} className="p-4 border border-muted rounded-lg bg-bg/50">
                                    <h4 className="font-semibold text-sm text-text mb-3">{term.name} Term</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-text/60">Start Date</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-3 py-2 bg-white border border-muted rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                value={term.startDate}
                                                min={sessionData.startDate}
                                                max={sessionData.endDate}
                                                onChange={(e) => {
                                                    const newTerms = [...termsData];
                                                    newTerms[index].startDate = e.target.value;
                                                    setTermsData(newTerms);
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-text/60">End Date</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-3 py-2 bg-white border border-muted rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                value={term.endDate}
                                                min={sessionData.startDate}
                                                max={sessionData.endDate}
                                                onChange={(e) => {
                                                    const newTerms = [...termsData];
                                                    newTerms[index].endDate = e.target.value;
                                                    setTermsData(newTerms);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 flex justify-between items-center border-t border-muted">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-text/60 hover:text-text px-4 py-2"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2 text-sm font-medium"
                            >
                                Next Step <FiChevronRight />
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 h-full flex flex-col">
                        {/* Term Selector */}
                        <div className="flex gap-2 border-b border-muted pb-2 overflow-x-auto">
                            {termsData.map((term, idx) => (
                                <button
                                    key={term.name}
                                    type="button"
                                    onClick={() => {
                                        setActiveTermIndex(idx);
                                        setBulkEnd(term.weeks.length || 1);
                                    }}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTermIndex === idx
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "bg-bg text-text/60 hover:bg-muted"
                                        }`}
                                >
                                    {term.name} Term ({term.weeks.length} weeks)
                                </button>
                            ))}
                        </div>

                        {/* Bulk Action Bar */}
                        <div className="bg-surface border border-muted p-4 rounded-lg shadow-sm flex flex-wrap items-end gap-4">
                            <div>
                                <label className="text-xs text-text/60 block mb-1">From Week</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={currentTermWeeks.length}
                                    value={bulkStart}
                                    onChange={(e) => setBulkStart(parseInt(e.target.value) || 1)}
                                    className="w-20 px-3 py-2 text-sm border border-muted rounded bg-bg focus:border-primary outline-none"
                                />
                            </div>
                            <div className="pb-2 text-text/40"><FiArrowRight /></div>
                            <div>
                                <label className="text-xs text-text/60 block mb-1">To Week</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={currentTermWeeks.length}
                                    value={bulkEnd}
                                    onChange={(e) => setBulkEnd(parseInt(e.target.value) || 1)}
                                    className="w-20 px-3 py-2 text-sm border border-muted rounded bg-bg focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text/60 block mb-1">Activity Type</label>
                                <select
                                    value={bulkType}
                                    onChange={(e) => setBulkType(e.target.value as WeekType)}
                                    className="w-48 px-3 py-2 text-sm border border-muted rounded bg-bg focus:border-primary outline-none"
                                >
                                    <option value="NORMAL_CLASS">Normal Class</option>
                                    <option value="CA">Continuous Assessment (CA)</option>
                                    <option value="REVISION">Revision</option>
                                    <option value="EXAM">Examination</option>
                                    <option value="HOLIDAY">Holiday / Break</option>
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={handleBulkAssign}
                                className="px-4 py-2 bg-zinc-800 text-white text-sm font-medium rounded hover:bg-zinc-900 transition-colors"
                            >
                                Apply
                            </button>
                        </div>

                        {/* Weeks Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[300px] border border-muted rounded-lg p-2 bg-bg/20">
                            {currentTermWeeks.length === 0 ? (
                                <div className="col-span-2 text-center py-10 text-text/40 italic">
                                    No weeks generated. Check dates.
                                </div>
                            ) : (
                                currentTermWeeks.map((week) => (
                                    <div
                                        key={week.weekNumber}
                                        className={`p-3 rounded border text-sm flex items-center justify-between ${getTypeColor(week.type)}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold">Week {week.weekNumber}</span>
                                            <span className="text-xs opacity-80">{week.startDate} - {week.endDate}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/50 rounded text-xs font-semibold backdrop-blur-sm">
                                            <FiActivity className="w-3 h-3" />
                                            {mapTypeToTitle(week.type)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-4 flex justify-between items-center border-t border-muted">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="text-sm text-text/60 hover:text-text px-4 py-2"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleFinalSubmit}
                                disabled={loading}
                                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-70"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <FiSave />
                                )}
                                Save Calendar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarSetup;

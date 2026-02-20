"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiClock, FiPlus, FiTrash2, FiX } from "react-icons/fi";

type Break = {
    id: string;
    startTime: string; // "10:00"
    endTime: string;   // "10:30"
    name: string;      // "Break" or "Lunch" or custom
};

type TimetableConfigFormProps = {
    schoolId: string;
    onSuccess: (config: any) => void;
    onCancel: () => void;
    initialData?: any;
};

const TimetableConfigForm = ({
    schoolId,
    onSuccess,
    onCancel,
    initialData
}: TimetableConfigFormProps) => {
    const [startTime, setStartTime] = useState(initialData?.schoolStartTime || "08:00");
    const [endTime, setEndTime] = useState(initialData?.schoolEndTime || "14:00");
    const [periodDuration, setPeriodDuration] = useState(initialData?.periodDuration || 40);
    const [breaks, setBreaks] = useState<Break[]>(
        initialData?.breaks || []
    );
    const [saving, setSaving] = useState(false);

    // Calculate total periods based on time and breaks
    const calculatePeriods = () => {
        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);

        const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

        // Calculate total break time
        let breakMinutes = 0;
        for (const brk of breaks) {
            const [bStartHour, bStartMin] = brk.startTime.split(":").map(Number);
            const [bEndHour, bEndMin] = brk.endTime.split(":").map(Number);
            const duration = (bEndHour * 60 + bEndMin) - (bStartHour * 60 + bStartMin);
            breakMinutes += duration;
        }

        const teachingMinutes = totalMinutes - breakMinutes;
        return Math.floor(teachingMinutes / periodDuration);
    };

    const totalPeriods = calculatePeriods();

    const addBreak = () => {
        // Default break: 10:00 - 10:15
        setBreaks([
            ...breaks,
            {
                id: Date.now().toString(),
                startTime: "10:00",
                endTime: "10:15",
                name: "Break"
            }
        ]);
    };

    const removeBreak = (id: string) => {
        setBreaks(breaks.filter(b => b.id !== id));
    };

    const updateBreak = (id: string, field: keyof Break, value: any) => {
        setBreaks(breaks.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Validation
            if (totalPeriods < 1) {
                toast.error("Invalid time configuration. Not enough time for periods.");
                return;
            }

            // Validate breaks are within school hours
            for (const brk of breaks) {
                if (brk.startTime < startTime || brk.endTime > endTime) {
                    toast.error(`Break "${brk.name}" is outside school hours`);
                    return;
                }
                if (brk.startTime >= brk.endTime) {
                    toast.error(`Break "${brk.name}" has invalid time range`);
                    return;
                }
            }

            const response = await fetch(`/api/schools/${schoolId}/timetable/config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    schoolStartTime: startTime,
                    schoolEndTime: endTime,
                    periodDuration,
                    breaks,
                    workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Configuration saved!");
                onSuccess(data.config);
            } else {
                toast.error(data.error || "Failed to save configuration");
            }
        } catch (error) {
            toast.error("Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-2xl bg-surface rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-muted sticky top-0 bg-surface z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-text">Timetable Configuration</h2>
                        <p className="text-sm text-text/60 mt-1">
                            Set up your school hours and break times
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-text/60 hover:text-text transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-6">
                    {/* School Hours */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-text flex items-center gap-2">
                            <FiClock className="w-5 h-5 text-primary" />
                            School Hours
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text/70 mb-2">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-muted bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text/70 mb-2">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-muted bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text/70 mb-2">
                                Period Duration (minutes)
                            </label>
                            <input
                                type="number"
                                min="20"
                                max="90"
                                value={periodDuration}
                                onChange={(e) => setPeriodDuration(Number(e.target.value))}
                                className="w-full px-4 py-2 rounded-lg border border-muted bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Breaks */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-text">Break Times (Optional)</h3>
                            <button
                                onClick={addBreak}
                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <FiPlus className="w-4 h-4" />
                                Add Break
                            </button>
                        </div>

                        {breaks.length === 0 && (
                            <p className="text-sm text-text/40 italic text-center py-4">
                                No breaks configured. Click "Add Break" to add one.
                            </p>
                        )}

                        {breaks.map((brk) => (
                            <div key={brk.id} className="p-4 bg-bg rounded-lg border border-muted space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={brk.name}
                                        onChange={(e) => updateBreak(brk.id, "name", e.target.value)}
                                        placeholder="Break name (e.g., Lunch, Short Break)"
                                        className="flex-1 px-3 py-2 rounded-lg border border-muted bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button
                                        onClick={() => removeBreak(brk.id)}
                                        className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 transition-colors"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-text/60 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={brk.startTime}
                                            onChange={(e) => updateBreak(brk.id, "startTime", e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-muted bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-text/60 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={brk.endTime}
                                            onChange={(e) => updateBreak(brk.id, "endTime", e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-muted bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <h4 className="font-semibold text-text mb-2">Summary</h4>
                        <div className="space-y-1 text-sm text-text/70">
                            <p>Total Periods per Day: <span className="font-bold text-primary">{totalPeriods}</span></p>
                            <p>Teaching Time: {startTime} - {endTime}</p>
                            <p>Period Duration: {periodDuration} minutes</p>
                            <p>Total Breaks: {breaks.length}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-muted flex justify-end gap-3 sticky bottom-0 bg-surface">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 bg-muted text-text rounded-lg hover:bg-muted/80 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || totalPeriods < 1}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                        {saving ? "Saving..." : "Save & Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimetableConfigForm;

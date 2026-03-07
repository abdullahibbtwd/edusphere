/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiSave, FiX } from "react-icons/fi";

type ExamConfig = {
    examsPerDay: number;
    examDuration: number;
    breakBetweenExams: number;
    examStartTime: string;
};

type ExamConfigFormProps = {
    schoolId: string;
    initialConfig?: ExamConfig | null;
    onSuccess: (config: ExamConfig) => void;
    onCancel: () => void;
};

const ExamConfigForm = ({ schoolId, initialConfig, onSuccess, onCancel }: ExamConfigFormProps) => {
    const [form, setForm] = useState<ExamConfig>({
        examsPerDay: initialConfig?.examsPerDay ?? 2,
        examDuration: initialConfig?.examDuration ?? 120,
        breakBetweenExams: initialConfig?.breakBetweenExams ?? 30,
        examStartTime: initialConfig?.examStartTime ?? "09:00",
    });
    const [saving, setSaving] = useState(false);

    const handle = (field: keyof ExamConfig) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const val = field === "examStartTime" ? e.target.value : Number(e.target.value);
        setForm(prev => ({ ...prev, [field]: val }));
    };

    // Preview computed time slots
    const preview: { start: string; end: string }[] = [];
    {
        const [h, m] = form.examStartTime.split(":").map(Number);
        let cur = h * 60 + m;
        for (let i = 0; i < form.examsPerDay; i++) {
            const s = cur;
            const e2 = cur + form.examDuration;
            const fmt = (mins: number) =>
                `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
            preview.push({ start: fmt(s), end: fmt(e2) });
            cur = e2 + form.breakBetweenExams;
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const res = await fetch(`/api/schools/${schoolId}/exam-timetable/config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save");
            toast.success("Exam configuration saved");
            onSuccess(data.config);
        } catch (err: any) {
            toast.error(err.message || "Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-base font-bold text-text">Exam Configuration</h2>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <FiX className="w-4 h-4 text-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Exams per day</label>
                            <select
                                value={form.examsPerDay}
                                onChange={handle("examsPerDay")}
                                className="w-full h-9 px-3 rounded-lg bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                {[1, 2, 3, 4].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">First exam start</label>
                            <input
                                type="time"
                                value={form.examStartTime}
                                onChange={handle("examStartTime")}
                                className="w-full h-9 px-3 rounded-lg bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                min={30}
                                max={300}
                                step={15}
                                value={form.examDuration}
                                onChange={handle("examDuration")}
                                className="w-full h-9 px-3 rounded-lg bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Break between exams (min)</label>
                            <input
                                type="number"
                                min={0}
                                max={120}
                                step={5}
                                value={form.breakBetweenExams}
                                onChange={handle("breakBetweenExams")}
                                className="w-full h-9 px-3 rounded-lg bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    {/* Time slot preview */}
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                        <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Daily time slots preview</p>
                        <div className="flex flex-wrap gap-2">
                            {preview.map((slot, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                                >
                                    Slot {i + 1}: {slot.start} – {slot.end}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 h-9 rounded-lg border border-border text-text text-sm font-medium hover:bg-muted/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 h-9 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
                        >
                            <FiSave className="w-4 h-4" />
                            {saving ? "Saving…" : "Save config"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExamConfigForm;

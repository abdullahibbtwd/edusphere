"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FiX, FiCheck, FiChevronDown, FiChevronRight, FiClock } from "react-icons/fi";
// Removed missing checkbox import

type Props = {
    schoolId: string;
    onClose: () => void;
    onSuccess: () => void;
};

type SubjectAssignment = {
    id: string; // TeacherSubjectClass ID
    subjectId: string;
    name: string;
    code: string;
    teacherName: string;
    requiresDoublePeriod: boolean;
    hoursPerWeek: number;
};

type ClassGroup = {
    id: string;
    name: string;
    subjects: SubjectAssignment[];
};

type LevelGroup = {
    id: string;
    name: string;
    classes: ClassGroup[];
};

const DoublePeriodConfigModal = ({ schoolId, onClose, onSuccess }: Props) => {
    const [loading, setLoading] = useState(true);
    const [levels, setLevels] = useState<LevelGroup[]>([]);
    const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
    const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
    const [changes, setChanges] = useState<Map<string, boolean>>(new Map()); // id -> newValue
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [schoolId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/schools/${schoolId}/timetable/subjects-by-class`);
            const data = await response.json();

            if (response.ok) {
                setLevels(data.levels);
                // Expand first level by default
                if (data.levels.length > 0) {
                    const firstLevel = data.levels[0];
                    setExpandedLevels(new Set([firstLevel.id]));
                    // Expand first class of first level
                    if (firstLevel.classes.length > 0) {
                        setExpandedClasses(new Set([firstLevel.classes[0].id]));
                    }
                }
            } else {
                toast.error("Failed to load subjects");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error loading configuration");
        } finally {
            setLoading(false);
        }
    };

    const toggleLevel = (id: string) => {
        const newSet = new Set(expandedLevels);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedLevels(newSet);
    };

    const toggleClass = (id: string) => {
        const newSet = new Set(expandedClasses);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedClasses(newSet);
    };

    const handleToggleDoublePeriod = (assignmentId: string, currentValue: boolean) => {
        // Check if we already have a change for this ID
        const existingChange = changes.get(assignmentId);

        // Determine the new state
        // If no change pending, toggle current value
        // If change pending, toggle that
        const nextValue = existingChange !== undefined ? !existingChange : !currentValue;

        // If nextValue matches original (currentValue), remove from changes map
        if (nextValue === currentValue) {
            const newChanges = new Map(changes);
            newChanges.delete(assignmentId);
            setChanges(newChanges);
        } else {
            const newChanges = new Map(changes);
            newChanges.set(assignmentId, nextValue);
            setChanges(newChanges);
        }
    };

    const getEffectiveValue = (assignment: SubjectAssignment) => {
        return changes.has(assignment.id) ? changes.get(assignment.id)! : assignment.requiresDoublePeriod;
    };

    const handleSave = async () => {
        if (changes.size === 0) {
            onClose();
            return;
        }

        try {
            setSaving(true);
            const updates = Array.from(changes.entries()).map(([id, requiresDoublePeriod]) => ({
                id,
                requiresDoublePeriod
            }));

            const response = await fetch(`/api/schools/${schoolId}/timetable/update-double-periods`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            });

            if (response.ok) {
                toast.success(`Updated ${updates.length} subjects`);
                onSuccess();
                onClose();
            } else {
                toast.error("Failed to save changes");
            }
        } catch (error) {
            toast.error("Error saving changes");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-4xl bg-surface rounded-xl shadow-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-muted">
                    <div>
                        <h2 className="text-xl font-bold text-text flex items-center gap-2">
                            <FiClock className="w-5 h-5 text-primary" />
                            Configure Double Periods
                        </h2>
                        <p className="text-sm text-text/60 mt-1">
                            Select subjects that require consecutive periods (double blocks) on the timetable.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-text/60 hover:text-text transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-bg/50">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {levels.map(level => (
                                <div key={level.id} className="bg-surface rounded-lg border border-muted overflow-hidden">
                                    <button
                                        onClick={() => toggleLevel(level.id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                                    >
                                        <span className="font-semibold text-text">{level.name}</span>
                                        {expandedLevels.has(level.id) ?
                                            <FiChevronDown className="w-5 h-5 text-text/40" /> :
                                            <FiChevronRight className="w-5 h-5 text-text/40" />
                                        }
                                    </button>

                                    {expandedLevels.has(level.id) && (
                                        <div className="border-t border-muted bg-bg/30">
                                            {level.classes.map(cls => (
                                                <div key={cls.id} className="border-b border-muted last:border-0">
                                                    <button
                                                        onClick={() => toggleClass(cls.id)}
                                                        className="w-full flex items-center justify-between p-3 pl-8 hover:bg-muted/50 transition-colors"
                                                    >
                                                        <span className="font-medium text-text/80 text-sm">{cls.name}</span>
                                                        {expandedClasses.has(cls.id) ?
                                                            <FiChevronDown className="w-4 h-4 text-text/40" /> :
                                                            <FiChevronRight className="w-4 h-4 text-text/40" />
                                                        }
                                                    </button>

                                                    {expandedClasses.has(cls.id) && (
                                                        <div className="p-3 pl-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-surface">
                                                            {cls.subjects.map(subject => {
                                                                const isChecked = getEffectiveValue(subject);
                                                                const hasChange = changes.has(subject.id);

                                                                return (
                                                                    <div
                                                                        key={subject.id}
                                                                        onClick={() => handleToggleDoublePeriod(subject.id, subject.requiresDoublePeriod)}
                                                                        className={`
                                                                    flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                                                    ${isChecked
                                                                                ? 'bg-primary/5 border-primary/30'
                                                                                : 'bg-bg border-muted hover:border-primary/30'
                                                                            }
                                                                    ${hasChange ? 'ring-1 ring-offset-1 ring-yellow-400' : ''}
                                                                `}
                                                                    >
                                                                        <div className={`
                                                                    w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                                                                    ${isChecked
                                                                                ? 'bg-primary border-primary text-white'
                                                                                : 'bg-white border-muted'
                                                                            }
                                                                `}>
                                                                            {isChecked && <FiCheck className="w-3.5 h-3.5" />}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className={`text-sm font-medium truncate ${isChecked ? 'text-primary' : 'text-text'}`}>
                                                                                {subject.name}
                                                                            </p>
                                                                            <p className="text-xs text-text/50 truncate">
                                                                                {subject.teacherName} • {subject.hoursPerWeek} hrs/wk
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            {cls.subjects.length === 0 && (
                                                                <p className="text-sm text-text/40 italic col-span-full">No subjects assigned yet.</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {level.classes.length === 0 && (
                                                <p className="p-4 text-sm text-text/40 italic">No classes in this level.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {levels.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-text/60">No configuration data available.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-muted flex justify-between items-center bg-surface">
                    <div className="text-sm">
                        {changes.size > 0 ? (
                            <span className="text-amber-600 font-medium">
                                {changes.size} change{changes.size !== 1 ? 's' : ''} pending
                            </span>
                        ) : (
                            <span className="text-text/40">No changes made</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-muted text-text rounded-lg hover:bg-muted/80 transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || changes.size === 0}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm shadow-lg shadow-primary/20"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoublePeriodConfigModal;

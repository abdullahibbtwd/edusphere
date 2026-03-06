"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import StudentTimetableDisplay from "./StudentTimetableDisplay";
import { FiLoader, FiAlertCircle } from "react-icons/fi";

const StudentCalendar = () => {
  const params = useParams();
  const schoolId = params.school as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string>("");
  const [timetable, setTimetable] = useState<{
    className: string;
    term: string;
    schedule: Record<string, { subject?: string; teacher?: string; startTime?: string; endTime?: string }[]>;
  } | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>("FIRST");

  useEffect(() => {
    if (!schoolId) return;
    fetch(`/api/schools/${schoolId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data?.name && setSchoolName(data.name))
      .catch(() => {});
  }, [schoolId]);

  const fetchMyClassTimetable = useCallback(async () => {
    if (!schoolId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/schools/${schoolId}/timetable/my-class?term=${selectedTerm}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch timetable");
      }

      const data = await response.json();
      const tt = data.timetable;

      if (!tt) {
        setTimetable({
          className: data.student?.className || "My Class",
          term: data.term || selectedTerm,
          schedule: {}
        });
        return;
      }

      setTimetable({
        className: tt.className,
        term: tt.term,
        schedule: (tt.schedule || {}) as Record<string, { subject?: string; teacher?: string; startTime?: string; endTime?: string }[]>
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load timetable";
      setError(message);
      setTimetable(null);
    } finally {
      setLoading(false);
    }
  }, [schoolId, selectedTerm]);

  useEffect(() => {
    fetchMyClassTimetable();
  }, [fetchMyClassTimetable]);

  if (loading) {
    return (
      <div className="flex flex-col bg-surface border border-border rounded-xl shadow-sm p-4 sm:p-5 min-h-[240px] sm:min-h-[280px] items-center justify-center py-10 sm:py-12">
        <FiLoader className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin mb-2" />
        <p className="text-xs sm:text-sm text-muted">Loading your class timetable...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col bg-surface border border-border rounded-xl shadow-sm p-4 sm:p-5 min-h-[240px] sm:min-h-[280px] items-center justify-center py-10 sm:py-12 text-center px-4">
        <FiAlertCircle className="w-9 h-9 sm:w-10 sm:h-10 text-danger mb-2 sm:mb-3" />
        <h3 className="text-sm sm:text-base font-semibold text-text mb-1">Error loading timetable</h3>
        <p className="text-xs sm:text-sm text-muted mb-3 sm:mb-4 max-w-xs">{error}</p>
        <button
          onClick={() => fetchMyClassTimetable()}
          className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface border border-border rounded-xl shadow-sm p-3 sm:p-4 md:p-5 gap-3 sm:gap-4 md:gap-5 font-poppins text-text min-w-0">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-text truncate">My Class Timetable</h1>
          <p className="text-xs text-muted mt-0.5">View your weekly schedule by term</p>
        </div>
        <div className="w-full sm:w-32 sm:shrink-0">
          <label htmlFor="term-select" className="block text-xs font-medium text-muted mb-1">Term</label>
          <select
            id="term-select"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            <option value="FIRST">First Term</option>
            <option value="SECOND">Second Term</option>
            <option value="THIRD">Third Term</option>
          </select>
        </div>
      </header>

      {timetable && (
        <section className="rounded-lg sm:rounded-xl border border-border bg-bg/30 p-3 sm:p-4 md:p-5 shadow-sm min-w-0 overflow-hidden">
          <StudentTimetableDisplay
            schedule={timetable.schedule}
            className={timetable.className}
            term={timetable.term}
            schoolName={schoolName || undefined}
          />
        </section>
      )}
    </div>
  );
};

export default StudentCalendar;

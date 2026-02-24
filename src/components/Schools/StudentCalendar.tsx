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
      <div className="flex flex-col items-center justify-center min-h-[280px] sm:min-h-[360px] bg-surface/50 rounded-2xl shadow-sm">
        <FiLoader className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-text/60 font-medium">Loading your class timetable...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] sm:min-h-[360px] bg-surface/50 rounded-2xl shadow-sm p-4 sm:p-6 text-center">
        <FiAlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-danger mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-bold text-text mb-2">Error Loading Timetable</h3>
        <p className="text-sm text-text/60 mb-4 sm:mb-6">{error}</p>
        <button
          onClick={() => fetchMyClassTimetable()}
          className="px-5 py-2 sm:px-6 sm:py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
        <label htmlFor="term-select" className="text-xs font-semibold text-text/60 uppercase tracking-wider sm:sr-only">Term</label>
        <select
          id="term-select"
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="w-full sm:w-auto px-3 py-2.5 sm:px-4 sm:py-2 rounded-xl bg-surface text-text text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
        >
          <option value="FIRST">First Term</option>
          <option value="SECOND">Second Term</option>
          <option value="THIRD">Third Term</option>
        </select>
      </div>

      {timetable && (
        <StudentTimetableDisplay
          schedule={timetable.schedule}
          className={timetable.className}
          term={timetable.term}
          schoolName={schoolName || undefined}
        />
      )}
    </div>
  );
};

export default StudentCalendar;

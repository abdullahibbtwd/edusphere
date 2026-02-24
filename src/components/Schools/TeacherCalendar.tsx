/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import TeacherTimetableDisplay from "./TeacherTimetableDisplay";
import { FiLoader, FiAlertCircle } from "react-icons/fi";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const TeacherCalendar = () => {
  const params = useParams();
  const schoolId = params.school as string;
  const { user } = useUser();
  const teacherName = user?.name || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string>("");
  const [consolidatedSchedule, setConsolidatedSchedule] = useState<any>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>("FIRST");

  useEffect(() => {
    if (!schoolId) return;
    fetch(`/api/schools/${schoolId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data?.name && setSchoolName(data.name))
      .catch(() => {});
  }, [schoolId]);

  const fetchAndFilterTimetables = useCallback(async () => {
    if (!schoolId || !teacherName) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/schools/${schoolId}/timetable/list`);
      if (!response.ok) throw new Error("Failed to fetch timetables");

      const data = await response.json();
      const allTimetables = data.timetables || [];

      // Filter for this term
      const termTimetables = allTimetables.filter((tt: any) => tt.term === selectedTerm);

      // Build consolidated schedule
      const newSchedule: any = {};
      DAYS.forEach(day => {
        newSchedule[day] = [];
      });

      // Track max periods to ensure all days have the same length in the grid
      let maxPeriodFound = 0;

      termTimetables.forEach((tt: any) => {
        DAYS.forEach(day => {
          const daySchedule = tt.schedule[day] || [];
          daySchedule.forEach((entry: any, index: number) => {
            // Check if this teacher is assigned to this period
            if (entry.teacher === teacherName) {
              // Store the entry with class name
              newSchedule[day][index] = {
                ...entry,
                className: tt.className
              };
            } else if (!newSchedule[day][index]) {
              // Keep as free if not already assigned something else
              newSchedule[day][index] = {
                ...entry,
                subject: "Free",
                className: null
              };
            }

            if (index + 1 > maxPeriodFound) maxPeriodFound = index + 1;
          });
        });
      });

      // Ensure all days have the same length
      DAYS.forEach(day => {
        while (newSchedule[day].length < maxPeriodFound) {
          newSchedule[day].push({ subject: "Free" });
        }
      });

      setConsolidatedSchedule(newSchedule);
    } catch (err: any) {
      console.error("Error fetching teacher schedule:", err);
      setError(err.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [schoolId, teacherName, selectedTerm]);

  useEffect(() => {
    fetchAndFilterTimetables();
  }, [fetchAndFilterTimetables]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] sm:min-h-[360px] bg-surface/50 rounded-2xl shadow-sm">
        <FiLoader className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-text/60 font-medium">Loading your schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] sm:min-h-[360px] bg-surface/50 rounded-2xl shadow-sm p-4 sm:p-6 text-center">
        <FiAlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-danger mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-bold text-text mb-2">Error Loading Schedule</h3>
        <p className="text-sm text-text/60 mb-4 sm:mb-6">{error}</p>
        <button
          onClick={() => fetchAndFilterTimetables()}
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
        <label htmlFor="term-select-teacher" className="text-xs font-semibold text-text/60 uppercase tracking-wider sm:sr-only">Term</label>
        <select
          id="term-select-teacher"
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="w-full sm:w-auto px-3 py-2.5 sm:px-4 sm:py-2 rounded-xl bg-surface text-text text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
        >
          <option value="FIRST">First Term</option>
          <option value="SECOND">Second Term</option>
          <option value="THIRD">Third Term</option>
        </select>
      </div>

      <TeacherTimetableDisplay
        schedule={consolidatedSchedule}
        teacherName={teacherName}
        term={selectedTerm}
        schoolName={schoolName || undefined}
      />
    </div>
  );
};

export default TeacherCalendar;

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
  const [consolidatedSchedule, setConsolidatedSchedule] = useState<any>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>("FIRST");

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
      <div className="flex flex-col items-center justify-center h-[400px] bg-surface rounded-2xl border border-muted shadow-sm">
        <FiLoader className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-text/60 font-medium">Loading your schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-surface rounded-2xl border border-danger/20 shadow-sm p-6 text-center">
        <FiAlertCircle className="w-12 h-12 text-danger mb-4" />
        <h3 className="text-lg font-bold text-text mb-2">Error Loading Schedule</h3>
        <p className="text-text/60 mb-6">{error}</p>
        <button
          onClick={() => fetchAndFilterTimetables()}
          className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Term Selector */}
      <div className="flex justify-end">
        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="px-4 py-2 rounded-lg border border-muted bg-surface text-text font-semibold focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm transition-all hover:border-primary/50"
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
      />
    </div>
  );
};

export default TeacherCalendar;

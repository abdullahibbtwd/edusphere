/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import CalendarSetup from "@/components/CalendarSetup";
import CalendarView from "@/components/CalendarView";
import TimetableConfigForm from "@/components/TimetableConfigForm";
import TimetableDisplay from "@/components/TimetableDisplay";
import TeacherTimetableDisplay from "@/components/Schools/TeacherTimetableDisplay";
import StudentTimetableDisplay from "@/components/Schools/StudentTimetableDisplay";
import DoublePeriodConfigModal from "@/components/DoublePeriodConfigModal";
import CustomSelect from "@/components/ui/CustomSelect";
import { useUser } from "@/context/UserContext";
import { FiCalendar, FiClock, FiEye, FiEdit2, FiFilter, FiZap, FiGrid, FiUser, FiBookOpen } from "react-icons/fi";

const TimetablePage = () => {
  const params = useParams();
  const schoolId = params.school as string;

  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditCalendar, setShowEditCalendar] = useState(false);
  const [showViewCalendar, setShowViewCalendar] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [showDoublePeriodConfig, setShowDoublePeriodConfig] = useState(false);

  const [levels, setLevels] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("FIRST");

  const [timetable, setTimetable] = useState<any>(null);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [generating, setGenerating] = useState(false);

  const { role, user } = useUser();
  const [teacherSchedule, setTeacherSchedule] = useState<any>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [schoolName, setSchoolName] = useState<string>("");

  // --- Student view ---
  const [studentTimetable, setStudentTimetable] = useState<any>(null);
  const [studentClassName, setStudentClassName] = useState<string>("");
  const [loadingStudentTimetable, setLoadingStudentTimetable] = useState(false);

  useEffect(() => {
    if (!schoolId) return;
    fetch(`/api/schools/${schoolId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.name && setSchoolName(data.name))
      .catch(() => {});
  }, [schoolId]);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schools/${schoolId}/academic-calendar`);
      const data = await response.json();
      if (response.ok) {
        const active = data.sessions?.find((s: any) => s.isActive);
        setActiveSession(active || null);
      } else {
        toast.error(data.error || "Failed to fetch session");
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
      toast.error("Failed to fetch session");
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  const fetchLevels = useCallback(async () => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/levels?limit=1000`);
      const data = await response.json();
      if (response.ok && data.levels) setLevels(data.levels);
    } catch (error) {
      console.error("Failed to fetch levels:", error);
    }
  }, [schoolId]);

  const fetchClasses = useCallback(async (levelId: string) => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/classes?levelId=${levelId}&limit=1000`);
      const data = await response.json();
      if (response.ok && data.classes) setClasses(data.classes);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  }, [schoolId]);

  const fetchTimetable = useCallback(async (classId: string, term: string) => {
    try {
      setLoadingTimetable(true);
      const response = await fetch(
        `/api/schools/${schoolId}/timetable/generate?classId=${classId}&term=${term}`
      );
      const data = await response.json();
      setTimetable(response.ok && data.timetable ? data.timetable : null);
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
      setTimetable(null);
    } finally {
      setLoadingTimetable(false);
    }
  }, [schoolId]);

  const fetchTeacherSchedule = useCallback(async () => {
    if (!user?.name) return;
    try {
      setLoadingSchedule(true);
      const response = await fetch(`/api/schools/${schoolId}/timetable/list?term=${selectedTerm}`);
      const data = await response.json();
      if (!response.ok || !data.timetables) {
        setTeacherSchedule(null);
        return;
      }
      const filteredSchedule: any = {
        MONDAY: [],
        TUESDAY: [],
        WEDNESDAY: [],
        THURSDAY: [],
        FRIDAY: [],
      };
      data.timetables.forEach((tt: any) => {
        Object.keys(tt.schedule || {}).forEach((day) => {
          (tt.schedule[day] || []).forEach((entry: any) => {
            const entryTeacherName = entry.teacherName ?? entry.teacher;
            if (entryTeacherName === user.name) {
              const period = entry.period;
              if (!filteredSchedule[day][period - 1]) {
                filteredSchedule[day][period - 1] = { ...entry, className: tt.className };
              }
            }
          });
        });
      });
      Object.keys(filteredSchedule).forEach((day) => {
        const maxP = Math.max(...filteredSchedule[day].map((e: any) => e?.period || 0), 0);
        for (let i = 0; i < maxP; i++) {
          if (!filteredSchedule[day][i]) {
            filteredSchedule[day][i] = { period: i + 1, subject: "Free" };
          }
        }
      });
      setTeacherSchedule(filteredSchedule);
    } catch (error) {
      console.error("Failed to fetch teacher schedule:", error);
      setTeacherSchedule(null);
    } finally {
      setLoadingSchedule(false);
    }
  }, [schoolId, selectedTerm, user?.name]);

  const fetchStudentTimetable = useCallback(async (term: string) => {
    try {
      setLoadingStudentTimetable(true);
      const res = await fetch(`/api/schools/${schoolId}/timetable/my-class?term=${term}`);
      const data = await res.json();
      if (res.ok) {
        setStudentTimetable(data.timetable || null);
        setStudentClassName(data.student?.className || "");
      } else {
        setStudentTimetable(null);
      }
    } catch {
      setStudentTimetable(null);
    } finally {
      setLoadingStudentTimetable(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchSession();
    if (role === "admin") fetchLevels();
  }, [fetchSession, fetchLevels, role]);

  useEffect(() => {
    if (selectedLevel) {
      fetchClasses(selectedLevel);
      setSelectedClass("");
    } else {
      setClasses([]);
    }
  }, [selectedLevel, fetchClasses]);

  useEffect(() => {
    if (role === "teacher" && selectedTerm) {
      fetchTeacherSchedule();
    } else if (role === "student" && selectedTerm) {
      fetchStudentTimetable(selectedTerm);
    } else if (role === "admin" && selectedClass && selectedTerm) {
      fetchTimetable(selectedClass, selectedTerm);
    } else if (role === "admin") {
      setTimetable(null);
    }
  }, [selectedClass, selectedTerm, fetchTimetable, fetchTeacherSchedule, fetchStudentTimetable, role]);

  const handleConfigSaved = async () => {
    setShowConfigForm(false);
    await handleSchoolWideGenerate();
  };

  const handleSchoolWideGenerate = async () => {
    if (!selectedTerm) {
      toast.error("Please select a term");
      return;
    }
    try {
      setGenerating(true);
      const response = await fetch(`/api/schools/${schoolId}/timetable/generate-school`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: selectedTerm }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(
          `Generated timetables for ${data.successful} of ${data.totalClasses} classes.`,
          { duration: 5000 }
        );
        if (data.failed > 0) {
          toast.warning(`${data.failed} classes failed. Check console for details.`);
        }
        if (selectedClass) await fetchTimetable(selectedClass, selectedTerm);
      } else {
        toast.error(data.error || "Failed to generate timetables");
      }
    } catch {
      toast.error("Failed to generate timetables");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateClick = async () => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/timetable/config`);
      const data = await response.json();
      if (data.config) await handleSchoolWideGenerate();
      else setShowConfigForm(true);
    } catch {
      setShowConfigForm(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-muted">Loading...</p>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[360px] py-8">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
          <FiCalendar className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-lg font-bold text-text text-center mb-1">Set up academic calendar</h1>
        <p className="text-sm text-muted text-center mb-6">
          Define the current session and terms before generating timetables.
        </p>
        <CalendarSetup schoolId={schoolId} onSuccess={fetchSession} />
      </div>
    );
  }

  const currentTerm = activeSession.terms?.find((t: any) => t.isActive) || activeSession.terms?.[0];
  const selectedClassData = classes.find((c) => c.id === selectedClass);
  const selectedLevelData = levels.find((l) => l.id === selectedLevel);
  const totalClasses = levels.reduce((sum, level) => sum + (level.classCount || 0), 0);
  const termOptions = [
    { value: "FIRST", label: "First Term" },
    { value: "SECOND", label: "Second Term" },
    { value: "THIRD", label: "Third Term" },
  ];

  return (
    <div className="flex flex-col bg-surface p-4 sm:p-6 m-4 mt-0 flex-1 rounded-2xl shadow-sm gap-6 font-poppins text-text [&_button:not(:disabled)]:cursor-pointer">
      {/* Modals */}
      {showViewCalendar && (
        <CalendarView session={activeSession} onClose={() => setShowViewCalendar(false)} />
      )}
      {showEditCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-surface rounded-xl shadow-xl overflow-hidden">
            <CalendarSetup
              schoolId={schoolId}
              onSuccess={() => {
                setShowEditCalendar(false);
                fetchSession();
              }}
              initialData={activeSession}
              onCancel={() => setShowEditCalendar(false)}
            />
          </div>
        </div>
      )}
      {showConfigForm && (
        <TimetableConfigForm
          schoolId={schoolId}
          onSuccess={handleConfigSaved}
          onCancel={() => setShowConfigForm(false)}
        />
      )}
      {showDoublePeriodConfig && (
        <DoublePeriodConfigModal
          schoolId={schoolId}
          onClose={() => setShowDoublePeriodConfig(false)}
          onSuccess={() => setShowDoublePeriodConfig(false)}
        />
      )}

      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">Timetable</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
              <FiCalendar className="w-3 h-3" />
              {activeSession.name}
            </span>
            {currentTerm && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium">
                <FiClock className="w-3 h-3" />
                {currentTerm.name} Term
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowViewCalendar(true)}
            className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            title="View calendar"
          >
            <FiEye className="w-4 h-4" />
            <span className="hidden sm:inline">View calendar</span>
          </button>
          {role === "admin" && (
            <button
              onClick={() => setShowEditCalendar(true)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-surface text-text hover:bg-muted/50 transition-colors"
              title="Edit calendar"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ===== ADMIN VIEW ===== */}
      {role === "admin" && (
        <>
          {/* Generate section */}
          <section className="rounded-xl bg-surface p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FiGrid className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text">Generate all timetables</h2>
                  <p className="text-xs text-muted mt-0.5">
                    {totalClasses} classes across {levels.length} levels. No teacher conflicts.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <div className="w-full sm:w-36">
                  <label className="block text-xs font-medium text-muted mb-1">Term</label>
                  <CustomSelect
                    value={selectedTerm}
                    onChange={setSelectedTerm}
                    className="w-full"
                    options={termOptions}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDoublePeriodConfig(true)}
                    className="h-9 px-3 rounded-lg border border-border bg-surface text-text hover:bg-muted/50 transition-colors flex items-center justify-center"
                    title="Double periods"
                  >
                    <FiClock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleGenerateClick}
                    disabled={generating}
                    className="flex-1 sm:flex-none h-9 px-4 rounded-lg bg-primary text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
                  >
                    <FiZap className="w-4 h-4" />
                    {generating ? "Generating…" : "Generate all"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* View by class */}
          <section className="rounded-xl bg-surface p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FiFilter className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-text">View by class</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Level</label>
                <CustomSelect
                  value={selectedLevel}
                  onChange={setSelectedLevel}
                  className="w-full"
                  options={[
                    { value: "", label: "Select level" },
                    ...levels.map((level) => ({
                      value: level.id,
                      label: `${level.name} (${level.classCount || 0} classes)`,
                    })),
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Class</label>
                <CustomSelect
                  value={selectedClass}
                  onChange={setSelectedClass}
                  disabled={!selectedLevel}
                  className="w-full"
                  options={[
                    { value: "", label: selectedLevel ? "Select class" : "Select level first" },
                    ...classes.map((cls) => ({
                      value: cls.id,
                      label: `${cls.levelName} ${cls.name}`,
                    })),
                  ]}
                />
              </div>
            </div>

            {loadingTimetable ? (
              <div className="flex flex-col items-center justify-center min-h-[240px] py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-muted">Loading timetable...</p>
              </div>
            ) : selectedClass && selectedClassData && selectedLevelData ? (
              <TimetableDisplay
                schedule={timetable?.schedule}
                className={`${selectedLevelData.name} ${selectedClassData.name}`}
                term={selectedTerm}
                schoolName={schoolName || undefined}
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[200px] py-8 text-center rounded-lg bg-muted/10">
                <FiFilter className="w-10 h-10 text-muted mb-2" />
                <p className="text-sm font-medium text-text mb-0.5">No class selected</p>
                <p className="text-xs text-muted">
                  {selectedLevel ? "Choose a class to view its timetable" : "Choose a level first"}
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {/* ===== TEACHER VIEW ===== */}
      {role === "teacher" && (
        <div className="flex flex-col gap-6">
          <section className="rounded-xl bg-surface p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text">My schedule</h2>
                  <p className="text-xs text-muted">Your periods across all classes</p>
                </div>
              </div>
              <div className="w-full sm:w-40">
                <label className="block text-xs font-medium text-muted mb-1">Term</label>
                <CustomSelect
                  value={selectedTerm}
                  onChange={setSelectedTerm}
                  className="w-full"
                  options={termOptions}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-surface p-4 sm:p-6 shadow-sm min-h-[360px]">
            {loadingSchedule ? (
              <div className="flex flex-col items-center justify-center min-h-[280px] py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-muted">Loading schedule...</p>
              </div>
            ) : (
              <TeacherTimetableDisplay
                schedule={teacherSchedule}
                teacherName={user?.name || "Teacher"}
                term={selectedTerm}
                schoolName={schoolName || undefined}
              />
            )}
          </section>
        </div>
      )}

      {/* ===== STUDENT VIEW ===== */}
      {role === "student" && (
        <div className="flex flex-col gap-6">
          <section className="rounded-xl bg-surface p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FiBookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text">
                    {studentClassName ? `${studentClassName} — Timetable` : "My class timetable"}
                  </h2>
                  <p className="text-xs text-muted">Your weekly class schedule</p>
                </div>
              </div>
              <div className="w-full sm:w-40">
                <label className="block text-xs font-medium text-muted mb-1">Term</label>
                <CustomSelect
                  value={selectedTerm}
                  onChange={setSelectedTerm}
                  className="w-full"
                  options={termOptions}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-surface p-4 sm:p-6 shadow-sm min-h-[360px]">
            {loadingStudentTimetable ? (
              <div className="flex flex-col items-center justify-center min-h-[280px] py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-muted">Loading timetable...</p>
              </div>
            ) : (
              <StudentTimetableDisplay
                schedule={studentTimetable?.schedule || {}}
                className={studentClassName || "My Class"}
                term={selectedTerm}
                schoolName={schoolName || undefined}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;

"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import CalendarSetup from "@/components/CalendarSetup";
import CalendarView from "@/components/CalendarView";
import TimetableConfigForm from "@/components/TimetableConfigForm";
import TimetableDisplay from "@/components/TimetableDisplay";
import TeacherTimetableDisplay from "@/components/Schools/TeacherTimetableDisplay";
import DoublePeriodConfigModal from "@/components/DoublePeriodConfigModal";
import { useUser } from "@/context/UserContext";
import { FiCalendar, FiClock, FiEye, FiEdit2, FiFilter, FiZap, FiGrid, FiUser } from "react-icons/fi";

const TimetablePage = () => {
  const params = useParams();
  const schoolId = params.school as string;

  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditCalendar, setShowEditCalendar] = useState(false);
  const [showViewCalendar, setShowViewCalendar] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);

  // Filters for viewing only
  const [levels, setLevels] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("FIRST");

  // Timetable data
  const [timetable, setTimetable] = useState<any>(null);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showDoublePeriodConfig, setShowDoublePeriodConfig] = useState(false);

  // Role and Teacher specific
  const { role, user } = useUser();
  const [teacherSchedule, setTeacherSchedule] = useState<any>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

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
      if (response.ok && data.levels) {
        setLevels(data.levels);
      }
    } catch (error) {
      console.error("Failed to fetch levels:", error);
    }
  }, [schoolId]);

  const fetchClasses = useCallback(async (levelId: string) => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/classes?levelId=${levelId}&limit=1000`);
      const data = await response.json();
      if (response.ok && data.classes) {
        setClasses(data.classes);
      }
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

      if (response.ok && data.timetable) {
        setTimetable(data.timetable);
      } else {
        setTimetable(null);
      }
    } catch (error) {
      console.error("❌ Failed to fetch timetable:", error);
      setTimetable(null);
    } finally {
      setLoadingTimetable(false);
    }
  }, [schoolId]);

  const fetchTeacherSchedule = useCallback(async (term: string) => {
    if (!user?.name) return;
    try {
      setLoadingSchedule(true);
      const response = await fetch(`/api/schools/${schoolId}/timetable/list`);
      const data = await response.json();

      if (response.ok && data.timetables) {
        const filteredSchedule: any = {
          MONDAY: [], TUESDAY: [], WEDNESDAY: [], THURSDAY: [], FRIDAY: []
        };

        data.timetables.forEach((tt: any) => {
          Object.keys(tt.schedule).forEach(day => {
            tt.schedule[day].forEach((entry: any) => {
              if (entry.teacher === user.name) {
                // Find insertion index based on period
                const period = entry.period;
                if (!filteredSchedule[day][period - 1]) {
                  filteredSchedule[day][period - 1] = {
                    ...entry,
                    className: tt.className
                  };
                }
              }
            });
          });
        });

        // Fill gaps with empty slots for consistent rendering
        Object.keys(filteredSchedule).forEach(day => {
          const maxP = Math.max(...filteredSchedule[day].map((e: any) => e?.period || 0), 0);
          for (let i = 0; i < maxP; i++) {
            if (!filteredSchedule[day][i]) {
              filteredSchedule[day][i] = { period: i + 1, subject: 'Free' };
            }
          }
        });

        setTeacherSchedule(filteredSchedule);
      }
    } catch (error) {
      console.error("Failed to fetch teacher schedule:", error);
    } finally {
      setLoadingSchedule(false);
    }
  }, [schoolId, user?.name]);

  useEffect(() => {
    fetchSession();
    fetchLevels();
  }, [fetchSession, fetchLevels]);

  useEffect(() => {
    if (selectedLevel) {
      fetchClasses(selectedLevel);
      setSelectedClass("");
    } else {
      setClasses([]);
    }
  }, [selectedLevel, fetchClasses]);

  useEffect(() => {
    if (role === 'teacher' && selectedTerm) {
      fetchTeacherSchedule(selectedTerm);
    } else if (selectedClass && selectedTerm) {
      fetchTimetable(selectedClass, selectedTerm);
    } else {
      setTimetable(null);
    }
  }, [selectedClass, selectedTerm, fetchTimetable, fetchTeacherSchedule, role]);

  // Fetch and log all timetables on page load for verification
  useEffect(() => {
    const fetchAllTimetables = async () => {
      try {
        console.log('%c📊 FETCHING ALL TIMETABLES...', 'font-size: 16px; font-weight: bold; color: #4CAF50');
        console.log('='.repeat(80));

        const response = await fetch(`/api/schools/${schoolId}/timetable/list`);

        if (!response.ok) {
          console.error(`%c❌ API Error ${response.status}`, 'color: red; font-weight: bold');
          return;
        }

        const data = await response.json();
        const timetables = data.timetables || [];

        console.log(`%c✅ Found ${timetables.length} timetable(s)`, 'color: green; font-weight: bold; font-size: 14px');

        if (timetables.length === 0) {
          console.log('%c⚠️ NO TIMETABLES FOUND', 'color: orange; font-size: 14px; font-weight: bold');
          console.log('💡 Generate timetables using the "Generate All Timetables" button');
          return;
        }

        console.log('='.repeat(80));

        const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
        let grandTotal = { periods: 0, free: 0, classes: timetables.length };

        timetables.forEach((tt: any, index: number) => {
          console.log(`\n%c📋 ${index + 1}. ${tt.className} - ${tt.term}`, 'font-size: 13px; font-weight: bold; color: #2196F3');
          console.log('─'.repeat(80));

          let classPeriods = 0;
          let freePeriods = 0;

          days.forEach(day => {
            const daySchedule = tt.schedule[day] || [];

            if (daySchedule.length === 0) return;

            console.log(`\n  %c${day}:`, 'font-weight: bold; color: #FF9800');

            daySchedule.forEach((entry: any) => {
              classPeriods++;
              grandTotal.periods++;

              const isFree = !entry.teacher || !entry.subject || entry.subject.toLowerCase() === 'free';

              if (isFree) {
                freePeriods++;
                grandTotal.free++;
                console.log(`    Period ${entry.period} (${entry.startTime}-${entry.endTime}): %cFREE`, 'color: red; font-weight: bold');
              } else {
                console.log(`    Period ${entry.period} (${entry.startTime}-${entry.endTime}): ${entry.subject} - ${entry.teacher}`);
              }
            });
          });

          const fillRate = classPeriods > 0 ? ((classPeriods - freePeriods) / classPeriods * 100).toFixed(1) : '0.0';
          const status = freePeriods === 0 ? '✅' : '⚠️';

          console.log('\n  ' + '─'.repeat(78));
          console.log(`  ${status} Total: ${classPeriods} periods | Free: ${freePeriods} | Fill rate: ${fillRate}%`);
        });

        // Grand summary
        console.log('\n\n' + '='.repeat(80));
        console.log('%c📈 GRAND SUMMARY', 'font-size: 14px; font-weight: bold; color: #9C27B0');
        console.log('='.repeat(80));
        console.log(`  Classes: ${grandTotal.classes}`);
        console.log(`  Total periods: ${grandTotal.periods}`);
        console.log(`  Free periods: ${grandTotal.free}`);

        if (grandTotal.periods > 0) {
          const overallRate = ((grandTotal.periods - grandTotal.free) / grandTotal.periods * 100).toFixed(1);
          console.log(`  Overall fill rate: ${overallRate}%`);
        }

        if (grandTotal.free === 0 && grandTotal.periods > 0) {
          console.log('\n%c✅ PERFECT! All timetables are 100% filled!', 'color: green; font-weight: bold; font-size: 14px');
        } else if (grandTotal.free > 0) {
          console.log(`\n%c⚠️ WARNING: ${grandTotal.free} free period(s) found`, 'color: orange; font-weight: bold; font-size: 14px');
        }

        console.log('\n💾 Raw data available as: window.allTimetables');
        (window as any).allTimetables = timetables;

      } catch (error) {
        console.error('%c❌ Error fetching timetables:', 'color: red; font-weight: bold', error);
      }
    };

    if (schoolId) {
      fetchAllTimetables();
    }
  }, [schoolId]); // Run once when page loads

  const handleConfigSaved = async (config: any) => {
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
        body: JSON.stringify({
          term: selectedTerm
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `🎉 Generated timetables for ${data.successful} out of ${data.totalClasses} classes across all levels!`,
          { duration: 5000 }
        );

        if (data.failed > 0) {
          toast.warning(`${data.failed} classes failed to generate. Check console for details.`);
          console.log("Failed classes:", data.errors);
        }

        // Show summary by level
        if (data.resultsByLevel) {
          console.log("Results by level:", data.resultsByLevel);
        }

        // Refresh current timetable if a class is selected
        if (selectedClass) {
          await fetchTimetable(selectedClass, selectedTerm);
        }
      } else {
        toast.error(data.error || "Failed to generate timetables");
      }
    } catch (error) {
      toast.error("Failed to generate timetables");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateClick = async () => {
    // Check if config exists
    try {
      const response = await fetch(`/api/schools/${schoolId}/timetable/config`);
      const data = await response.json();

      if (data.config) {
        await handleSchoolWideGenerate();
      } else {
        setShowConfigForm(true);
      }
    } catch (error) {
      setShowConfigForm(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10 h-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-text">Academic Calendar</h1>
          <p className="text-text/60 max-w-md mx-auto">
            To generate timetables, you must first define the current Academic Session and Terms.
          </p>
        </div>
        <CalendarSetup schoolId={schoolId} onSuccess={fetchSession} />
      </div>
    );
  }

  const currentTerm = activeSession.terms.find((t: any) => t.isActive) || activeSession.terms[0];
  const selectedClassData = classes.find(c => c.id === selectedClass);
  const selectedLevelData = levels.find(l => l.id === selectedLevel);
  const totalClasses = levels.reduce((sum, level) => sum + (level.classCount || 0), 0);

  // ... (keep existing fetch functions)

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-6 h-full font-poppins text-text relative">
      {/* Modals */}
      {showViewCalendar && (
        <CalendarView session={activeSession} onClose={() => setShowViewCalendar(false)} />
      )}

      {showEditCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-surface rounded-xl shadow-2xl relative">
            <CalendarSetup
              schoolId={schoolId}
              onSuccess={() => { setShowEditCalendar(false); fetchSession(); }}
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
          onSuccess={() => {
            setShowDoublePeriodConfig(false);
            // Optionally refresh if needed, but generation uses fresh data anyway
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 md:gap-4 bg-surface p-3 md:p-4 rounded-xl border border-muted shadow-sm">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text truncate">
            Timetable Management
          </h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 text-xs md:text-sm">
            <span className="flex items-center gap-1.5 px-2 md:px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20 whitespace-nowrap">
              <FiCalendar className="w-3 md:w-3.5 h-3 md:h-3.5" />
              <span className="hidden sm:inline">{activeSession.name}</span>
              <span className="sm:hidden">{activeSession.name.split(' ')[0]}</span>
            </span>
            {currentTerm && (
              <span className="flex items-center gap-1.5 px-2 md:px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium border border-orange-200 whitespace-nowrap">
                <FiClock className="w-3 md:w-3.5 h-3 md:h-3.5" />
                <span className="hidden sm:inline">{currentTerm.name} Term</span>
                <span className="sm:hidden">{currentTerm.name}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
          <button
            onClick={() => setShowViewCalendar(true)}
            className="flex-1 lg:flex-none w-10 h-10 bg-surface text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center"
            title="View Calendar"
          >
            <FiEye className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          {role === 'admin' && (
            <button
              onClick={() => setShowEditCalendar(true)}
              className="flex-1 lg:flex-none w-10 h-10 bg-surface text-text/70 border border-muted rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
              title="Edit Calendar"
            >
              <FiEdit2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {role === 'admin' ? (
        <>
          {/* School-Wide Generation Section (Admins Only) */}
          <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-4 md:p-6 rounded-xl border border-primary/20 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <FiGrid className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-bold text-text">Generate All Timetables</h2>
                <p className="text-sm text-text/60 mt-1">
                  Generate conflict-free timetables for <span className="font-semibold text-primary">{totalClasses} classes</span> across <span className="font-semibold text-primary">{levels.length} levels</span> in one click
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Term Selector */}
              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">Select Term *</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-muted bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium"
                >
                  <option value="FIRST">First Term</option>
                  <option value="SECOND">Second Term</option>
                  <option value="THIRD">Third Term</option>
                </select>
              </div>

              {/* Generate Button & Config */}
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setShowDoublePeriodConfig(true)}
                  className="px-4 py-3 bg-white border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-all text-sm font-semibold shadow-sm flex-shrink-0 h-[50px] flex items-center justify-center"
                  title="Configure Double Periods"
                >
                  <FiClock className="w-5 h-5" />
                </button>
                <button
                  onClick={handleGenerateClick}
                  disabled={generating}
                  className="flex-1 px-6 py-3 cursor-pointer bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold shadow-xl shadow-primary/30 hover:shadow-primary/40 text-base h-[50px]"
                >
                  <FiZap className="w-5 h-5" />
                  {generating ? "Generating..." : `Generate ${totalClasses} Classes`}
                </button>
              </div>
            </div>

            {/* Info Banner */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> This will generate timetables for ALL classes (JSS1-SS3) for the selected term.
                The system ensures no teacher conflicts across the entire school.
              </p>
            </div>
          </div>

          {/* View Timetable Section */}
          <div className="bg-surface p-4 rounded-xl border border-muted shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FiFilter className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-text">View Generated Timetables</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Level Selector */}
              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">Filter by Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-muted bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="">All Levels</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name} ({level.classCount || 0} classes)
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Selector */}
              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={!selectedLevel}
                  className="w-full px-4 py-2 rounded-lg border border-muted bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">
                    {selectedLevel ? "Select a class" : "Select a level first"}
                  </option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.levelName} {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Timetable Display */}
          <div className="bg-surface p-4 rounded-xl border border-muted shadow-sm flex-1">
            {loadingTimetable ? (
              <div className="flex items-center justify-center p-10">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : selectedClass && selectedClassData && selectedLevelData ? (
              <TimetableDisplay
                schedule={timetable?.schedule}
                className={`${selectedLevelData.name} ${selectedClassData.name}`}
                term={selectedTerm}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <FiFilter className="w-16 h-16 text-text/20 mb-4" />
                <p className="text-text/60 mb-2">No class selected</p>
                <p className="text-sm text-text/40">
                  {selectedLevel
                    ? "Select a class above to view its timetable"
                    : "Select a level first to see available classes"}
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Teacher View */
        <div className="flex flex-col gap-6">
          <div className="bg-surface p-4 rounded-xl border border-muted shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FiUser className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text">My Personal Schedule</h2>
                  <p className="text-sm text-text/60">Viewing your assigned periods across all classes</p>
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-muted bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium"
                >
                  <option value="FIRST">First Term</option>
                  <option value="SECOND">Second Term</option>
                  <option value="THIRD">Third Term</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-muted shadow-sm flex-1 min-h-[500px]">
            {loadingSchedule ? (
              <div className="flex items-center justify-center p-10 h-full">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <TeacherTimetableDisplay
                schedule={teacherSchedule}
                teacherName={user?.name || "Teacher"}
                term={selectedTerm}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;

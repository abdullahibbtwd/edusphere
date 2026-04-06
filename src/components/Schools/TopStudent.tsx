"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import CustomSelect from "@/components/ui/CustomSelect";
import type { SelectOption } from "@/components/ui/CustomSelect";

interface LevelRow {
  id: string;
  name: string;
}

interface ClassRow {
  id: string;
  name: string;
  levelId: string;
}

interface TermRow {
  id: string;
  name: string;
  sessionName?: string | null;
}

interface StudentRow {
  id: string;
  name: string;
  registrationLabel: string;
  level: string;
  class: string;
  average: number;
  position: number;
  improvement: number | null;
}

const selectClass = "w-full min-w-0 !max-w-full sm:!w-44";

const TopStudentsLeaderboard = () => {
  const params = useParams();
  const schoolId = params.school as string;

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  const [levels, setLevels] = useState<LevelRow[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [terms, setTerms] = useState<TermRow[]>([]);
  const [studentData, setStudentData] = useState<StudentRow[]>([]);
  const [termLabel, setTermLabel] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    setMessage(null);
    try {
      const qs = new URLSearchParams();
      if (selectedLevel) qs.set("levelId", selectedLevel);
      if (selectedClass) qs.set("classId", selectedClass);
      if (selectedTerm) qs.set("termId", selectedTerm);

      const res = await fetch(
        `/api/schools/${schoolId}/dashboard/top-students?${qs.toString()}`,
        { cache: "no-store" }
      );
      const json = await res.json();

      if (!res.ok) {
        setStudentData([]);
        setMessage(json.error || "Could not load top students.");
        return;
      }

      setLevels(Array.isArray(json.levels) ? json.levels : []);
      setClasses(Array.isArray(json.classes) ? json.classes : []);
      setTerms(Array.isArray(json.terms) ? json.terms : []);
      setTermLabel(json.termName ?? null);
      if (json.message) setMessage(json.message);

      const rows = Array.isArray(json.students) ? json.students : [];
      setStudentData(
        rows.map(
          (r: {
            id: string;
            name: string;
            registrationLabel: string;
            level: string;
            class: string;
            average: number;
            position: number;
            improvement: number | null;
          }) => ({
            id: r.id,
            name: r.name,
            registrationLabel: r.registrationLabel,
            level: r.level,
            class: r.class,
            average: r.average,
            position: r.position,
            improvement:
              r.improvement === null || r.improvement === undefined
                ? null
                : r.improvement,
          })
        )
      );
    } catch {
      setStudentData([]);
      setMessage("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [schoolId, selectedLevel, selectedClass, selectedTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const levelOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: "All Levels" },
      ...levels.map((l) => ({ value: l.id, label: l.name })),
    ],
    [levels]
  );

  const classOptions: SelectOption[] = useMemo(() => {
    if (!selectedLevel) {
      return [{ value: "", label: "Select a level first" }];
    }
    const base = classes.filter((c) => c.levelId === selectedLevel);
    return [
      { value: "", label: "All Classes" },
      ...base.map((c) => ({ value: c.id, label: c.name })),
    ];
  }, [classes, selectedLevel]);

  const termOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: "Default term" },
      ...terms.map((t) => ({
        value: t.id,
        label: t.sessionName ? `${t.name} (${t.sessionName})` : t.name,
      })),
    ],
    [terms]
  );

  useEffect(() => {
    if (!selectedLevel) {
      setSelectedClass("");
      return;
    }
    if (!selectedClass) return;
    const stillValid = classes.some(
      (c) => c.id === selectedClass && c.levelId === selectedLevel
    );
    if (!stillValid) setSelectedClass("");
  }, [selectedLevel, selectedClass, classes]);

  const getMedal = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return position;
  };

  const classAvg =
    studentData.length > 0
      ? Math.round(
          studentData.reduce((sum, s) => sum + s.average, 0) /
            studentData.length
        )
      : null;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg bg-[var(--surface)] p-4">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[var(--text)]">
            Top Performing Students
          </h1>
          {termLabel && (
            <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
              Term: {termLabel}
            </p>
          )}
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          <CustomSelect
            options={termOptions}
            value={selectedTerm}
            onChange={setSelectedTerm}
            placeholder="Default term"
            className={selectClass}
          />
          <CustomSelect
            options={levelOptions}
            value={selectedLevel}
            onChange={(v) => {
              setSelectedLevel(v);
              setSelectedClass("");
            }}
            placeholder="All Levels"
            className={selectClass}
          />
          <CustomSelect
            options={classOptions}
            value={selectedClass}
            onChange={setSelectedClass}
            placeholder={
              selectedLevel ? "All Classes" : "Select a level first"
            }
            disabled={!selectedLevel}
            className={selectClass}
          />
        </div>
      </div>

      {message && (
        <p className="mb-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center text-[var(--muted)]">
            Loading…
          </div>
        ) : studentData.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-[var(--muted)]">
            No result data for this filter. Enter results for the term or adjust
            filters.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-2 text-left font-medium text-[var(--text)]">
                  Rank
                </th>
                <th className="py-2 text-left font-medium text-[var(--text)]">
                  Student
                </th>
                <th className="py-2 text-left font-medium text-[var(--text)]">
                  Level
                </th>
                <th className="py-2 text-left font-medium text-[var(--text)]">
                  Class
                </th>
                <th className="py-2 text-left font-medium text-[var(--text)]">
                  Average
                </th>
                <th className="py-2 text-left font-medium text-[var(--text)]">
                  vs last term
                </th>
              </tr>
            </thead>
            <tbody>
              {studentData.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--accent)]"
                >
                  <td className="py-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        student.position === 1
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
                          : student.position === 2
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            : student.position === 3
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                              : "bg-[var(--accent)] text-[var(--text)]"
                      }`}
                    >
                      {getMedal(student.position)}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--text)]">
                          {student.name}
                        </div>
                        <div className="truncate text-sm text-[var(--muted)]">
                          Reg: {student.registrationLabel}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-[var(--text)]">{student.level}</td>
                  <td className="py-3 text-[var(--text)]">{student.class}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-12 rounded-full bg-[var(--border)]">
                        <div
                          className="h-2 rounded-full bg-[var(--primary)]"
                          style={{ width: `${student.average}%` }}
                        />
                      </div>
                      <span className="font-semibold text-[var(--text)]">
                        {student.average}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    {student.improvement === null ? (
                      <span className="text-[var(--muted)]">—</span>
                    ) : (
                      <div
                        className={`flex items-center ${
                          student.improvement >= 0
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]"
                        }`}
                      >
                        {student.improvement >= 0 ? (
                          <svg
                            className="mr-1 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="mr-1 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          </svg>
                        )}
                        {Math.abs(student.improvement)} pts
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && studentData.length > 0 && (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-[var(--primary)]" />
              <div className="text-sm text-[var(--text)]">
                <span className="font-semibold">{studentData.length}</span>{" "}
                students shown (max 15)
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-[var(--success)]" />
              <div className="text-sm text-[var(--text)]">
                Cohort average:{" "}
                <span className="font-semibold">
                  {classAvg !== null ? `${classAvg}%` : "N/A"}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-[var(--cta)]" />
              <div className="text-sm text-[var(--text)]">
                Top student:{" "}
                <span className="font-semibold">{studentData[0]?.name}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopStudentsLeaderboard;

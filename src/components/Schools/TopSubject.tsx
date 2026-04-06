"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import CustomSelect from "@/components/ui/CustomSelect";
import type { SelectOption } from "@/components/ui/CustomSelect";

interface SubjectPerformance {
  subject: string;
  passRate: number;
  understanding: number;
}

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

const selectClass = "w-full min-w-0 !max-w-full sm:!w-44";

const TopSubjectsChart = () => {
  const params = useParams();
  const schoolId = params.school as string;

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  const [levels, setLevels] = useState<LevelRow[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [terms, setTerms] = useState<TermRow[]>([]);
  const [chartData, setChartData] = useState<SubjectPerformance[]>([]);
  const [termLabel, setTermLabel] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const axisTextColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#374151" : "#e5e7eb";

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
        `/api/schools/${schoolId}/dashboard/top-subjects?${qs.toString()}`,
        { cache: "no-store" }
      );
      const json = await res.json();

      if (!res.ok) {
        setChartData([]);
        setMessage(json.error || "Could not load subject performance.");
        return;
      }

      setLevels(Array.isArray(json.levels) ? json.levels : []);
      setClasses(Array.isArray(json.classes) ? json.classes : []);
      setTerms(Array.isArray(json.terms) ? json.terms : []);

      setTermLabel(json.termName ?? null);
      if (json.message) setMessage(json.message);

      const rows = Array.isArray(json.subjects) ? json.subjects : [];
      setChartData(
        rows.map((r: { subject: string; passRate: number; understanding: number }) => ({
          subject: r.subject,
          passRate: r.passRate,
          understanding: r.understanding,
        }))
      );
    } catch {
      setChartData([]);
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

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: unknown[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const p0 = payload[0] as { value?: number };
      const p1 = payload[1] as { value?: number };
      return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-lg">
          <p className="font-semibold text-[var(--text)]">{label}</p>
          <p className="text-[#8B5CF6]">Avg score: {p0?.value ?? 0}%</p>
          <p className="text-[#2DD4BF]">
            At/above promotion bar: {p1?.value ?? 0}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden rounded-lg bg-[var(--surface)] p-3 sm:p-4">
      <div className="mb-3 flex w-full min-w-0 shrink-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-text">
            Top Performing Subjects
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
        <p className="mb-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}

      <div className="min-h-[200px] w-full min-w-0 flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[var(--muted)]">
            Loading…
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-[var(--muted)]">
            No result data for this filter. Enter results for the term or adjust filters.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 80, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke={gridColor}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickMargin={10}
                axisLine={false}
                tick={{ fill: axisTextColor }}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="subject"
                tickMargin={10}
                axisLine={false}
                tick={{ fill: axisTextColor, fontSize: 11 }}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                align="center"
                verticalAlign="top"
                wrapperStyle={{
                  paddingBottom: "20px",
                  color: axisTextColor,
                }}
                formatter={(value) =>
                  value === "Pass Rate"
                    ? "Avg score %"
                    : value === "Understanding"
                      ? "% at promotion bar"
                      : value
                }
              />
              <Bar
                dataKey="passRate"
                fill="#8B5CF6"
                name="Pass Rate"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="understanding"
                fill="#2DD4BF"
                name="Understanding"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-primary p-3">
          <h3 className="text-sm font-medium text-white">Highest avg score</h3>
          <p className="text-xl font-bold text-white">
            {chartData.length
              ? `${chartData[0].subject} (${chartData[0].passRate}%)`
              : "N/A"}
          </p>
        </div>
        <div className="rounded-lg bg-primary-400 p-3">
          <h3 className="text-sm font-medium text-white">Average (avg)</h3>
          <p className="text-xl font-bold text-white">
            {chartData.length
              ? `${Math.round(
                  chartData.reduce((s, i) => s + i.passRate, 0) / chartData.length
                )}%`
              : "N/A"}
          </p>
        </div>
        <div className="rounded-lg bg-success p-3">
          <h3 className="text-sm font-medium text-white">Subjects shown</h3>
          <p className="text-xl font-bold text-white">{chartData.length}</p>
        </div>
      </div>
    </div>
  );
};

export default TopSubjectsChart;

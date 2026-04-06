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
import { useState, useEffect, useSyncExternalStore } from "react";
import CustomSelect from "@/components/ui/CustomSelect";

function subscribeNarrow(cb: () => void) {
  const mq = window.matchMedia("(max-width: 639px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getIsNarrow() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;
}

function useIsNarrowScreen() {
  return useSyncExternalStore(subscribeNarrow, getIsNarrow, () => false);
}

export type FeeChartDataItem = {
  class: string;
  levelName: string;
  classId: string;
  First: number;
  Second: number;
  Third: number;
};

type LevelOption = { id: string; name: string };
type ClassOption = { id: string; name: string };
type SessionOption = { id: string; name: string };

const TERM_COLORS: Record<string, string> = {
  First: "#8B5CF6",
  Second: "#2DD4BF",
  Third: "#F59E0B",
};

const CHART_LIMIT = 15;

const SchoolFeesChart = ({ schoolId }: { schoolId?: string }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isNarrow = useIsNarrowScreen();

  const [sessionName, setSessionName] = useState<string | null>(null);
  const [data, setData] = useState<FeeChartDataItem[]>([]);
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [loading, setLoading] = useState(!!schoolId);
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const axisTextColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#374151" : "#e5e7eb";

  useEffect(() => {
    if (!schoolId) {
      setData([]);
      setLevels([]);
      setClasses([]);
      setSessions([]);
      setSessionName(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", String(CHART_LIMIT));
    if (selectedLevelId) params.set("levelId", selectedLevelId);
    if (selectedClassId) params.set("classId", selectedClassId);
    if (selectedSessionId) params.set("sessionId", selectedSessionId);
    const url = `/api/schools/${schoolId}/fees/chart?${params.toString()}`;
    fetch(url)
      .then((res) => res.json())
      .then(
        (json: {
          sessionName?: string;
          data?: FeeChartDataItem[];
          levels?: LevelOption[];
          classes?: ClassOption[];
          sessions?: SessionOption[];
        }) => {
          if (cancelled) return;
          setSessionName(json.sessionName ?? null);
          setData(Array.isArray(json.data) ? json.data : []);
          setLevels(Array.isArray(json.levels) ? json.levels : []);
          setClasses(Array.isArray(json.classes) ? json.classes : []);
          setSessions(Array.isArray(json.sessions) ? json.sessions : []);
          if (selectedSessionId && !json.sessions?.some((s) => s.id === selectedSessionId)) {
            setSelectedSessionId("");
          }
          if (selectedLevelId && !json.levels?.some((l) => l.id === selectedLevelId)) {
            setSelectedLevelId("");
            setSelectedClassId("");
          }
          if (selectedClassId && !json.classes?.some((c) => c.id === selectedClassId)) {
            setSelectedClassId("");
          }
        }
      )
      .catch(() => {
        if (!cancelled) {
          setData([]);
          setLevels([]);
          setClasses([]);
          setSessions([]);
          setSessionName(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [schoolId, selectedLevelId, selectedClassId, selectedSessionId]);

  const chartData = data.map((row) => ({
    name: row.class,
    First: row.First,
    Second: row.Second,
    Third: row.Third,
  }));

  const formatTooltip = (value: number, name: string): [string, string] => {
    return [`${value}%`, `${name} Term`];
  };

  if (loading && data.length === 0 && sessions.length === 0) {
    return (
      <div className="flex h-full min-h-0 min-w-0 max-w-full items-center justify-center overflow-hidden rounded-lg bg-[var(--surface)] p-4">
        <p className="text-muted">Loading fee data…</p>
      </div>
    );
  }

  const chartMargin = isNarrow
    ? { top: 4, right: 4, left: 0, bottom: 56 }
    : { top: 5, right: 24, left: 8, bottom: 20 };

  const selectClass = "w-full min-w-0 !max-w-full sm:!w-44";

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden rounded-lg bg-[var(--surface)] p-3 sm:p-4">
      <div className="mb-3 flex w-full min-w-0 shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-[var(--text)]">
            School Fees Payment
          </h1>
          {sessionName && (
            <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
              Session: {sessionName}
            </p>
          )}
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:max-w-full sm:flex-row sm:flex-wrap sm:justify-end">
          <CustomSelect
            options={[
              { value: "", label: "Current session" },
              ...sessions.map((s) => ({ value: s.id, label: s.name })),
            ]}
            value={selectedSessionId}
            onChange={setSelectedSessionId}
            placeholder="Current session"
            className={selectClass}
          />
          <CustomSelect
            options={[
              { value: "", label: "All Levels" },
              ...levels.map((level) => ({ value: level.id, label: level.name })),
            ]}
            value={selectedLevelId}
            onChange={(val) => {
              setSelectedLevelId(val);
              setSelectedClassId("");
            }}
            placeholder="All Levels"
            className={selectClass}
          />
          {selectedLevelId && (
            <CustomSelect
              options={[
                { value: "", label: "All Classes" },
                ...classes.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={selectedClassId}
              onChange={setSelectedClassId}
              placeholder="All Classes"
              className={selectClass}
            />
          )}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex min-h-[200px] flex-1 items-center justify-center text-[var(--muted)]">
          No fee data for the selected session.
        </div>
      ) : (
        <div className="min-h-[200px] w-full min-w-0 flex-1">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={chartData}
              margin={chartMargin}
              barCategoryGap={isNarrow ? "12%" : "20%"}
            >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              tickMargin={isNarrow ? 4 : 10}
              dataKey="name"
              axisLine={false}
              tick={{ fill: axisTextColor, fontSize: isNarrow ? 10 : 11 }}
              tickLine={false}
              interval={0}
              angle={isNarrow ? -35 : 0}
              textAnchor={isNarrow ? "end" : "middle"}
              height={isNarrow ? 52 : 30}
            />
            <YAxis
              tickMargin={10}
              axisLine={false}
              tick={{ fill: axisTextColor }}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
            />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: axisTextColor,
              }}
            />
            <Legend
              align="center"
              verticalAlign="top"
              wrapperStyle={{
                paddingTop: isNarrow ? "4px" : "10px",
                paddingBottom: isNarrow ? "8px" : "20px",
                color: axisTextColor,
                fontSize: isNarrow ? 11 : 12,
              }}
              formatter={(value) => `${value} Term`}
            />
            <Bar
              dataKey="First"
              fill={TERM_COLORS.First}
              radius={[4, 4, 0, 0]}
              name="First"
            />
            <Bar
              dataKey="Second"
              fill={TERM_COLORS.Second}
              radius={[4, 4, 0, 0]}
              name="Second"
            />
            <Bar
              dataKey="Third"
              fill={TERM_COLORS.Third}
              radius={[4, 4, 0, 0]}
              name="Third"
            />
          </BarChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SchoolFeesChart;

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
import { useState, useEffect } from "react";

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
      <div className="bg-[var(--surface)] rounded-lg p-4 h-full flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading fee data…</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] rounded-lg p-4 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">
            School Fees Payment
          </h1>
          {sessionName && (
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Session: {sessionName}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-md px-2 py-1 text-sm"
          >
            <option value="">Current session</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={selectedLevelId}
            onChange={(e) => {
              setSelectedLevelId(e.target.value);
              setSelectedClassId("");
            }}
            className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-md px-2 py-1 text-sm"
          >
            <option value="">All Levels</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
          {selectedLevelId && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-md px-2 py-1 text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[85%] flex items-center justify-center text-[var(--muted)]">
          No fee data for the selected session.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              tickMargin={10}
              dataKey="name"
              axisLine={false}
              tick={{ fill: axisTextColor, fontSize: 11 }}
              tickLine={false}
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
                paddingTop: "10px",
                paddingBottom: "20px",
                color: axisTextColor,
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
      )}
    </div>
  );
};

export default SchoolFeesChart;

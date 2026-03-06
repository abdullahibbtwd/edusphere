"use client";
import Image from "next/image";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type ClassEnrollmentItem = { name: string; count: number };

// Support both SS and JSS level names; use hex fallbacks so bars render in SVG
const LEVEL_COLORS: Record<string, string> = {
  SS1: "var(--primary)",
  SS2: "var(--cta)",
  SS3: "var(--success)",
  JSS1: "var(--primary)",
  JSS2: "var(--cta)",
  JSS3: "var(--success)",
};
const LEVEL_COLOR_FALLBACK: Record<string, string> = {
  SS1: "#6366f1",
  SS2: "#10b981",
  SS3: "#22c55e",
  JSS1: "#6366f1",
  JSS2: "#10b981",
  JSS3: "#22c55e",
};
const DEFAULT_FALLBACK = "#94a3b8";

const getClassColor = (className: string, useFallback = false) => {
  const upper = className.toUpperCase();
  const key = Object.keys(LEVEL_COLORS).find((k) => upper.startsWith(k));
  if (!key) return useFallback ? DEFAULT_FALLBACK : "var(--accent)";
  return useFallback ? LEVEL_COLOR_FALLBACK[key] ?? DEFAULT_FALLBACK : LEVEL_COLORS[key];
};

const ProgramsChart = ({ data = [] }: { data?: ClassEnrollmentItem[] }) => {
  const chartData = data.map((program) => ({
    name: program.name,
    total: program.count,
    fill: getClassColor(program.name, true),
  }));

  const maxCount = chartData.length
    ? Math.ceil(Math.max(...chartData.map((d) => d.total), 1))
    : 1;
  const xAxisTicks = Array.from({ length: maxCount + 1 }, (_, i) => i);

  const levelNames = [
    ...new Set(
      data
        .map((d) =>
          Object.keys(LEVEL_COLORS).find((key) =>
            d.name.toUpperCase().startsWith(key)
          )
        )
        .filter(Boolean)
    )
  ] as string[];

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { payload: { total: number } }[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface p-4 rounded-lg shadow-md border border-muted">
          <p className="font-bold text-text">{label}</p>
          <p className="text-sm text-muted">
            Total: <span className="font-semibold">{payload[0].payload.total}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-text">Class Enrolment</h1>
        <Image src="/moreDark.png" alt="Options" width={20} height={20} />
      </div>

      {/* Legend - from levels present in data */}
      {levelNames.length > 0 && (
        <div className="flex gap-4 mb-4 text-xs text-text flex-wrap">
          {levelNames.map((level) => (
            <div key={level} className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getClassColor(level, true) }}
              />
              {level}
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 overflow-hidden">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted">
            No program data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 8, bottom: 5 }}
            >
              <CartesianGrid horizontal={true} vertical={false} stroke="var(--muted)" />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                stroke="var(--text)"
                allowDecimals={false}
                ticks={xAxisTicks}
                domain={[0, maxCount]}
              />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text)", fontSize: 11 }}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" barSize={22} radius={[0, 4, 4, 0]} fill="#94a3b8" isAnimationActive={true}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ProgramsChart;
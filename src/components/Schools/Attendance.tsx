"use client";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ProgramsChart = () => {
  // Data for each class
  const ClassCount = [
    // SS1
    { name: "SS1A", count: 35 },
    { name: "SS1B", count: 32 },
    { name: "SS1C", count: 30 },
    { name: "SS1D", count: 28 },

    // SS2
    { name: "SS2A", count: 33 },
    { name: "SS2B", count: 36 },
    { name: "SS2C", count: 31 },
    { name: "SS2D", count: 29 },

    // SS3
    { name: "SS3A", count: 34 },
    { name: "SS3B", count: 35 },
    { name: "SS3C", count: 32 },
    { name: "SS3D", count: 30 },
  ];

  // Map SS groups to colors based on your theme
  const getClassColor = (className: string) => {
    if (className.startsWith("SS1")) return "var(--primary)"; // Purple for SS1
    if (className.startsWith("SS2")) return "var(--cta)"; // Orange for SS2
    if (className.startsWith("SS3")) return "var(--success)"; // Green for SS3
    return "var(--accent)";
  };

  // Transform data for chart
  const chartData = ClassCount.map((program) => ({
    name: program.name,
    total: program.count,
    fill: getClassColor(program.name),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
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
    <div className="bg-surface rounded-lg p-4 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-text">Program Enrollment</h1>
        <Image src="/moreDark.png" alt="Options" width={20} height={20} />
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs text-text">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--primary)" }}></span>
          SS1
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--cta)" }}></span>
          SS2
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--success)" }}></span>
          SS3
        </div>
      </div>

      {/* Chart */}
      {ClassCount.length === 0 ? (
        <div className="h-full flex items-center justify-center text-muted">
          No program data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid horizontal={true} vertical={false} stroke="var(--muted)" />
            <XAxis type="number" axisLine={false} tickLine={false} stroke="var(--text)" />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text)", fontSize: 9 }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" barSize={5} radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProgramsChart;

"use client";
import Image from "next/image";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

const CountChart = () => {
  // Fetch student statistics
  const studentStats = {
    total: 1200,
    male: 680,
    female: 520,
  };

  // Calculate percentages
  const total = studentStats?.total || 0;
  const male = studentStats?.male || 0;
  const female = studentStats?.female || 0;
  const malePercentage = total > 0 ? Math.round((male / total) * 100) : 0;
  const femalePercentage = total > 0 ? Math.round((female / total) * 100) : 0;

  // Data for chart
  const chartData = [
    { name: "Total", count: total, fill: "var(--muted)" },
    { name: "Boys", count: male, fill: "var(--primary)" },
    { name: "Girls", count: female, fill: "var(--cta)" },
  ];

  return (
    <div className="bg-surface rounded-xl p-4 w-full h-full overflow-hidden">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-text">Students</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      {/* Chart */}
      <div className="w-full h-[75%] relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={32}
            data={chartData}
          >
            <RadialBar background dataKey="count" />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center total display */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className="text-2xl font-bold text-text">{total}</h1>
          <p className="text-xs text-muted">Total</p>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col items-center">
          <div className="w-5 h-5 bg-[var(--primary)] rounded-full" />
          <h1 className="font-bold text-text">{male}</h1>
          <h2 className="text-xs text-muted">
            Boys ({malePercentage}%)
          </h2>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-5 h-5 bg-[var(--cta)] rounded-full" />
          <h1 className="font-bold text-text">{female}</h1>
          <h2 className="text-xs text-muted">
            Girls ({femalePercentage}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChart;

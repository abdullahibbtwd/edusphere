"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

type StudentStats = { total: number; male: number; female: number };

const CountChart = ({ schoolId }: { schoolId?: string }) => {
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(!!schoolId);

  useEffect(() => {
    if (!schoolId) {
      setStudentStats(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/schools/${schoolId}/students/stats`)
      .then((res) => res.json())
      .then((data: StudentStats) => {
        if (!cancelled && data != null && typeof data.total === "number") {
          setStudentStats({
            total: data.total ?? 0,
            male: data.male ?? 0,
            female: data.female ?? 0,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setStudentStats({ total: 0, male: 0, female: 0 });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [schoolId]);

  const total = studentStats?.total ?? 0;
  const male = studentStats?.male ?? 0;
  const female = studentStats?.female ?? 0;
  const malePercentage = total > 0 ? Math.round((male / total) * 100) : 0;
  const femalePercentage = total > 0 ? Math.round((female / total) * 100) : 0;

  const chartData = [
    { name: "Total", count: total, fill: "var(--muted)" },
    { name: "Boys", count: male, fill: "var(--primary)" },
    { name: "Girls", count: female, fill: "var(--cta)" },
  ];

  if (loading) {
    return (
      <div className="bg-surface rounded-xl p-4 w-full h-full overflow-hidden flex items-center justify-center">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-4 w-full h-full overflow-hidden">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-text">Students</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

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

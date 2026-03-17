"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import CustomSelect from "@/components/ui/CustomSelect";

type RevenuePoint = {
  sessionId: string;
  sessionName: string;
  term: string;
  termLabel: string;
  label: string;
  amount: number;
  cumulative: number;
};

const SchoolCurrency = "₦";

const TERM_ORDER = ["FIRST", "SECOND", "THIRD"];

const FinanceTracking = ({ schoolId }: { schoolId?: string }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [bySessionTerm, setBySessionTerm] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(!!schoolId);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const axisTextColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#374151" : "#e5e7eb";

  useEffect(() => {
    if (!schoolId) {
      setTotalRevenue(0);
      setBySessionTerm([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/schools/${schoolId}/fees/revenue`)
      .then((res) => res.json())
      .then((json: { totalRevenue?: number; bySessionTerm?: RevenuePoint[] }) => {
        if (cancelled) return;
        setTotalRevenue(json.totalRevenue ?? 0);
        setBySessionTerm(Array.isArray(json.bySessionTerm) ? json.bySessionTerm : []);
        setSelectedSessionId("");
      })
      .catch(() => {
        if (!cancelled) {
          setTotalRevenue(0);
          setBySessionTerm([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [schoolId]);

  const sessions = bySessionTerm.reduce<{ id: string; name: string }[]>((acc, r) => {
    if (!acc.some((s) => s.id === r.sessionId)) acc.push({ id: r.sessionId, name: r.sessionName });
    return acc;
  }, []);

  const chartData =
    selectedSessionId === ""
      ? bySessionTerm.reduce<{ name: string; amount: number }[]>((acc, r) => {
          const existing = acc.find((x) => x.name === r.sessionName);
          if (existing) existing.amount += r.amount;
          else acc.push({ name: r.sessionName, amount: r.amount });
          return acc;
        }, []).sort((a, b) => {
          const ai = bySessionTerm.findIndex((r) => r.sessionName === a.name);
          const bi = bySessionTerm.findIndex((r) => r.sessionName === b.name);
          return ai - bi;
        })
      : bySessionTerm
          .filter((r) => r.sessionId === selectedSessionId)
          .sort((a, b) => TERM_ORDER.indexOf(a.term) - TERM_ORDER.indexOf(b.term))
          .map((r) => ({ name: r.termLabel, amount: r.amount }));

  const formatMoney = (value: number) =>
    `${SchoolCurrency}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="bg-[var(--surface)] rounded-lg p-4 h-full flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--muted)]">Loading finance data…</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] rounded-lg p-4 h-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">
            Finance Tracking
          </h2>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Total revenue: {formatMoney(totalRevenue)}
          </p>
        </div>
        <div aria-label="Session">
          <CustomSelect
            options={[
              { value: "", label: "All time" },
              ...sessions.map((s) => ({ value: s.id, label: s.name })),
            ]}
            value={selectedSessionId}
            onChange={setSelectedSessionId}
            placeholder="All time"
            className="w-44"
          />
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center text-[var(--muted)] rounded-lg border border-[var(--border)]">
          No payment data yet.
        </div>
      ) : (
        <div className="w-full h-[320px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisTextColor, fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisTextColor }}
                tickFormatter={(v) => `${SchoolCurrency}${(v / 1000).toFixed(0)}k`}
                label={{
                  value: "Amount",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: axisTextColor, fontSize: 12 },
                }}
              />
              <Tooltip
                formatter={(value: number) => [formatMoney(value), "Revenue"]}
                labelFormatter={(label) => label}
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: axisTextColor,
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)", r: 4 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default FinanceTracking;

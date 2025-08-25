"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Image from "next/image";
import { useTheme } from "next-themes";

const data = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 2000, expenses: 9800 },
  { name: 'Apr', income: 2780, expenses: 3908 },
  { name: 'May', income: 1890, expenses: 4800 },
  { name: 'Jun', income: 2390, expenses: 3800 },
  { name: 'Jul', income: 3490, expenses: 4300 },
  { name: 'Aug', income: 3490, expenses: 4300 },
  { name: 'Sep', income: 3490, expenses: 4300 },
  { name: 'Oct', income: 3490, expenses: 4300 },
  { name: 'Nov', income: 3490, expenses: 4300 },
  { name: 'Dec', income: 3490, expenses: 4300 },
];

const FinanceChart = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const axisTextColor = isDark ? "#e5e7eb" : "#374151"; // light gray in dark, dark gray in light
  const gridColor = isDark ? "#374151" : "#e5e7eb"; // muted grid per mode

  return (
    <div className='bg-[var(--surface)] rounded-lg p-4 h-full'>
      {/* Title */}
      <div className='flex justify-between items-center'>
        <h1 className='text-lg font-semibold text-[var(--text)]'>Finance</h1>
        <Image src="/moreDark.png" alt='' width={20} height={20}/>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={false} stroke={gridColor} />
          <XAxis
            tickMargin={10}
            dataKey="name"
            axisLine={false}
            tick={{ fill: axisTextColor }}
            tickLine={false}
          />
          <YAxis
            tickMargin={10}
            axisLine={false}
            tick={{ fill: axisTextColor }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: axisTextColor,
            }}
          />
          <Legend
            align='center'
            verticalAlign='top'
            wrapperStyle={{ paddingTop: "15px", paddingBottom: "30px", color: axisTextColor }}
          />

          <Line type="monotone" dataKey="income" stroke="#FAE27C" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="expenses" stroke="#C3EBFA" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;

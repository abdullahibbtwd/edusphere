"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState } from 'react';

// Define TypeScript interfaces
interface ClassInfo {
  section: string;
  name: string;
}

interface ChartDataItem {
  name: string;
  [key: string]: number | string; // Dynamic keys for class sections
}

// Define types for filter options
type TermType = "First" | "Second" | "Third";
type YearType = "2023" | "2024";

const levels = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
const classes: ClassInfo[] = [
  { section: "A", name: "Science" },
  { section: "B", name: "Commerce" },
  { section: "C", name: "Arts" },
  { section: "D", name: "Geography" },
];
const terms: TermType[] = ["First", "Second", "Third"];
const years: YearType[] = ["2023", "2024"];

// Define colors for each class
const classColors: Record<string, string> = {
  "A": "#8B5CF6", // Purple
  "B": "#2DD4BF", // Teal
  "C": "#F59E0B", // Amber
  "D": "#EF4444", // Red
};

// Generate sample data with proper typing
const generateData = (
  selectedLevel: string, 
  selectedClass: string, 
  selectedTerm: TermType, 
  selectedYear: YearType
): ChartDataItem[] => {
  return levels.map(level => {
    const dataPoint: ChartDataItem = { name: level };
    
    classes.forEach(cls => {
      // Only show data for selected class if one is selected
      if (!selectedClass || selectedClass === cls.section) {
        // Generate random payment data (60-95% payment rate)
        const paymentRate = Math.floor(Math.random() * 36) + 60;
        dataPoint[cls.section] = paymentRate;
      }
    });
    
    return dataPoint;
  });
};

const SchoolFeesChart = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [selectedTerm, setSelectedTerm] = useState<TermType>("First");
  const [selectedYear, setSelectedYear] = useState<YearType>("2024");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");

  const axisTextColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  
  const chartData = generateData(selectedLevel, selectedClass, selectedTerm, selectedYear);
  
  // Custom tooltip formatter function
  const formatTooltip = (value: number, name: string): [string, string] => {
    const classInfo = classes.find(cls => cls.section === name);
    const displayName = classInfo ? `${name} - ${classInfo.name}` : name;
    return [`${value}%`, displayName];
  };

  // Custom legend formatter function
  const formatLegend = (value: string): string => {
    const classInfo = classes.find(cls => cls.section === value);
    return classInfo ? `${value} - ${classInfo.name}` : value;
  };

  return (
    <div className='bg-[var(--surface)] rounded-lg p-4 h-full'>
      {/* Title and Filters */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3'>
        <h1 className='text-lg font-semibold text-[var(--text)]'>School Fees Payment</h1>
        
        <div className='flex flex-wrap gap-2'>
          <select 
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as TermType)}
            className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-md px-2 py-1 text-sm"
          >
            {terms.map(term => (
              <option key={term} value={term}>{term} Term</option>
            ))}
          </select>
          
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value as YearType)}
            className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-md px-2 py-1 text-sm"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <select 
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-md px-2 py-1 text-sm"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-md px-2 py-1 text-sm"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls.section} value={cls.section}>{cls.section} - {cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
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
            align='center'
            verticalAlign='top'
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "20px", color: axisTextColor }}
            formatter={formatLegend}
          />
          
          {(!selectedClass ? classes : classes.filter(cls => cls.section === selectedClass))
            .map(cls => (
              <Bar 
                key={cls.section}
                dataKey={cls.section}
                fill={classColors[cls.section]}
                radius={[4, 4, 0, 0]}
                name={cls.section}
              />
            ))
          }
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SchoolFeesChart;
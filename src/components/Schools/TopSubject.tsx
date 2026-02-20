"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from "next-themes";
import { useState } from 'react';

// Define TypeScript interfaces
interface SubjectPerformance {
  subject: string;
  passRate: number;
  understanding: number;
}

interface ClassInfo {
  section: string;
  name: string;
}

// Available levels and classes
const levels = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
const classes: ClassInfo[] = [
  { section: "A", name: "Science" },
  { section: "B", name: "Commerce" },
  { section: "C", name: "Arts" },
  { section: "D", name: "Geography" },
];

// Sample data - in a real app this would come from an API
const generateSubjectData = (selectedLevel: string, selectedClass: string): SubjectPerformance[] => {
  // All available subjects
  const allSubjects = [
    "Mathematics", "English Language", "Biology", "Physics", "Chemistry",
    "Geography", "Economics", "Literature", "History", "Government",
    "Accounting", "Commerce", "Agricultural Science", "Further Mathematics",
    "Computer Studies", "Religious Studies", "Civic Education"
  ];
  
  // Select top 10 subjects based on performance
  return allSubjects
    .map(subject => {
      // Generate random performance metrics (higher for some subjects)
      const baseRate = 60 + Math.random() * 35;
      const understanding = baseRate + (Math.random() * 10 - 5);
      
      return {
        subject,
        passRate: Math.round(baseRate),
        understanding: Math.round(understanding)
      };
    })
    .sort((a, b) => b.passRate - a.passRate)
    .slice(0, 10);
};

const TopSubjectsChart = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");

  const axisTextColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  
  const chartData = generateSubjectData(selectedLevel, selectedClass);
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] shadow-lg">
          <p className="font-semibold text-[var(--text)]">{label}</p>
          <p className="text-[#8B5CF6]">Pass Rate: {payload[0].value}%</p>
          <p className="text-[#2DD4BF]">Understanding: {payload[1].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='bg-[var(--surface)] rounded-lg p-4 h-full flex flex-col'>
      {/* Title and Filters */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3'>
        <h1 className='text-lg font-semibold text-[var(--text)]'>Top Performing Subjects</h1>
        
        <div className='flex flex-wrap gap-2'>
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

      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 80, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
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
              tick={{ fill: axisTextColor }}
              tickLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              align='center'
              verticalAlign='top'
              wrapperStyle={{ paddingBottom: '20px', color: axisTextColor }}
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
      </div>

      {/* Summary Statistics */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary p-3 rounded-lg">
          <h3 className="text-sm text-white font-medium">Highest Pass Rate</h3>
          <p className="text-xl font-bold text-white">
            {chartData.length ? `${chartData[0].subject} (${chartData[0].passRate}%)` : 'N/A'}
          </p>
        </div>
        <div className="bg-primary-400 p-3 rounded-lg">
          <h3 className="text-sm text-white font-medium">Average Pass Rate</h3>
          <p className="text-xl font-bold text-white">
            {chartData.length ? `${Math.round(chartData.reduce((sum, item) => sum + item.passRate, 0) / chartData.length)}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-success p-3 rounded-lg">
          <h3 className="text-sm text-white font-medium">Total Subjects</h3>
          <p className="text-xl font-bold text-white">{chartData.length}</p>
        </div>
      </div>
    </div>
  );
};

export default TopSubjectsChart;
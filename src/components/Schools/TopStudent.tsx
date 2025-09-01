"use client"

import { useState } from 'react';
import { useTheme } from "next-themes";
import Image from "next/image";

// Define TypeScript interfaces
interface Student {
  id: number;
  name: string;
  level: string;
  class: string;
  average: number;
  position: number;
  improvement: number; // percentage improvement from last term
  subjects: {
    name: string;
    score: number;
  }[];
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

// Generate sample student data
const generateStudentData = (selectedLevel: string, selectedClass: string): Student[] => {
  // In a real app, this would come from an API
  const firstNames = ["John", "Jane", "David", "Sarah", "Michael", "Emily", "Daniel", "Grace", "James", "Olivia"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
  
  return Array.from({ length: 15 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const level = selectedLevel || levels[Math.floor(Math.random() * levels.length)];
    const classSection = selectedClass || classes[Math.floor(Math.random() * classes.length)].section;
    
    // Generate random average between 70 and 98
    const average = Math.floor(Math.random() * 28) + 70;
    
    // Generate random improvement between -5 and 15
    const improvement = Math.floor(Math.random() * 21) - 5;
    
    return {
      id: i + 1,
      name: `${firstName} ${lastName}`,
      level,
      class: classSection,
      average,
      position: i + 1,
      improvement,
      subjects: [
        { name: "Math", score: Math.floor(Math.random() * 30) + 70 },
        { name: "English", score: Math.floor(Math.random() * 30) + 70 },
        { name: "Science", score: Math.floor(Math.random() * 30) + 70 },
        { name: "Social Studies", score: Math.floor(Math.random() * 30) + 70 },
      ]
    };
  }).sort((a, b) => b.average - a.average)
    .map((student, index) => ({ ...student, position: index + 1 }));
};

const TopStudentsLeaderboard = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");

  const studentData = generateStudentData(selectedLevel, selectedClass);
  
  // Get medal emoji based on position
  const getMedal = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return position;
  };

  return (
    <div className='bg-[var(--surface)] rounded-lg p-4 h-full flex flex-col'>
      {/* Title and Filters */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3'>
        <h1 className='text-lg font-semibold text-[var(--text)]'>Top Performing Students</h1>
        
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

      {/* Leaderboard */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-2 text-[var(--text)] font-medium">Rank</th>
              <th className="text-left py-2 text-[var(--text)] font-medium">Student</th>
              <th className="text-left py-2 text-[var(--text)] font-medium">Level</th>
              <th className="text-left py-2 text-[var(--text)] font-medium">Class</th>
              <th className="text-left py-2 text-[var(--text)] font-medium">Average</th>
              <th className="text-left py-2 text-[var(--text)] font-medium">Improvement</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((student) => (
              <tr key={student.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
                <td className="py-3">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    student.position === 1 ? "bg-yellow-100 text-yellow-800" :
                    student.position === 2 ? "bg-gray-100 text-gray-800" :
                    student.position === 3 ? "bg-amber-100 text-amber-800" :
                    "bg-[var(--accent)] text-[var(--text)]"
                  }`}>
                    {getMedal(student.position)}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white mr-3">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--text)]">{student.name}</div>
                      <div className="text-sm text-[var(--muted)]">ID: {student.id.toString().padStart(4, '0')}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-[var(--text)]">{student.level}</td>
                <td className="py-3 text-[var(--text)]">{student.class}</td>
                <td className="py-3">
                  <div className="flex items-center">
                    <div className="w-12 h-2 bg-[var(--border)] rounded-full mr-2">
                      <div 
                        className="h-2 rounded-full bg-[var(--primary)]" 
                        style={{ width: `${student.average}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-[var(--text)]">{student.average}%</span>
                  </div>
                </td>
                <td className="py-3">
                  <div className={`flex items-center ${student.improvement >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    {student.improvement >= 0 ? (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                    {Math.abs(student.improvement)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[var(--primary)] mr-2"></div>
            <div className="text-sm text-[var(--text)]">
              <span className="font-semibold">{studentData.length}</span> students displayed
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[var(--success)] mr-2"></div>
            <div className="text-sm text-[var(--text)]">
              Class average: <span className="font-semibend">
                {Math.round(studentData.reduce((sum, student) => sum + student.average, 0) / studentData.length)}%
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[var(--cta)] mr-2"></div>
            <div className="text-sm text-[var(--text)]">
              Top student: <span className="font-semibend">{studentData[0]?.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopStudentsLeaderboard;
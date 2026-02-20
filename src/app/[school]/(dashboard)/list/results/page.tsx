"use client";

import { useState } from "react";

const summaryColumns = [
  { header: "Student Name", accessor: "studentName" },
  { header: "Total Score", accessor: "totalScore" },
  { header: "Average", accessor: "average" },
  { header: "Grade", accessor: "grade" },
  { header: "Actions", accessor: "actions" },
];

const detailColumns = [
  { header: "Subject", accessor: "subject" },
  { header: "Assignment", accessor: "assignment" },
  { header: "CA", accessor: "ca" },
  { header: "Attendance", accessor: "attendance" },
  { header: "Exam", accessor: "exam" },
  { header: "Total", accessor: "total" },
  { header: "Grade", accessor: "grade" },
];

// Dummy data for students
const dummyStudents = [
  {
    _id: "1",
    firstName: "John",
    lastName: "Doe",
    subjects: [
      { subject: "Math", assignment: 8, ca: 15, attendance: 5, exam: 60 },
      { subject: "English", assignment: 9, ca: 14, attendance: 4, exam: 55 },
    ],
  },
  {
    _id: "2",
    firstName: "Jane",
    lastName: "Smith",
    subjects: [
      { subject: "Math", assignment: 10, ca: 18, attendance: 5, exam: 50 },
      { subject: "English", assignment: 7, ca: 12, attendance: 5, exam: 58 },
      { subject: "Biology", assignment: 9, ca: 16, attendance: 4, exam: 60 },
    ],
  },
];

// Function to calculate grade letter
function getGrade(score) {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}

export default function ResultsPage() {
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Calculate summaries
  const studentSummaries = dummyStudents.map((student) => {
    const subjectTotals = student.subjects.map(
      (s) => s.assignment + s.ca + s.attendance + s.exam
    );
    const totalScore = subjectTotals.reduce((a, b) => a + b, 0);
    const average = subjectTotals.length > 0 ? totalScore / subjectTotals.length : 0;
    const grade = getGrade(average);

    return {
      _id: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      totalScore,
      average: average.toFixed(2),
      grade,
      subjects: student.subjects.map((s) => ({
        ...s,
        total: s.assignment + s.ca + s.attendance + s.exam,
        grade: getGrade(s.assignment + s.ca + s.attendance + s.exam),
      })),
    };
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Results Summary</h1>

      {/* Summary Table */}
      <div className="overflow-x-auto rounded-lg ">
        <table className="w-full bg-surface  border-collapse text-sm">
          <thead className="bg-primary text-white">
            <tr>
              {summaryColumns.map((col) => (
                <th key={col.accessor} className="px-4 py-2 text-left font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {studentSummaries.map((student) => (
              <tr
                key={student._id}
                className=""
              >
                <td className="px-4 py-2 font-medium">{student.studentName}</td>
                <td className="px-4 py-2">{student.totalScore}</td>
                <td className="px-4 py-2">{student.average}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.grade === "F"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {student.grade}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    className="px-3 py-1 text-sm bg-primary text-white rounded-md"
                    onClick={() => setSelectedStudent(student)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 bg-opacity-50 z-50">
          <div className="bg-surface rounded-lg shadow-lg max-w-4xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Detailed Results - {selectedStudent.studentName}
              </h2>
             <div className="flex gap-4 items-center">
              <button
                className="cursor-pointer bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
              <button
                className="cursor-pointer bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center"
                onClick={() => setSelectedStudent(null)}
              >
                +
              </button>
             </div>
              
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    {detailColumns.map((col) => (
                      <th key={col.accessor} className="px-4 py-2 text-left font-semibold">
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.subjects.map((subj, idx) => (
                    <tr
                      key={idx}
                      className=" border-b border-gray-200 dark:border-gray-600"
                    >
                      <td className="px-4 py-2 font-medium">{subj.subject}</td>
                      <td className="px-4 py-2">{subj.assignment}</td>
                      <td className="px-4 py-2">{subj.ca}</td>
                      <td className="px-4 py-2">{subj.attendance}</td>
                      <td className="px-4 py-2">{subj.exam}</td>
                      <td className="px-4 py-2">{subj.total}</td>
                      <td className="px-4 py-2">{subj.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-primary text-white rounded-md"
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import { useState, useEffect, useCallback } from "react";
import ExamFormModel from "@/components/ExamFormModel";
import { Button, Box, Typography } from "@mui/material";
import { toast } from "sonner";
import {Select, MenuItem} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";

// Dummy exam timetable data
type ExamTimetable = {
  _id: string;
  courseCode: string;
  courseName: string;
  creditUnit: number;
  teacher: string;
  invigilator?: string;
  examHall: string;
  date: string;
  startTime: string;
  endTime: string;
  program: string;
  level: string;
  semester: string;
};

const dummyExams: ExamTimetable[] = [
  {
    _id: "1",
    courseCode: "MTH101",
    courseName: "General Mathematics",
    creditUnit: 3,
    teacher: "Mr. John",
    invigilator: "Mrs. Jane",
    examHall: "Hall A",
    date: "2025-09-01",
    startTime: "09:00",
    endTime: "11:00",
    program: "SS1A",
    level: "SS1",
    semester: "First Term",
  },
  {
    _id: "2",
    courseCode: "ENG102",
    courseName: "English Language",
    creditUnit: 2,
    teacher: "Mrs. Smith",
    invigilator: "Mr. Mike",
    examHall: "Hall B",
    date: "2025-09-03",
    startTime: "12:00",
    endTime: "14:00",
    program: "SS2B",
    level: "SS2",
    semester: "Second Term",
  },
  {
    _id: "3",
    courseCode: "PHY103",
    courseName: "Physics",
    creditUnit: 3,
    teacher: "Dr. Kelvin",
    invigilator: "Mr. Paul",
    examHall: "Hall C",
    date: "2025-09-05",
    startTime: "10:00",
    endTime: "12:00",
    program: "SS3C",
    level: "SS3",
    semester: "Third Term",
  },
];

const columns = [
  { header: "Course Code", accessor: "courseCode" },
  { header: "Course Name", accessor: "courseName" },
  { header: "Credit Unit", accessor: "creditUnit" },
  { header: "Teacher", accessor: "teacher" },
  { header: "Invigilator", accessor: "invigilator" },
  { header: "Exam Hall", accessor: "examHall" },
  { header: "Date", accessor: "date" },
  { header: "Time", accessor: "time" },
  { header: "Class", accessor: "Class" },
  { header: "Level", accessor: "level" },
  { header: "Term", accessor: "Term" },
  { header: "Actions", accessor: "action" },
];

export default function ExamsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"add" | "edit" | "delete">("add");
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [semester, setSemester] = useState("First Term");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredExams = dummyExams.filter((exam) => exam.semester === semester);

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleOpenForm = (type: "add" | "edit" | "delete", exam?: any) => {
    setFormType(type);
    setSelectedExam(exam);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedExam(null);
  };

  const renderRow = (item: any) => (
    <tr
      key={item._id}
      className="border-b border-gray-200 bg-surface text-sm"
    >
      <td className="p-3 font-semibold">{item.courseCode}</td>
      <td className="p-3">{item.courseName}</td>
      <td className="p-3">{item.creditUnit}</td>
      <td className="p-3">{item.teacher}</td>
      <td className="p-3">{item.invigilator}</td>
      <td className="p-3">{item.examHall}</td>
      <td className="p-3">{item.date}</td>
      <td className="p-3">{`${item.startTime} - ${item.endTime}`}</td>
      <td className="p-3">{item.program}</td>
      <td className="p-3">{item.level}</td>
      <td className="p-3">{item.semester}</td>
      <td className="p-3">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handleOpenForm("edit", item)}
            className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full bg-primary"
          >
            
            <FaEdit size={15} className="text-white" />
          </button>
          <button
            onClick={() => handleOpenForm("delete", item)}
            className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full bg-danger"
          >
            <FaTrash size={15} className="text-white" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col bg-surface p-6 m-4 rounded-xl shadow-md">
      {/* Top */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-semibold text-lg">Exam Timetables</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => handleOpenForm("add")}
            variant="contained"
            className="bg-primary hover:bg-primary-400 text-white"
          >
            Add Exam
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <Select 
          className=" text-text rounded bg-surface"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <MenuItem value="First Term">First Term</MenuItem>
          <MenuItem value="Second Term">Second Term</MenuItem>
          <MenuItem value="Third Term">Third Term</MenuItem>
        </Select>
      </div>

      {/* Table */}
      <div className="mt-2">
        <Table columns={columns} renderRow={renderRow} data={currentExams} />
      </div>

      {/* Pagination */}
      <div className="mt-4">
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Form Modal */}
      <ExamFormModel
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        type={formType}
        data={selectedExam}
      />
    </div>
  );
}

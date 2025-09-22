"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import FormModel from "@/components/FormModel";

// Define student type
 type Student = {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  photo: string;
  phone?: string;
  grade: number;
  class: string;
  address: string;
  departmentId?: string;
  programId?: string;
  level?: "level1" | "level2" | "graduate";
  departmentName?: string;
  programName?: string;
};

const columns = [
  { header: "info", accessor: "info" },
  { header: "Student ID", accessor: "studentId", className: "hidden md:table-cell" },
  { header: "Department", accessor: "department", className: "hidden md:table-cell" },
  { header: "Program", accessor: "course", className: "hidden md:table-cell" },
  { header: "Level", accessor: "level", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "action" },
];

const StudentPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock students data (replace with real API when needed)
  const students: Student[] = [
    {
      _id: "1",
      studentId: "STU001",
      firstName: "John",
      lastName: "Doe",
      photo: "/avatar.png",
      grade: 1,
      class: "A",
      address: "Abuja",
      level: "level1",
      departmentName: "Computer Science",
      programName: "Software Engineering",
    },
    {
      _id: "2",
      studentId: "STU002",
      firstName: "Jane",
      lastName: "Smith",
      photo: "/avatar.png",
      grade: 2,
      class: "B",
      address: "Lagos",
      level: "level2",
      departmentName: "Mathematics",
      programName: "Statistics",
    },
  ];

  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = students.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const renderRow = (item: Student) => (
    <tr
      key={item._id}
      className="border-b border-gray-300 bg-surface text-[12px] hover:bg-[#E5E5FF] dark:hover:bg-[#333333]"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.photo}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold ">
            {item.firstName} {item.lastName}
          </h3>
          <h3 className="text-xs text-gray-600 dark:text-gray-400">{item.class}</h3>
        </div>
      </td>
      <td className="hidden md:table-cell ">{item.studentId}</td>
      <td className="hidden md:table-cell ">{item.departmentName || "Unassigned"}</td>
      <td className="hidden md:table-cell ">{item.programName || "Unassigned"}</td>
      <td className="hidden md:table-cell capitalize ">{item.level || "Unassigned"}</td>
      <td>
        <div className="flex gap-2 items-center">
          <FormModel
            table="studentAssignment"
            type="edit"
            data={{
              ...item,
              id: item._id,
              department: item.departmentId,
              program: item.programId,
              currentLevel: item.level,
            }}
          />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col bg-surface p-4 m-4 mt-0 flex-1 rounded-2xl shadow">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block font-semibold text-text">
          All Students
        </h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full  cursor-pointer">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <FormModel table="student" type="plus" />
          </div>
        </div>
      </div>

      {/* Student List */}
      <div>
        <Table 
          columns={columns} 
          renderRow={renderRow} 
          data={currentStudents} 
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  ); 
};

export default StudentPage;

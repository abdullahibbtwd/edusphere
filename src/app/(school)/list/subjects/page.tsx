"use client"
import Image from "next/image";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import FormModel from "@/components/FormModel";
import { FaSort,FaFilter } from "react-icons/fa";
import { useState, useCallback } from "react";

// Dummy Course Type
type Course = {
  _id: string;
  name: string;
  code: string;
  creditUnit: number;
  semester: string;
  isGeneral: boolean;
  programs: string[];
  teachers: string[];
};

// Dummy Columns
const columns = [
  { header: "Course Name", accessor: "name" },
  { header: "Code", accessor: "code", className: "hidden md:table-cell" },
  { header: "Credit Unit", accessor: "creditUnit", className: "hidden md:table-cell" },
  { header: "Term", accessor: "term" },
  { header: "Class", accessor: "class", className: "hidden md:table-cell" },
  { header: "Teachers", accessor: "teachers", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "action" },
];

// Dummy Data
const dummyCourses: Course[] = [
  {
    _id: "1",
    name: "Mathematics 101",
    code: "MATH101",
    creditUnit: 3,
    semester: "First",
    isGeneral: true,
    programs: ["All Programs"],
    teachers: ["Dr. John Doe"],
  },
  {
    _id: "2",
    name: "Physics 201",
    code: "PHYS201",
    creditUnit: 4,
    semester: "Second",
    isGeneral: false,
    programs: ["Engineering", "Science"],
    teachers: ["Prof. Jane Smith"],
  },
  {
    _id: "3",
    name: "Computer Science 301",
    code: "CS301",
    creditUnit: 3,
    semester: "First",
    isGeneral: false,
    programs: ["Computer Science"],
    teachers: ["Dr. Alan Turing"],
  },
];

const CoursesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination logic
  const totalPages = Math.ceil(dummyCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = dummyCourses.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const renderRow = (item: Course, index: number) => (
    <tr
      key={item._id}
     
      className="border-b table-custom border-gray-200  text-[12px] hover:bg-[#F1F0FF]"
    >
      <td className="font-semibold p-4 px-1 items-center">{item.name}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center">{item.code}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center">{item.creditUnit}</td>
      <td className="p-4 px-1 items-center">{item.semester}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center">{item.programs.join(", ")}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center">{item.teachers.join(", ")}</td>
      <td>
        <div className="flex gap-2 items-center">
          <FormModel table="course" type="edit" data={item} />
          <FormModel table="course" type="delete" id={item._id} />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col bg-surface p-4 m-4 mt-0 flex-1">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block font-semibold text-gray-700">All Courses</h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full ">
              <FaFilter className=""size={18}/>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full ">
              <FaSort className="" size={18}/>
            </button>
            <FormModel table="course" type="plus" />
          </div>
        </div>
      </div>

      {/* Course List */}
      <div>
        <Table columns={columns} renderRow={renderRow} data={currentCourses} />
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

export default CoursesPage;
"use client"
import Image from "next/image";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import FormModel from "@/components/FormModel";
import { FaSort,FaFilter } from "react-icons/fa";
import { useState, useCallback } from "react";

// Level Type
type Level = {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  classCount: number;
  subjectCount: number;
  studentCount: number;
};

// Columns
const columns = [
  { header: "Level Name", accessor: "name" },
  { header: "Description", accessor: "description", className: "hidden md:table-cell" },
  { header: "Classes", accessor: "classCount", className: "hidden md:table-cell" },
  { header: "Subjects", accessor: "subjectCount", className: "hidden md:table-cell" },
  { header: "Students", accessor: "studentCount", className: "hidden md:table-cell" },
  { header: "Status", accessor: "status" },
  { header: "Actions", accessor: "action" },
];

// Dummy Data
const dummyLevels: Level[] = [
  {
    _id: "1",
    name: "JSS1",
    description: "Junior Secondary School Year 1",
    isActive: true,
    classCount: 4,
    subjectCount: 8,
    studentCount: 120,
  },
  {
    _id: "2",
    name: "JSS2",
    description: "Junior Secondary School Year 2",
    isActive: true,
    classCount: 4,
    subjectCount: 8,
    studentCount: 115,
  },
  {
    _id: "3",
    name: "JSS3",
    description: "Junior Secondary School Year 3",
    isActive: true,
    classCount: 4,
    subjectCount: 8,
    studentCount: 110,
  },
  {
    _id: "4",
    name: "SS1",
    description: "Senior Secondary School Year 1",
    isActive: true,
    classCount: 4,
    subjectCount: 10,
    studentCount: 100,
  },
  {
    _id: "5",
    name: "SS2",
    description: "Senior Secondary School Year 2",
    isActive: true,
    classCount: 4,
    subjectCount: 10,
    studentCount: 95,
  },
  {
    _id: "6",
    name: "SS3",
    description: "Senior Secondary School Year 3",
    isActive: true,
    classCount: 4,
    subjectCount: 10,
    studentCount: 90,
  },
];

const LevelsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination logic
  const totalPages = Math.ceil(dummyLevels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLevels = dummyLevels.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const renderRow = (item: Level, index: number) => (
    <tr
      key={item._id}
      className="border-b table-custom border-gray-200  text-[12px] hover:bg-[#F1F0FF]"
    >
      <td className="font-semibold p-4 px-1 items-center">{item.name}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center">{item.description}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center">{item.classCount}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center">{item.subjectCount}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center">{item.studentCount}</td>
      <td className="p-4 px-1 items-center">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {item.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td>
        <div className="flex gap-2 items-center">
          <FormModel table="level" type="edit" data={item} />
          <FormModel table="level" type="delete" id={item._id} />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col bg-surface p-4 m-4 mt-0 flex-1">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block font-semibold text-gray-700">All Levels</h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full ">
              <FaFilter className=""size={18}/>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full ">
              <FaSort className="" size={18}/>
            </button>
            <FormModel table="level" type="plus" />
          </div>
        </div>
      </div>

      {/* Level List */}
      <div>
        <Table columns={columns} renderRow={renderRow} data={currentLevels} />
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

export default LevelsPage;

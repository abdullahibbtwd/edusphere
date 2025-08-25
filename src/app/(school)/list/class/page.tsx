"use client";
import Image from "next/image";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import FormModel from "@/components/FormModel";
import { useState, useCallback } from "react";
import ClassManagementModal from "@/components/ClassManagementModel";
import { FaFilter, FaSort } from "react-icons/fa";

const columns = [
  { header: "Class", accessor: "className" },
  { header: "No. of Students", accessor: "studentCount" },
  { header: "Head Teacher", accessor: "headTeacher" },
  { header: "Subjects", accessor: "subjects" },
  { header: "Actions", accessor: "action" },
];

// Dummy class data (SS1–SS3, each A–D)
const dummyClasses = [
  { _id: "1", className: "SS1A", studentCount: 35, headTeacher: "Mr. Adams", subjects: "Math, English, Physics" },
  { _id: "2", className: "SS1B", studentCount: 33, headTeacher: "Mrs. Grace", subjects: "Biology, Chemistry, Lit" },
  { _id: "3", className: "SS1C", studentCount: 32, headTeacher: "Mr. James", subjects: "Civic, History, English" },
  { _id: "4", className: "SS1D", studentCount: 30, headTeacher: "Mrs. Rose", subjects: "Economics, Government" },
  { _id: "5", className: "SS2A", studentCount: 36, headTeacher: "Mr. Daniel", subjects: "Math, English, Biology" },
  { _id: "6", className: "SS2B", studentCount: 34, headTeacher: "Mrs. Hannah", subjects: "Physics, Chemistry" },
  { _id: "7", className: "SS2C", studentCount: 33, headTeacher: "Mr. Peter", subjects: "Literature, History" },
  { _id: "8", className: "SS2D", studentCount: 31, headTeacher: "Mr. Samuel", subjects: "Economics, Geography" },
  { _id: "9", className: "SS3A", studentCount: 29, headTeacher: "Mrs. Janet", subjects: "Math, Chemistry" },
  { _id: "10", className: "SS3B", studentCount: 28, headTeacher: "Mr. Paul", subjects: "Biology, English" },
  { _id: "11", className: "SS3C", studentCount: 27, headTeacher: "Mrs. Vivian", subjects: "Government, History" },
  { _id: "12", className: "SS3D", studentCount: 34, headTeacher: "Mr. Victor", subjects: "Lit, Economics" },
];

// Graduate total (not in table)
const graduates = 85;

const SecondarySchoolPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string>("");

  // Pagination
  const totalPages = Math.ceil(dummyClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClasses = dummyClasses.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleOpenClassModal = (classId: string, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setIsClassModalOpen(true);
  };

  const handleCloseClassModal = () => {
    setIsClassModalOpen(false);
    setSelectedClassId(null);
    setSelectedClassName("");
  };

  // Stats
  const totalSS1 = dummyClasses.filter(c => c.className.startsWith("SS1")).reduce((sum, c) => sum + c.studentCount, 0);
  const totalSS2 = dummyClasses.filter(c => c.className.startsWith("SS2")).reduce((sum, c) => sum + c.studentCount, 0);
  const totalSS3 = dummyClasses.filter(c => c.className.startsWith("SS3")).reduce((sum, c) => sum + c.studentCount, 0);

const renderRow = (item: any, index: number) => (
  <tr
    key={item._id}
    className={`
      ${index % 2 === 0 ? "bg-bg" : "bg-surface"} 
      border-b border-muted text-text
      hover:bg-accent transition-colors text-[12px]
    `}
  >
    <td className="font-semibold p-4 px-1">{item.className}</td>
    <td className="p-4 px-1">{item.studentCount}</td>
    <td className="p-4 px-1">{item.headTeacher}</td>
    <td className="p-4 px-1 whitespace-pre-line">{item.subjects}</td>
    <td>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => handleOpenClassModal(item._id, item.className)}
          className="bg-success text-surface px-2 py-1 rounded text-xs hover:opacity-90"
        >
          Manage Class
        </button>
        <FormModel table="class" type="edit" data={item} onEdit={() => {}} />
        <FormModel table="class" type="delete" id={item._id} onDelete={() => {}} />
      </div>
    </td>
  </tr>
);

  return (
    <div className="flex flex-col bg-surface p-4 m-4 mt-0 flex-1 rounded-lg shadow-sm">
      {/* Stats at the top */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div className="p-3 rounded-lg text-center bg-primary text-text">
    <p className="text-lg font-bold ">{totalSS1}</p>
    <p className="text-sm ">Total SS1 Students</p>
  </div>
  <div className="p-3 rounded-lg text-center bg-cta text-text">
    <p className="text-lg font-bold ">{totalSS2}</p>
    <p className="text-sm ">Total SS2 Students</p>
  </div>
  <div className="p-3 rounded-lg text-center bg-success text-text">
    <p className="text-lg font-bold">{totalSS3}</p>
    <p className="text-sm ">Total SS3 Students</p>
  </div>
  <div className="p-3 rounded-lg text-center bg-primary-400 text-text">
    <p className="text-lg font-bold ">{graduates}</p>
    <p className="text-sm ">Graduates</p>
  </div>
</div>


      <div className="flex justify-between items-center mb-4">
        <h1 className="hidden md:block font-semibold  text-xl">
          Our School Classes
        </h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
           <button className="w-8 h-8 flex items-center justify-center rounded-full ">
                      <FaFilter className=""size={18}/>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full ">
                      <FaSort className="" size={18}/>
                    </button>
            <FormModel table="class" type="plus" onAdd={() => {}} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table columns={columns} renderRow={renderRow} data={currentClasses} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      {isClassModalOpen && selectedClassId && (
        <ClassManagementModal
          classId={selectedClassId}
          className={selectedClassName}
          onClose={handleCloseClassModal}
        />
      )}
    </div>
  );
};

export default SecondarySchoolPage;

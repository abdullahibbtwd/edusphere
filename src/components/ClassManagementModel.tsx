// components/ClassManagementModal.tsx
"use client";
import React, { useState } from "react";
import Image from "next/image";
import Table from "./Table"; // Assuming you already have a Table component

interface ClassManagementModalProps {
  schoolName: string;
  onClose: () => void;
}

// Dummy Data for Secondary School Classes
const initialClasses = [
  { id: "SS1A", name: "SS1 A", studentCount: 35 },
  { id: "SS1B", name: "SS1 B", studentCount: 40 },
  { id: "SS1C", name: "SS1 C", studentCount: 38 },
  { id: "SS1D", name: "SS1 D", studentCount: 42 },
  { id: "SS2A", name: "SS2 A", studentCount: 33 },
  { id: "SS2B", name: "SS2 B", studentCount: 39 },
  { id: "SS2C", name: "SS2 C", studentCount: 37 },
  { id: "SS2D", name: "SS2 D", studentCount: 41 },
  { id: "SS3A", name: "SS3 A", studentCount: 32 },
  { id: "SS3B", name: "SS3 B", studentCount: 34 },
  { id: "SS3C", name: "SS3 C", studentCount: 36 },
  { id: "SS3D", name: "SS3 D", studentCount: 30 },
];

const ClassManagementModal: React.FC<ClassManagementModalProps> = ({
  schoolName,
  onClose,
}) => {
  const [classes, setClasses] = useState(initialClasses);

  const handlePromote = (classId: string) => {
    alert(`Promoting students from ${classId} to next class...`);
  };

  const handleDelete = (classId: string) => {
    setClasses(classes.filter((c) => c.id !== classId));
  };

  const classColumns = [
    { header: "Class", accessor: "name" },
    { header: "Students", accessor: "studentCount" },
    { header: "Actions", accessor: "action" },
  ];

  // Render Row
  const renderClassRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 odd:bg-[#FEFCEB] hover:bg-[#F1F0FF] text-sm"
    >
      <td className="font-semibold p-3">{item.name}</td>
      <td className="p-3">{item.studentCount}</td>
      <td>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => handlePromote(item.id)}
            className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 transition-colors"
          >
            Promote
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 relative w-full max-w-3xl rounded-lg shadow-xl animate-fade-in-down">
        <h2 className="text-xl font-bold mb-4">
          Manage Classes for {schoolName}
        </h2>

        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          {classes.length > 0 ? (
            <Table columns={classColumns} renderRow={renderClassRow} data={classes} />
          ) : (
            <p className="text-center text-gray-500 py-8">
              No classes found for this school.
            </p>
          )}
        </div>

        <button
          className="absolute top-4 right-4 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <Image src="/close.png" alt="Close" width={14} height={14} />
        </button>
      </div>
    </div>
  );
};

export default ClassManagementModal;

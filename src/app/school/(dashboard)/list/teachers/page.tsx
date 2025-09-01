"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import FormModel from "@/components/FormModel";
import { FiEye } from "react-icons/fi";

type Teacher = {
  _id: string;
  teacherId: string;
  name: string;
  email: string;
  img: string;
  phone: string;
subjectsId: string[];
  address: string;
};

const columns = [
  { header: "info", accessor: "info" },
  { header: "Teacher ID", accessor: "teacherId", className: "hidden md:table-cell" },
  { header: "Subjects", accessor: "subject", className: "hidden md:table-cell" },
  { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

// Dummy Data
const dummyTeachers: Teacher[] = [
  {
    _id: "1",
    teacherId: "T-001",
    name: "John Doe",
    email: "john@example.com",
    img: "/default-avatar.png",
    phone: "08012345678",
    subjectsId: ["Math", "Physics"],
    address: "Abuja, Nigeria",
  },
  {
    _id: "2",
    teacherId: "T-002",
    name: "Jane Smith",
    email: "jane@example.com",
    img: "/default-avatar.png",
    phone: "08098765432",
    subjectsId: ["Biology"],
    address: "Lagos, Nigeria",
  },
  {
    _id: "3",
    teacherId: "T-003",
    name: "Ali Musa",
    email: "ali@example.com",
    img: "/default-avatar.png",
    phone: "08123456789",
    subjectsId: ["Chemistry", "English"],
    address: "Kano, Nigeria",
  },
];

const TeachersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dummy user role (change to "admin", "teacher", or "student")
  const userData = { role: "admin", email: "john@example.com" };

  // Filter teachers based on role
  const filteredTeachers = dummyTeachers.filter((teacher) => {
    if (!userData) return false;
    if (userData.role === "admin") return true;
    if (userData.role === "teacher") return teacher.email === userData.email;
    if (userData.role === "student") return true;
    return false;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTeachers = filteredTeachers.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const getSubjectNames = (courseIds: string[]) => {
    return courseIds.join(", ");
  };

  const renderRow = (item: Teacher) => (
    <tr
      key={item._id}
      className="border-b border-border even:bg-secondary odd:bg-accent text-[12px] hover:bg-muted"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/default-avatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold text-foreground">{item.name}</h3>
          <h3 className="text-xs text-muted-foreground">{item.email}</h3>
        </div>
      </td>
      <td className="hidden md:table-cell text-foreground">{item.teacherId}</td>
      <td className="hidden md:table-cell text-foreground">{getSubjectNames(item.subjectsId)}</td>
      <td className="hidden md:table-cell text-foreground">{item.phone}</td>
      <td className="hidden md:table-cell text-foreground">{item.address}</td>
      <td>
        <div className="flex gap-2 items-center">
          <button
className="p-2 rounded-full hover:bg-accent transition"
title="View"
>
<FiEye className="text-foreground w-4 h-4" />
</button>
          {userData?.role === "admin" && (
            <>
              <FormModel table="teacher" type="edit" data={item} />
              <FormModel table="teacher" type="delete" id={item._id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col bg-background p-4 m-4 mt-0 flex-1 rounded-2xl shadow">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block font-semibold text-foreground">
          {userData?.role === "admin"
            ? "All Teachers"
            : userData?.role === "teacher"
            ? "My Profile"
            : "Teachers"}
        </h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-accent cursor-pointer">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-accent cursor-pointer">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {userData?.role === "admin" && <FormModel table="teacher" type="plus" />}
          </div>
        </div>
      </div>

      {/* Teacher Table */}
      <div>
        <Table columns={columns} renderRow={renderRow} data={currentTeachers} />
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

export default TeachersPage;

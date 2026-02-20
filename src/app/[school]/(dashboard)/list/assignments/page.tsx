"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import {assignmentsData, examsData, role,  } from "@/lib/data";
import FormModel from "@/components/FormModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Assignment = {
  id: number;
  subject: string;
  class: string;
  teacher: string[];
  dueDate:string;

};

const columns = [
  {
    header: "Subject",
    accessor: "subject",
  },

  
  {
    header: "Class",
    accessor: "class",
 
  },
    {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
    {
    header: "Date",
    accessor: " dueDate",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const AssignmentsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const assignments = useQuery(api.assignments.getAssignments) || [];
  const userData = useQuery(api.users.getCurrentUser);

  // Filter assignments based on user role
  const filteredAssignments = assignments.filter(assignment => {
    if (!userData) return false;
    
    // Admin can see all assignments
    if (userData.role === "admin") return true;
    
    // Teacher can only see assignments they created
    if (userData.role === "teacher") {
      return assignment.teacherId === userData._id;
    }
    
    // Student can only see assignments for their courses
    if (userData.role === "student") {
      // TODO: Implement student's assignment filtering
      return true;
    }
    
    return false;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, endIndex);

  // Use useCallback to memoize the page change handler
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const renderRow = (item: Assignment) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-[12px] odd:bg-[#FEFCEB] hover:bg-[#F1F0FF]">
      
          <td className="font-semibold p-4  px-1 items-center ">{item.subject}</td>
          <td className=" p-4 px-1 items-center ">{item.class}</td>
          <td className="hidden md:table-cell p-4 px-1 items-center ">{item.teacher}</td>
          <td className="hidden md:table-cell p-4 px-1 items-center ">{item. dueDate}</td>
        
      

      <td>
        <div className="flex gap-2 items-center">
          
            
            {role === "admin" && 

            <>
            <FormModel table="assignment" type="edit" data={item}/>  
             <FormModel table="assignment" type="delete" id={item.id}/>
            </>
            
             
        
             }
        </div>
      </td>
    </tr>
  );
  return (
    <div className="flex flex-col bg-white p-4 m-4 mt-0 flex-1">
      {/*Top  */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block font-semibold text-gray-700">
          {userData?.role === "admin" ? "All Assignments" : 
           userData?.role === "teacher" ? "My Assignments" : 
           "Available Assignments"}
        </h1>
        <div className="flex flex-col md:flex-row  w-full md:w-auto items-center gap-2">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
           { userData?.role === "admin" && 
               <FormModel table="assignment" type="plus" />
           
          //  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
          //     <Image src="/plus.png" alt="" width={14} height={14} />
          //   </button>
            }
          </div>
        </div>
      </div>
      {/*list  */}
      <div className="">
        <Table columns={columns} renderRow={renderRow} data={currentAssignments}/>
      </div>
      {/*Bottom  */}
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

export default AssignmentsPage;

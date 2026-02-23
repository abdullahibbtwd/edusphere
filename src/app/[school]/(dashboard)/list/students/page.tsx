"use client";
import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import FormModel from "@/components/FormModel";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  UserPlusIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { Filter } from "lucide-react";
import StudentRegistrationDialog from "@/components/StudentRegistrationDialog";
import RecordPaymentDialog from "@/components/RecordPaymentDialog";

// Define student type
type Student = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  photo: string;
  phone?: string;
  registrationNumber?: string;
  isRegistered: boolean;
  status: string;
  levelName: string;
  className: string;
  classId: string;
  admissionSession?: string;
  currentSession?: string;
  paymentPlan?: string;
  createdAt: string;
};

const columns = [
  { header: "Student", accessor: "info" },
  { header: "Reg Number", accessor: "registrationNumber", className: "hidden md:table-cell" },
  { header: "Level", accessor: "level", className: "hidden lg:table-cell" },
  { header: "Class", accessor: "class", className: "hidden md:table-cell" },
  { header: "Status", accessor: "status", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "action" },
];

const StudentPage = () => {
  const params = useParams();
  const schoolId = params.school as string;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [schoolName, setSchoolName] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterRegStatus, setFilterRegStatus] = useState("");
  const [filterPaymentPlan, setFilterPaymentPlan] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Lookups
  const [classes, setClasses] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [clsRes, lvlRes] = await Promise.all([
          fetch(`/api/schools/${schoolId}/classes`),
          fetch(`/api/schools/${schoolId}/levels`)
        ]);
        if (clsRes.ok) setClasses((await clsRes.json()).classes || []);
        if (lvlRes.ok) setLevels((await lvlRes.json()).levels || []);
      } catch (e) { console.error("Lookup fetch failed", e); }
    };
    fetchLookups();
  }, [schoolId]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/schools/${schoolId}/students?page=${currentPage}&limit=${itemsPerPage}`;
      if (searchQuery) url += `&query=${encodeURIComponent(searchQuery)}`;
      if (filterClass) url += `&classId=${filterClass}`;
      if (filterLevel) url += `&levelId=${filterLevel}`;
      if (filterRegStatus) url += `&isRegistered=${filterRegStatus === "registered"}`;
      if (filterPaymentPlan) url += `&paymentPlan=${filterPaymentPlan}`;

      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setStudents(data.students);
        setTotalCount(data.pagination.totalCount);
        setSchoolName(data.schoolName || "");
      } else {
        toast.error(data.error || "Failed to fetch students");
      }
    } catch (error) {
      toast.error("An error occurred while fetching students");
    } finally {
      setLoading(false);
    }
  }, [schoolId, currentPage, itemsPerPage, searchQuery, filterClass, filterLevel, filterRegStatus, filterPaymentPlan]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const renderRow = (item: Student) => (
    <tr
      key={item.id}
      className="border-b border-gray-300 bg-surface text-[12px] hover:bg-[#E5E5FF] dark:hover:bg-[#333333] transition-colors"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.photo || "/avatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover shadow-sm bg-muted/20"
        />
        <div className="flex flex-col">
          <h3 className="font-bold text-sm">
            {item.firstName} {item.lastName}
          </h3>
          <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.levelName} - {item.className}</h3>
        </div>
      </td>
      <td className="hidden md:table-cell font-mono text-primary font-bold">{item.registrationNumber || "---"}</td>
      <td className="hidden lg:table-cell font-bold">{item.levelName}</td>
      <td className="hidden md:table-cell font-bold">{item.className}</td>
      <td className="hidden md:table-cell ">
        <div className="flex flex-col gap-1">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest w-max ${item.isRegistered ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
            {item.isRegistered ? "Registered" : "Admitted"}
          </span>
          {item.paymentPlan && (
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
              Plan: {item.paymentPlan}
            </span>
          )}
        </div>
      </td>
      <td>
        <div className="flex gap-2 items-center">
          {!item.isRegistered && (
            <button
              onClick={() => { setSelectedStudent(item); setIsRegOpen(true); }}
              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors shadow-sm cursor-pointer"
              title="Register Student"
            >
              <UserPlusIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => { setSelectedStudent(item); setIsPayOpen(true); }}
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm cursor-pointer"
            title="Record Payment"
          >
            <CreditCardIcon className="w-4 h-4" />
          </button>
          <FormModel
            table="student"
            type="edit"
            data={item}
          />
        </div>
      </td>
    </tr>
  );

  if (loading && students.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface m-4 rounded-2xl shadow">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest animate-pulse">Loading Students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface p-4 m-4 mt-0 flex-1 rounded-2xl shadow">
      {/* Top Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="hidden md:block font-extrabold text-xl uppercase tracking-tighter">
            All Students <span className="text-muted-foreground font-medium text-sm">({totalCount})</span>
          </h1>
          <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
            <div className="relative">
              {/* Note: TableSearch needs its own internal state or search handler, 
                  for now we'll assume it works with URL which we are not using here directly.
                  Let's add a manual search if needed, but the user requested search.
              */}
              <input
                type="text"
                placeholder="Search name or ID..."
                className="bg-background ring-[1.5px] ring-border p-2 rounded-md text-sm w-48 font-medium focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 self-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer border ${showFilters
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 border-primary'
                  : 'bg-background hover:bg-muted/10 border-border text-foreground'}`}
              >
                <Filter className={`w-4 h-4 ${showFilters ? "text-white" : "text-muted-foreground"}`} />
              </button>
              <FormModel table="student" type="plus" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 bg-muted/5 rounded-2xl border border-muted/10 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Level</label>
              <select
                className="ring-[1.5px] ring-border p-2 rounded-lg text-xs font-bold bg-background text-foreground focus:ring-primary outline-none"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="">All Levels</option>
                {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Class</label>
              <select
                className="ring-[1.5px] ring-border p-2 rounded-lg text-xs font-bold bg-background text-foreground focus:ring-primary outline-none"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.filter(c => !filterLevel || c.levelId === filterLevel).map(c => <option key={c.id} value={c.id}>{c.className || c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Registration</label>
              <select
                className="ring-[1.5px] ring-border p-2 rounded-lg text-xs font-bold bg-background text-foreground focus:ring-primary outline-none"
                value={filterRegStatus}
                onChange={(e) => setFilterRegStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="registered">Registered</option>
                <option value="admitted">Admitted (Pending)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Payment Plan</label>
              <select
                className="ring-[1.5px] ring-border p-2 rounded-lg text-xs font-bold bg-background text-foreground focus:ring-primary outline-none"
                value={filterPaymentPlan}
                onChange={(e) => setFilterPaymentPlan(e.target.value)}
              >
                <option value="">All Plans</option>
                <option value="TERM">Per Term</option>
                <option value="SESSION">Per Session</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterClass("");
                  setFilterLevel("");
                  setFilterRegStatus("");
                  setFilterPaymentPlan("");
                  setSearchQuery("");
                }}
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors p-2"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student List */}
      <div className="mt-4 overflow-x-auto">
        <Table
          columns={columns}
          renderRow={renderRow}
          data={students}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-auto pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modals */}
      {selectedStudent && (
        <>
          <StudentRegistrationDialog
            isOpen={isRegOpen}
            onClose={() => { setIsRegOpen(false); setSelectedStudent(null); }}
            student={selectedStudent}
            schoolId={schoolId}
            onSuccess={fetchStudents}
          />
          <RecordPaymentDialog
            isOpen={isPayOpen}
            onClose={() => { setIsPayOpen(false); setSelectedStudent(null); }}
            student={selectedStudent}
            schoolId={schoolId}
          />
        </>
      )}
    </div>
  );
};

export default StudentPage;

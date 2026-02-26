/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { FiPlus } from "react-icons/fi";
import { Filter } from "lucide-react";
import CreateStudentDialog from "@/components/CreateStudentDialog";
import StudentRegistrationDialog from "@/components/StudentRegistrationDialog";
import RecordPaymentDialog from "@/components/RecordPaymentDialog";
import { useUser } from "@/context/UserContext";
import { FaChalkboardTeacher, FaStar } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Teacher view types (from my-classes API) ─────────────────────────────────
type TeacherStudent = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  applicationNumber: string;
  registrationNumber?: string | null;
  profileImagePath: string | null;
};

type TeacherClass = {
  id: string;
  name: string;
  levelName: string;
  levelId: string;
  headTeacher: string;
  supervisorId: string | null;
  studentCount: number;
  subjectCount: number;
  subjects: { id: string; name: string; code: string }[];
  students: TeacherStudent[];
  isSupervised: boolean;
};

// ─── Teacher Students View ───────────────────────────────────────────────────
function TeacherStudentsView({ schoolId, userId }: { schoolId: string; userId: string }) {
  const [taughtClasses, setTaughtClasses] = useState<TeacherClass[]>([]);
  const [supervisedOnlyClasses, setSupervisedOnlyClasses] = useState<TeacherClass[]>([]);
  const [teacherName, setTeacherName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"myclass" | "taught">("myclass");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const fetchMyClasses = useCallback(async () => {
    if (!schoolId || !userId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/schools/${schoolId}/teachers/${userId}/my-classes?byUserId=true`
      );
      if (!res.ok) throw new Error("Failed to fetch your classes");
      const data = await res.json();
      setTaughtClasses(data.taughtClasses ?? []);
      setSupervisedOnlyClasses(data.supervisedOnlyClasses ?? []);
      setTeacherName(data.teacher?.name ?? "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [schoolId, userId]);

  useEffect(() => {
    fetchMyClasses();
  }, [fetchMyClasses]);

  const myClassSections: TeacherClass[] = [
    ...taughtClasses.filter((c) => c.isSupervised),
    ...supervisedOnlyClasses,
  ].sort((a, b) => a.levelName.localeCompare(b.levelName) || a.name.localeCompare(b.name));

  const allClassesForTab = activeTab === "myclass" ? myClassSections : taughtClasses;
  const selectedClass = allClassesForTab.find((c) => c.id === selectedClassId) ?? allClassesForTab[0] ?? null;

  useEffect(() => {
    if (allClassesForTab.length > 0 && !allClassesForTab.some((c) => c.id === selectedClassId)) {
      setSelectedClassId(allClassesForTab[0].id);
    }
  }, [activeTab, allClassesForTab, selectedClassId]);

  const renderStudentTable = (students: TeacherStudent[]) => (
    <div className="overflow-x-auto rounded-2xl bg-muted/5">
      {students.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-muted-foreground">
          No students in this class yet.
        </div>
      ) : (
        <table className="w-full min-w-[380px] text-left text-sm">
          <thead>
            <tr className="bg-muted/10">
              <th className="px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">#</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Student</th>
              <th className="hidden sm:table-cell px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Gender</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Reg. number</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id} className="hover:bg-muted/5 transition-colors">
                <td className="px-4 py-3 text-muted-foreground font-medium">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={s.profileImagePath || "/avatar.png"}
                      alt=""
                      width={36}
                      height={36}
                      className="rounded-full object-cover bg-muted/20"
                    />
                    <span className="font-medium text-foreground">{s.firstName} {s.lastName}</span>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.gender?.toLowerCase() === "male" ? "bg-primary/10 text-primary" : "bg-cta/10 text-cta"}`}>
                    {s.gender || "-"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-primary font-medium text-xs">{s.registrationNumber || s.applicationNumber || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface m-4 rounded-2xl shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading your students…</p>
        </div>
      </div>
    );
  }

  const hasMyClass = myClassSections.length > 0;
  const hasTaught = taughtClasses.length > 0;
  if (!hasMyClass && !hasTaught) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface m-4 rounded-2xl shadow-sm p-8 text-center">
        <FaChalkboardTeacher className="w-14 h-14 text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-2">No classes assigned</h2>
        <p className="text-sm text-muted-foreground max-w-sm">You don’t have a class as head teacher or subject teacher yet. Contact your school admin for assignments.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface p-4 sm:p-6 m-4 mt-0 flex-1 rounded-2xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <FaChalkboardTeacher className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {teacherName ? `${teacherName}'s Students` : "My Students"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Switch between your class and classes you teach
            </p>
          </div>
        </div>
      </div>

      {/* Tabs: clear tab bar with selected state */}
      <div
        role="tablist"
        aria-label="View by my class or students I teach"
        className="flex rounded-xl border border-muted bg-bg p-1 w-full sm:w-fit mb-6"
      >
        {hasMyClass && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "myclass"}
            onClick={() => { setActiveTab("myclass"); setSelectedClassId(myClassSections[0]?.id ?? ""); }}
            className={`flex-1 sm:flex-none min-w-0 sm:min-w-[140px] px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "myclass"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-text/70 hover:text-text hover:bg-surface"
            }`}
          >
            <FaStar className="w-4 h-4 shrink-0" />
            <span className="truncate">My class</span>
            <span className="text-xs opacity-90 shrink-0">({myClassSections.length})</span>
          </button>
        )}
        {hasTaught && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "taught"}
            onClick={() => { setActiveTab("taught"); setSelectedClassId(taughtClasses[0]?.id ?? ""); }}
            className={`flex-1 sm:flex-none min-w-0 sm:min-w-[160px] px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "taught"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-text/70 hover:text-text hover:bg-surface"
            }`}
          >
            <FaChalkboardTeacher className="w-4 h-4 shrink-0" />
            <span className="truncate">Students I teach</span>
            <span className="text-xs opacity-90 shrink-0">({taughtClasses.length})</span>
          </button>
        )}
      </div>

      {/* Class selector (Radix) + single table */}
      <div className="space-y-4">
        {allClassesForTab.length > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium text-text/70 shrink-0">
              Class
            </label>
            <Select
              value={selectedClassId}
              onValueChange={setSelectedClassId}
            >
              <SelectTrigger className="w-full sm:max-w-xs h-11 rounded-xl bg-bg border-muted text-text">
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-muted text-text">
                {allClassesForTab.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id} className="text-text focus:bg-primary/10 focus:text-primary">
                    {cls.levelName} {cls.name}
                    {activeTab === "taught" && cls.subjects.length > 0 && ` · ${cls.subjects.map((s) => s.name).join(", ")}`}
                    {` (${cls.studentCount})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedClass && (
          <>
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-base font-bold text-foreground">
                {activeTab === "myclass" ? "My class: " : ""}{selectedClass.levelName} {selectedClass.name}
              </h2>
              <span className="text-sm text-muted-foreground">
                {selectedClass.studentCount} student{selectedClass.studentCount !== 1 ? "s" : ""}
                {activeTab === "taught" && selectedClass.subjects.length > 0 && (
                  <span className="ml-1"> · {selectedClass.subjects.map((s) => s.name).join(", ")}</span>
                )}
              </span>
            </div>
            {renderStudentTable(selectedClass.students)}
          </>
        )}
      </div>
    </div>
  );
}

// Define student type
type FeeStatus = {
  label: string;
  termsPaid: string[];
  isFullSessionPaid: boolean;
};

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
  feeStatus?: FeeStatus;
};

const columns = [
  { header: "Student", accessor: "info" },
  { header: "Reg Number", accessor: "registrationNumber", className: "hidden md:table-cell" },
  { header: "Level", accessor: "level", className: "hidden lg:table-cell" },
  { header: "Class", accessor: "class", className: "hidden md:table-cell" },
  { header: "Status", accessor: "status", className: "hidden md:table-cell" },
  { header: "Fee (session)", accessor: "feeStatus", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "action" },
];

const StudentPage = () => {
  const params = useParams();
  const schoolId = params.school as string;
  const { role, user, loading: userLoading } = useUser();

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
  const [showCreateStudent, setShowCreateStudent] = useState(false);

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

  // When level changes, clear class filter so we don't keep a class from another level
  useEffect(() => {
    setFilterClass("");
  }, [filterLevel]);

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
      <td className="hidden md:table-cell">
        <div className="flex flex-col gap-1">
          {item.feeStatus && (
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight w-max ${
                item.feeStatus.isFullSessionPaid || item.feeStatus.label === "Full session paid"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : item.feeStatus.label === "Unpaid"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              }`}
            >
              {item.feeStatus.label}
            </span>
          )}
          {!item.feeStatus && (
            <span className="text-[9px] text-muted-foreground italic">—</span>
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

  if (!userLoading && role === "teacher" && user?.userId) {
    return <TeacherStudentsView schoolId={schoolId} userId={user.userId} />;
  }

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
          
              <input
                type="text"
                placeholder="Search name or ID..."
                className="bg-bg ring-[1.5px] ring-border p-2 rounded-md text-sm w-48 font-medium focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 self-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer border ${showFilters
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 border-primary'
                  : 'bg-bg hover:bg-muted/10 border-border text-foreground'}`}
              >
                <Filter className={`w-4 h-4 ${showFilters ? "text-white" : "text-muted-foreground"}`} />
              </button>
            <button
              onClick={() => setShowCreateStudent(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25 border border-primary transition-all cursor-pointer"
              title="Add Student"
            >
              <FiPlus className="w-5 h-5" />
            </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 bg-muted/5 rounded-2xl border border-border animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Level</label>
              <Select
                value={filterLevel || "__all__"}
                onValueChange={(v) => setFilterLevel(v === "__all__" ? "" : v)}
              >
                <SelectTrigger className="h-9 rounded-lg text-xs font-bold bg-bg text-foreground border-border ring-offset-bg focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent className="bg-bg text-foreground border-border">
                  <SelectItem value="__all__" className="text-xs font-bold focus:bg-primary/10 focus:text-foreground">
                    All Levels
                  </SelectItem>
                  {levels.map((l) => (
                    <SelectItem key={l.id} value={l.id} className="text-xs font-bold focus:bg-primary/10 focus:text-foreground">
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Class</label>
              <Select
                value={filterClass || "__all__"}
                onValueChange={(v) => setFilterClass(v === "__all__" ? "" : v)}
                disabled={!filterLevel}
              >
                <SelectTrigger className="h-9 rounded-lg text-xs font-bold bg-bg text-foreground border-border ring-offset-bg focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  <SelectValue placeholder={filterLevel ? "All Classes" : "Select level first"} />
                </SelectTrigger>
                <SelectContent className="bg-bg text-foreground border-border">
                  <SelectItem value="__all__" className="text-xs font-bold focus:bg-primary/10 focus:text-foreground">
                    All Classes
                  </SelectItem>
                  {filterLevel &&
                    classes
                      .filter((c) => c.levelId === filterLevel)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs font-bold focus:bg-primary/10 focus:text-foreground">
                          {c.className || c.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Registration</label>
              <Select
                value={filterRegStatus || "__all__"}
                onValueChange={(v) => setFilterRegStatus(v === "__all__" ? "" : v)}
              >
                <SelectTrigger className="h-9 rounded-lg text-xs font-bold bg-bg text-foreground border-border ring-offset-bg focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-bg text-foreground border-border">
                  <SelectItem value="__all__" className="text-xs font-bold focus:bg-primary/10 focus:text-foreground">
                    All Statuses
                  </SelectItem>
                  <SelectItem value="registered" className="text-xs font-bold focus:bg-primary/10 focus:text-foreground">
                    Registered
                  </SelectItem>
                  <SelectItem value="admitted" className="text-xs font-bold focus:bg-primary/10 focus:text-foreground">
                    Admitted (Pending)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Payment Plan</label>
              <Select
                value={filterPaymentPlan || "__all__"}
                onValueChange={(v) => setFilterPaymentPlan(v === "__all__" ? "" : v)}
              >
                <SelectTrigger className="h-9 rounded-lg text-xs font-bold bg-bg text-foreground border-border ring-offset-bg focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent className="bg-bg text-foreground border-border">
                  <SelectItem value="__all__" className="text-xs font-bold focus:bg-primary/10 focus:text-foreground">
                    All Plans
                  </SelectItem>
                  <SelectItem value="TERM" className="text-xs font-bold focus:bg-primary/10 focus:text-foreground">
                    Per Term
                  </SelectItem>
                  <SelectItem value="SESSION" className="text-xs font-bold focus:bg-primary/10 focus:text-foreground">
                    Per Session
                  </SelectItem>
                </SelectContent>
              </Select>
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
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2"
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

      {/* Create Student Modal */}
      <CreateStudentDialog
        isOpen={showCreateStudent}
        onClose={() => setShowCreateStudent(false)}
        schoolId={schoolId}
        onSuccess={fetchStudents}
      />

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

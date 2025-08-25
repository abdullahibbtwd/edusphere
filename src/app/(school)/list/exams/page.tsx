"use client";

import Image from "next/image";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import ExamFormModel from "@/components/ExamFormModel";
import { Button } from "@mui/material";
import { toast } from "sonner";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

type ExamTimetable = {
  _id: string;
  courseId: string;
  teacherId: string;
  invigilatorId?: string;
  examHall: string;
  date: string;
  startTime: string;
  endTime: string;
  semester: string;
  programId: string;
  levelId: string;
  course?: {
    code: string;
    name: string;
    creditUnit: number;
  };
  teacher?: {
    name: string;
  };
  invigilator?: {
    name: string;
  };
  program?: {
    name: string;
  };
  level?: {
    name: string;
  };
};

const columns = [
  {
    header: "Course Code",
    accessor: "courseCode",
  },
  {
    header: "Course Name",
    accessor: "courseName",
  },
  {
    header: "Credit Unit",
    accessor: "creditUnit",
  },
  {
    header: "Teacher",
    accessor: "teacher",
  },
  {
    header: "Invigilator",
    accessor: "invigilator",
  },
  {
    header: "Exam Hall",
    accessor: "examHall",
  },
  {
    header: "Date",
    accessor: "date",
  },
  {
    header: "Time",
    accessor: "time",
  },
  {
    header: "Program",
    accessor: "program",
  },
  {
    header: "Level",
    accessor: "level",
  },
  {
    header: "Semester",
    accessor: "semester",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

export default function ExamsPage() {
  // All hooks must be called at the top level
  const { user } = useUser();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"add" | "edit" | "delete">("add");
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [semester, setSemester] = useState<string>("Semester 1");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedLevel, setSelectedLevel] = useState("");

  // All queries must be called unconditionally
  const userData = useQuery(api.users.getCurrentUser);
  const currentTeacher = useQuery(api.teachers.getCurrentTeacher);
  const currentStudent = useQuery(api.students.getCurrentStudent);
  const allExams = useQuery(api.exams.getExamTimetables);
  const teacherExams = useQuery(
    api.exams.getTeacherExamTimetables,
    currentTeacher ? { teacherId: currentTeacher._id } : "skip"
  );
  const programExams = useQuery(
    api.exams.getProgramExamTimetables,
    currentStudent ? { programId: currentStudent.programId, semester } : "skip"
  );
  const courses = useQuery(api.courses.getCourses);
  const teachers = useQuery(api.teachers.getTeachers);
  const programs = useQuery(api.program.getAllProgram);
  const levels = useQuery(api.level.getLevels);
  const initializeLevels = useMutation(api.level.initializeLevels);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!userData) {
      router.push('/');
    }
  }, [userData, router]);

  // Derived state
  const isAdmin = userData?.role === "admin";
  const isTeacher = userData?.role === "teacher";
  const isStudent = userData?.role === "student";

  // Filter and transform exam data
  const exams = isAdmin
    ? allExams || []
    : isTeacher
    ? teacherExams || []
    : isStudent && currentStudent
    ? programExams || []
    : [];

  // Filter exams based on user role and filters
  const filteredExams = exams.filter(exam => {
    if (!userData || !exam) return false;
    
    // Apply semester filter
    if (exam.semester !== semester) return false;
    
    // Apply program filter if selected
    if (selectedProgram && exam.programId !== selectedProgram) return false;
    
    // Apply level filter if selected
    if (selectedLevel && exam.levelId !== selectedLevel) return false;
    
    // Admin can see all exams
    if (userData.role === "admin") return true;
    
    // Teacher can only see exams they're assigned to
    if (userData.role === "teacher") {
      return exam.teacherId === currentTeacher?._id || exam.invigilatorId === currentTeacher?._id;
    }
    
    // Student can only see exams for their program and level
    if (userData.role === "student" && currentStudent) {
      return exam.programId === currentStudent.programId;
    }
    
    return false;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, endIndex);

  // Use useCallback to memoize the page change handler
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Set student's program and level automatically
  useEffect(() => {
    if (isStudent && currentStudent) {
      setSelectedProgram(currentStudent.programId);
    }
  }, [isStudent, currentStudent]);

  // Show loading state if any required data is still loading
  if (!userData || !courses || !teachers || !programs || !levels || (isStudent && !currentStudent)) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const transformedExams = currentExams?.map((exam) => {
    const course = courses?.find((c) => c._id === exam.courseId);
    const teacher = teachers?.find((t) => t._id === exam.teacherId);
    const invigilator = teachers?.find((t) => t._id === exam.invigilatorId);
    const program = programs?.find((p) => p._id === exam.programId);
    const level = levels?.find((l) => l._id === exam.levelId);

    return {
      _id: exam._id,
      courseId: exam.courseId,
      teacherId: exam.teacherId,
      invigilatorId: exam.invigilatorId,
      courseCode: course?.code || "",
      courseName: course?.name || "",
      creditUnit: course?.creditUnit || 0,
      teacher: teacher?.name || "",
      invigilator: invigilator?.name || "",
      examHall: exam.examHall,
      date: exam.date,
      startTime: exam.startTime,
      endTime: exam.endTime,
      time: `${exam.startTime} - ${exam.endTime}`,
      program: program?.name || "",
      level: level?.name || "",
      programId: exam.programId,
      levelId: exam.levelId,
      semester: exam.semester,
    };
  });

  const handleOpenForm = (type: "add" | "edit" | "delete", exam?: any) => {
    setFormType(type);
    setSelectedExam(exam);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedExam(null);
  };

  const handleInitializeLevels = async () => {
    try {
      await initializeLevels();
      toast.success("Levels initialized successfully");
    } catch (error) {
      console.error("Error initializing levels:", error);
      toast.error("Failed to initialize levels");
    }
  };

  const renderRow = (item: any) => (
    <tr key={item._id} className="border-b border-gray-200 even:bg-slate-50 text-[12px] odd:bg-[#FEFCEB] hover:bg-[#F1F0FF]">
      <td className="font-semibold p-4 px-1 items-center">{item.courseCode}</td>
      <td className="p-4 px-1 items-center">{item.courseName}</td>
      <td className="p-4 px-1 items-center">{item.creditUnit}</td>
      <td className="p-4 px-1 items-center">{item.teacher}</td>
      <td className="p-4 px-1 items-center">{item.invigilator}</td>
      <td className="p-4 px-1 items-center">{item.examHall}</td>
      <td className="p-4 px-1 items-center">{item.date}</td>
      <td className="p-4 px-1 items-center">{item.time}</td>
      <td className="p-4 px-1 items-center">{item.program}</td>
      <td className="p-4 px-1 items-center">{item.level}</td>
      <td className="p-4 px-1 items-center">{item.semester}</td>
      <td className="p-4 px-1 items-center">
        {isAdmin && (
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handleOpenForm("edit", item)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]"
            >
              <Image src="/edit.png" alt="Edit" width={14} height={14} />
            </button>
            <button
              onClick={() => handleOpenForm("delete", item)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]"
            >
              <Image src="/delete.png" alt="Delete" width={14} height={14} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col bg-white p-4 m-4 mt-0 flex-1">
      {/* Top */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="hidden md:block font-semibold text-gray-700">
            {userData?.role === "admin" ? "All Exams" : 
             userData?.role === "teacher" ? "My Exams" : 
             "Available Exams"}
          </h1>
          <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleInitializeLevels}
                    variant="outlined"
                    color="secondary"
                  >
                    Initialize Levels
                  </Button>
                  <Button
                    onClick={() => handleOpenForm("add")}
                    variant="contained"
                    color="primary"
                  >
                    Add Exam
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            className="p-2 border rounded"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
            <option value="Semester 3">Semester 3</option>
            <option value="Semester 4">Semester 4</option>
          </select>

          {isAdmin && (
            <>
              <select
                className="p-2 border rounded"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
              >
                <option value="">Select Program</option>
                {programs?.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.name}
                  </option>
                ))}
              </select>

              <select
                className="p-2 border rounded"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="">Select Level</option>
                {levels?.map((level) => (
                  <option key={level._id} value={level._id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* List */}
      <div className="mt-4">
        <Table columns={columns} renderRow={renderRow} data={transformedExams || []} />
      </div>

      {/* Bottom */}
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

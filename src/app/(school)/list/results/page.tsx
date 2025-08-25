"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

const summaryColumns = [
  { header: "Student Name", accessor: "studentName" },
  { header: "Total Grade Points", accessor: "totalGradePoints" },
  { header: "Total Credit Units", accessor: "totalCreditUnits" },
  { header: "CGPA", accessor: "cgpa" },
  { header: "Actions", accessor: "actions" },
];

const detailColumns = [
  { header: "Course Code", accessor: "courseCode" },
  { header: "Course Name", accessor: "courseName" },
  { header: "Credit Unit", accessor: "creditUnit" },
  { header: "CA Mark", accessor: "caMark" },
  { header: "Exam Mark", accessor: "examMark" },
  { header: "Total Mark", accessor: "totalMark" },
  { header: "Grade", accessor: "grade" },
  { header: "Grade Point", accessor: "gradePoint" },
  { header: "Semester", accessor: "semester" },
];

export default function ResultsPage() {
  const { user } = useUser();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [semester, setSemester] = useState("Semester 1");

  const userData = useQuery(api.users.getCurrentUser);
  const allResults = useQuery(api.results.getAllResults);
  const courses = useQuery(api.courses.getCourses);
  const students = useQuery(api.students.getAdmittedStudentsWithDetails);

  const isAdmin = userData?.role === "admin";

  // Calculate summary for each student
  const studentSummaries = students?.map(student => {
    const studentResults = allResults?.filter(result => result.studentId === student._id) || [];
    const totalGradePoints = studentResults.reduce((sum, result) => sum + result.gradePoint, 0);
    const totalCreditUnits = studentResults.reduce((sum, result) => {
      const course = courses?.find(c => c._id === result.courseId);
      return sum + (course?.creditUnit || 0);
    }, 0);
    const cgpa = totalCreditUnits > 0 ? (totalGradePoints / totalCreditUnits).toFixed(2) : "0.00";

    return {
      _id: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      totalGradePoints,
      totalCreditUnits,
      cgpa,
    };
  });

  const handleOpenDetailModal = (student: any) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedStudent(null);
  };

  // Get detailed results for selected student
  const studentDetailedResults = selectedStudent
    ? allResults
        ?.filter(result => result.studentId === selectedStudent._id)
        .map(result => {
          const course = courses?.find(c => c._id === result.courseId);
          return {
            _id: result._id,
            courseCode: course?.code || "",
            courseName: course?.name || "",
            creditUnit: course?.creditUnit || 0,
            caMark: result.caMark,
            examMark: result.examMark,
            totalMark: result.totalMark,
            grade: result.grade,
            gradePoint: result.gradePoint,
            semester: result.semester,
          };
        })
    : [];

  if (!userData || !courses || !students) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Student Results Summary
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {summaryColumns.map((column) => (
                <TableCell key={column.accessor}>{column.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {studentSummaries?.map((student) => (
              <TableRow key={student._id} hover>
                <TableCell>{student.studentName}</TableCell>
                <TableCell>{student.totalGradePoints}</TableCell>
                <TableCell>{student.totalCreditUnits}</TableCell>
                <TableCell>
                  <Chip
                    label={student.cgpa}
                    color={parseFloat(student.cgpa) >= 2.0 ? "success" : "error"}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDetailModal(student)}
                    color="primary"
                  >
                    View Details
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Modal */}
      <Dialog
        open={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Detailed Results - {selectedStudent?.studentName}
            </Typography>
            <IconButton onClick={handleCloseDetailModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              CGPA: {selectedStudent?.cgpa}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Total Credit Units: {selectedStudent?.totalCreditUnits}
            </Typography>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {detailColumns.map((column) => (
                    <TableCell key={column.accessor}>{column.header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {studentDetailedResults.map((result) => (
                  <TableRow key={result._id}>
                    <TableCell>{result.courseCode}</TableCell>
                    <TableCell>{result.courseName}</TableCell>
                    <TableCell>{result.creditUnit}</TableCell>
                    <TableCell>{result.caMark}</TableCell>
                    <TableCell>{result.examMark}</TableCell>
                    <TableCell>{result.totalMark}</TableCell>
                    <TableCell>{result.grade}</TableCell>
                    <TableCell>{result.gradePoint}</TableCell>
                    <TableCell>{result.semester}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

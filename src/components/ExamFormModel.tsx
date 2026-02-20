/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { toast } from "sonner";

interface ExamFormData {
  courseId: string;
  teacherId: string;
  invigilatorId: string;
  examHall: string;
  date: string;
  startTime: string;
  endTime: string;
  term: string;
  classId: string;
}

interface ExamFormModelProps {
  isOpen: boolean;
  onClose: () => void;
  type: "add" | "edit" | "delete";
  data?: any;
}

// Dummy data for dropdowns
const dummyCourses = [
  { _id: "1", code: "MTH101", name: "Mathematics" },
  { _id: "2", code: "ENG101", name: "English" },
  { _id: "3", code: "BIO101", name: "Biology" },
];

const dummyTeachers = [
  { _id: "t1", name: "Mr. James" },
  { _id: "t2", name: "Mrs. Grace" },
  { _id: "t3", name: "Dr. Alex" },
];

const dummyClasses = [
  { _id: "c1", name: "SS1A" },
  { _id: "c2", name: "SS1B" },
  { _id: "c3", name: "SS2A" },
];

export default function ExamFormModel({ isOpen, onClose, type, data }: ExamFormModelProps) {
  const [formData, setFormData] = useState<ExamFormData>({
    courseId: "",
    teacherId: "",
    invigilatorId: "",
    examHall: "",
    date: "",
    startTime: "",
    endTime: "",
    term: "First Term",
    classId: "",
  });

  useEffect(() => {
    if (type === "edit" && data) {
      setFormData({
        courseId: data.courseId || "",
        teacherId: data.teacherId || "",
        invigilatorId: data.invigilatorId || "",
        examHall: data.examHall || "",
        date: data.date || "",
        startTime: data.startTime || "",
        endTime: data.endTime || "",
        term: data.term || "First Term",
        classId: data.classId || "",
      });
    }
  }, [type, data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (type === "add") {
        toast.success("Exam timetable added successfully (dummy)");
      } else if (type === "edit") {
        toast.success("Exam timetable updated successfully (dummy)");
      } else if (type === "delete") {
        toast.success("Exam timetable deleted successfully (dummy)");
      }
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  if (type === "delete") {
    return (
      <Dialog open={isOpen} onClose={onClose}>
        <DialogContent>
          <DialogTitle>Delete Exam Timetable</DialogTitle>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to delete this exam timetable?
          </Typography>
          <DialogActions>
            <Button onClick={onClose} sx={{ color: "var(--primary)" }}>Cancel</Button>
            <Button onClick={handleSubmit} sx={{ bgcolor: "var(--error)", color: "white" }}>
              Delete
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ bgcolor: "var(--background)", color: "var(--foreground)" }}>
        <DialogTitle>
          {type === "add" ? "Add Exam Timetable" : "Edit Exam Timetable"}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box sx={{ display: "grid", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Course</InputLabel>
              <Select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                required
              >
                {dummyCourses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Teacher</InputLabel>
              <Select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                required
              >
                {dummyTeachers.map((teacher) => (
                  <MenuItem key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Invigilator</InputLabel>
              <Select
                value={formData.invigilatorId}
                onChange={(e) => setFormData({ ...formData, invigilatorId: e.target.value })}
              >
                {dummyTeachers.map((teacher) => (
                  <MenuItem key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Exam Hall"
              value={formData.examHall}
              onChange={(e) => setFormData({ ...formData, examHall: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel>Term</InputLabel>
              <Select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                required
              >
                <MenuItem value="First Term">First Term</MenuItem>
                <MenuItem value="Second Term">Second Term</MenuItem>
                <MenuItem value="Third Term">Third Term</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                required
              >
                {dummyClasses.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <DialogActions sx={{ mt: 3 }}>
            <Button onClick={onClose} sx={{ color: "var(--primary)" }}>Cancel</Button>
            <Button type="submit" sx={{ bgcolor: "var(--primary)", color: "white" }}>
              {type === "add" ? "Add Exam" : "Update Exam"}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

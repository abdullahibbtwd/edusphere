"use client"
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Box,
  Grid,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading</h1>
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading</h1>
});

interface FormModelProps {
  table:    "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "department"
    | "studentAssignment"
    | "course"
    | "timetable"
    | "program"; 
  type: "plus" | "edit" | "delete";
  data?: any;
  id?: any; 
  onAdd?: (name: string, departmentId?: string) => void; 
  onEdit?: (id: any, updateData: any) => void; 
  onDelete?: (id: any) => void;
 
  departmentId?: string; 
}

const FormModel = ({
  table,
  type,
  data,
  id,
  onAdd,
  onEdit,
  onDelete,
  departmentId, 
}: FormModelProps) => {
  const size = type === "plus" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "plus" ? "bg-primary text-white " :
    type === "edit" ? "bg-primary" :
    "bg-[#CFCEFF]";

  const [open, setOpen] = useState(false);
  
  const [formName, setFormName] = useState(data?.name || "");
  const [level1Count, setLevel1Count] = useState(data?.level1Count || 0);
  const [level2Count, setLevel2Count] = useState(data?.level2Count || 0);
  const [graduateCount, setGraduateCount] = useState(data?.graduateCount || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dummy data instead of API
  const departments = [
    { _id: "dept1", name: "Computer Science" },
    { _id: "dept2", name: "Mathematics" },
  ];

  const programs = [
    { _id: "prog1", name: "BSc Computer Science", departmentId: "dept1" },
    { _id: "prog2", name: "BSc Mathematics", departmentId: "dept2" },
  ];

  const courses = [
    { _id: "course1", name: "Algorithms", code: "CS101", isGeneral: false, programIds: ["prog1"] },
    { _id: "course2", name: "Linear Algebra", code: "MATH101", isGeneral: true, programIds: [] },
  ];

  const [courseForm, setCourseForm] = useState({
    name: data?.name || "",
    code: data?.code || "",
    creditUnit: data?.creditUnit || 1,
    semester: data?.semester || "Semester 1",
    isGeneral: data?.isGeneral || false,
    programIds: data?.programIds || [],
    teacherIds: data?.teacherIds || [],
  });

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success(`Course ${type === "plus" ? "created" : "updated"} successfully!`);
      setIsSubmitting(false);
      setOpen(false);
    }, 1000);
  };

  const renderCourseForm = () => (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: 700, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h5" align="center">{type === "plus" ? "Add New Course" : "Edit Course"}</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField label="Course Name" fullWidth value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} required />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField label="Course Code" fullWidth value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} required />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField label="Credit Unit" type="number" fullWidth value={courseForm.creditUnit} onChange={(e) => setCourseForm({ ...courseForm, creditUnit: parseInt(e.target.value) || 1 })} required />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Semester</InputLabel>
            <Select value={courseForm.semester} onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}>
              <MenuItem value="Semester 1">Semester 1</MenuItem>
              <MenuItem value="Semester 2">Semester 2</MenuItem>
              <MenuItem value="Semester 3">Semester 3</MenuItem>
              <MenuItem value="Semester 4">Semester 4</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel control={<Checkbox checked={courseForm.isGeneral} onChange={(e) => setCourseForm({ ...courseForm, isGeneral: e.target.checked, programIds: e.target.checked ? [] : courseForm.programIds })} />} label="General Subject (for all programs)" />
        </Grid>

        {!courseForm.isGeneral && (
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Programs</InputLabel>
              <Select multiple value={courseForm.programIds} onChange={(e) => setCourseForm({ ...courseForm, programIds: e.target.value as string[] })} renderValue={(selected) => (selected as string[]).map(id => programs.find(p => p._id === id)?.name || id).join(", ")}>
                {programs.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
              </Select>
              <FormHelperText>Hold Ctrl/Cmd to select multiple programs</FormHelperText>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} onClick={handleCourseSubmit}>
            {isSubmitting ? <CircularProgress size={24} /> : type === "plus" ? "Add Course" : "Update Course"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderFormContent = () => {
    if (table === "course") return renderCourseForm();
    if (table === "teacher") return <TeacherForm type={type} data={data} />;
    if (table === "student") return <StudentForm type={type} data={data} />;
    return "Form not found for this table type.";
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className={`${size} flex items-center justify-center rounded-full ${bgColor} shadow-md`}>
        <Image src={`/${type === "plus" ? "plus" : type === "edit" ? "edit" : "delete"}.png`} alt={type} width={16} height={16} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 relative w-full max-w-md md:max-w-lg lg:max-w-xl rounded-lg shadow-xl">
            {renderFormContent()}
            <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100" onClick={() => setOpen(false)}>
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModel;

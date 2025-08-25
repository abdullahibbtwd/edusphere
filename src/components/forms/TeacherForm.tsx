"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { toast } from "sonner";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";

const schema = z.object({
  email: z.string().email({ message: "Invalid email Address" }),
  firstname: z.string().min(1, { message: "First name is required" }),
  lastname: z.string().min(1, { message: "Last name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  birthday: z.string().min(1, { message: "Birthday is required" }),
  sex: z.enum(["male", "female"], { message: "Sex is required" }),
  img: z.any().refine(
    (file) => file instanceof File || file === null || typeof file === 'string',
    { message: "Image is required" }
  ),
  courseIds: z.array(z.string()),
  departmentId: z.string().min(1, { message: "Department is required" }),
});

type Inputs = z.infer<typeof schema>;

type TeacherFormProps = {
  type: "plus" | "edit";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  onClose?: () => void;
};

const dummyCourses = [
  { _id: "c1", name: "Mathematics", code: "MATH101" },
  { _id: "c2", name: "Physics", code: "PHY101" },
  { _id: "c3", name: "Chemistry", code: "CHEM101" },
];

const dummyDepartments = [
  { _id: "d1", name: "Science" },
  { _id: "d2", name: "Arts" },
  { _id: "d3", name: "Engineering" },
];

const TeacherForm = ({ type, data, onClose }: TeacherFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(data?.img || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      courseIds: data?.courseIds || [],
      birthday: data?.birthday || "",
      sex: data?.sex || "male",
      img: data?.img || null,
      departmentId: data?.departmentId || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setValue("img", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setIsSubmitting(true);

      // Convert image file to base64 string if it's a new file
      let imageData = formData.img;
      if (imageFile) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
      }

      if (type === "plus") {
        toast.success("Teacher created successfully!");
      } else if (type === "edit") {
        toast.success("Teacher updated successfully!");
      }

      if (onClose) onClose();
    } catch (error) {
      toast.error(`Failed to ${type === "plus" ? "create" : "update"} teacher`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  });

  const selectedCourses = watch("courseIds") || [];

  return (
    <Box sx={{ position: 'relative', p: 3 }}>
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      )}

      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
          {type === "plus" ? "Create a new Teacher" : "Edit Teacher"}
        </h1>

        <span className="text-xs text-gray-600">Personal Information</span>
        <div className="flex justify-between flex-wrap gap-4">
          <InputField label="Email" name="email" type="email" defaultValue={data?.email} register={register} error={errors?.email} />
          <InputField label="First name" name="firstname" type="text" defaultValue={data?.firstname} register={register} error={errors?.firstname} />
          <InputField label="Last Name" name="lastname" type="text" defaultValue={data?.lastname} register={register} error={errors?.lastname} />
          <InputField label="Phone" name="phone" type="text" defaultValue={data?.phone} register={register} error={errors?.phone} />
          <InputField label="Address" name="address" defaultValue={data?.address} register={register} error={errors?.address} />
          <InputField label="Birthday" name="birthday" type="date" defaultValue={data?.birthday} register={register} error={errors?.birthday} />

          {/* Department */}
          <div className="w-full md:w-1/4 flex flex-col gap-2 justify-center items-start">
            <label className="text-xs text-gray-500">Department</label>
            <select
              {...register("departmentId")}
              className="ring-[1.5px] w-full ring-gray-300 p-2 rounded-md text-sm"
              defaultValue={data?.departmentId}
            >
              <option value="">Select Department</option>
              {dummyDepartments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId?.message && (
              <p className="text-[10px] text-red-800">{errors.departmentId.message.toString()}</p>
            )}
          </div>

          {/* Gender */}
          <div className="w-full md:w-1/4 flex flex-col gap-2 justify-center items-start">
            <label className="text-xs text-gray-500">Gender</label>
            <select
              {...register("sex")}
              className="ring-[1.5px] w-full ring-gray-300 p-2 rounded-md text-sm"
              defaultValue={data?.sex}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.sex?.message && (
              <p className="text-[10px] text-red-800">{errors.sex.message.toString()}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="w-full md:w-1/4 flex flex-col gap-2 justify-center items-end">
            <label htmlFor="img" className="text-xs text-gray-500 flex justify-center gap-2 cursor-pointer">
              <Image src="/upload.png" alt="Upload icon" width={28} height={28} />
              <span>Upload Image</span>
            </label>
            <input id="img" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {imagePreview && (
              <div className="mt-2">
                <Image src={imagePreview} alt="Preview" width={100} height={100} className="rounded-full object-cover" />
              </div>
            )}
            {errors.img?.message && (
              <p className="text-[10px] text-red-800">{errors.img.message.toString()}</p>
            )}
          </div>
        </div>

        <span className="text-xs text-gray-600">Course Assignment</span>
        <FormControl fullWidth error={!!errors.courseIds}>
          <InputLabel>Select Courses</InputLabel>
          <Select
            multiple
            value={selectedCourses}
            onChange={(e) => setValue("courseIds", e.target.value as string[])}
            label="Select Courses"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => {
                  const course = dummyCourses.find(c => c._id === value);
                  return (
                    <span key={value} className="bg-[#FAE27C] px-2 py-1 rounded-md text-sm">
                      {course?.name} ({course?.code})
                    </span>
                  );
                })}
              </Box>
            )}
          >
            {dummyCourses.map((course) => (
              <MenuItem key={course._id} value={course._id}>
                {course.name} ({course.code})
              </MenuItem>
            ))}
          </Select>
          {errors.courseIds?.message && (
            <p className="text-[10px] text-red-800 mt-1">{errors.courseIds.message.toString()}</p>
          )}
        </FormControl>

        <div className="flex justify-end mt-4">
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ minWidth: '120px' }}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : type === "plus" ? "Create Teacher" : "Update Teacher"}
          </Button>
        </div>
      </form>
    </Box>
  );
};

export default TeacherForm;

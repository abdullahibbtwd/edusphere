"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";

import Pagination from "@/components/pagination";
import { FiEdit, FiTrash, FiX, FiPlus, FiSave, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiSearch, FiPhone, FiMail, FiBook } from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

type Teacher = {
  id: string;
  teacherId: string;
  name: string;
  email: string;
  img: string;
  phone: string;
  address: string;
  birthday: string;
  sex: string;
  schoolId: string;
  userId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
  } | null;
  subjects: string;
  assignmentCount: number;
  assignments?: Array<{
    id: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    classId: string;
    className: string;
    levelId: string;
    levelName: string;
    fullClassName: string;
    isActive: boolean;
    assignedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

type AssignmentOption = {
  id: string;
  name: string;
  code: string;
  classAssignment: string | null;
  levels: Array<{ id: string; name: string }>;
  availableClasses: Array<{
    id: string;
    name: string;
    levelName: string;
    fullName: string;
    levelId?: string;
  }>;
};


// ─── Student View ─────────────────────────────────────────────────────────────

type StudentTeacher = {
  id: string; name: string; email: string;
  phone: string; img: string; sex: string;
  subjects: { id: string; name: string; code: string }[];
};

function StudentTeachersView({ schoolId }: { schoolId: string }) {
  const [teachers, setTeachers] = useState<StudentTeacher[]>([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/schools/${schoolId}/teachers/my-teachers`);
        const data = await res.json();
        if (res.ok) {
          setTeachers(data.teachers || []);
          setClassName(data.student?.className || '');
        } else {
          toast.error(data.error || 'Failed to load teachers');
        }
      } catch {
        toast.error('Failed to load teachers');
      } finally {
        setLoading(false);
      }
    })();
  }, [schoolId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3 text-muted">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading your teachers…</p>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3 text-muted">
        <FiSearch className="w-10 h-10 opacity-30" />
        <p className="text-sm font-medium">No teachers assigned to your class yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text tracking-tight">My Teachers</h1>
        <p className="text-sm text-muted mt-1">{className} · {teachers.length} teacher{teachers.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-muted">
                <th className="px-5 py-3 text-left text-xs font-semibold text-text/40 uppercase tracking-wider">Teacher</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text/40 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text/40 uppercase tracking-wider">Subjects</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-muted last:border-0 hover:bg-muted/20 transition-colors"
                >
                  {/* Teacher Info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={t.img || '/default-avatar.png'}
                        alt={t.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-text truncate">{t.name}</p>
                        <p className="text-xs text-text/40 truncate sm:hidden">{t.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="flex flex-col gap-1.5">
                      <a
                        href={`mailto:${t.email}`}
                        className="flex items-center gap-2 text-xs text-text/70 hover:text-text transition-colors"
                      >
                        <FiMail className="w-3.5 h-3.5 shrink-0 text-text/30" />
                        <span className="truncate max-w-[180px]">{t.email}</span>
                      </a>
                      {t.phone && (
                        <a
                          href={`tel:${t.phone}`}
                          className="flex items-center gap-2 text-xs text-text/70 hover:text-text transition-colors"
                        >
                          <FiPhone className="w-3.5 h-3.5 shrink-0 text-text/30" />
                          <span>{t.phone}</span>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Subjects */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {t.subjects.map(s => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/50 text-text/70 text-xs font-medium"
                        >
                          <FiBook className="w-3 h-3 shrink-0 text-text/30" />
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TeachersPage = () => {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.school as string;
  const { role } = useUser();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [assignmentOptions, setAssignmentOptions] = useState<AssignmentOption[]>([]);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    birthday: '',
    sex: 'Male',
    img: '/default-avatar.png',
    assignments: [] as Array<{ subjectId: string; levelIds: string[]; classIds: string[] }>
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [targetEmail, setTargetEmail] = useState('');

  // User Check State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userCheckResult, setUserCheckResult] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [checkUserTimeout, setCheckUserTimeout] = useState<NodeJS.Timeout | null>(null);

  // Edit State
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Expanded assignment rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) =>
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schools/${schoolId}/teachers?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`);
      const data = await response.json();

      if (response.ok) {
        setTeachers(data.teachers || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error(data.error || 'Failed to fetch teachers');
      }
    } catch (error) {
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  }, [schoolId, currentPage, limit, debouncedSearch]);

  // Fetch assignment options
  const fetchAssignmentOptions = useCallback(async () => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/teachers/assignment-options`);
      const data = await response.json();

      if (response.ok) {
        setAssignmentOptions(data.subjects || []);
      }
    } catch (error) {
      console.error('Failed to fetch assignment options:', error);
    }
  }, [schoolId]);

  // Check if user exists (with debouncing)
  const checkUser = async (email: string) => {
    if (!email) {
      setUserCheckResult(null);
      return;
    }

    // Clear existing timeout
    if (checkUserTimeout) {
      clearTimeout(checkUserTimeout);
    }

    // Set new timeout for 2.5 seconds
    const timeout = setTimeout(async () => {
      try {
        setCheckingUser(true);
        const response = await fetch(`/api/schools/${schoolId}/teachers/check-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await response.json();
        setUserCheckResult(data);

        if (data.exists && data.isTeacher) {
          toast.error('User already has a teacher record');
        } else if (data.exists && !data.belongsToSchool) {
          toast.error('User exists but belongs to a different school');
        } else if (data.exists && data.belongsToSchool) {
          toast.success('User found! You can add them as a teacher');
          // Pre-fill form with user data
          setFormData(prev => ({
            ...prev,
            name: data.user.name || prev.name,
            email: data.user.email,
            password: '', // Reset password fields as user exists
            confirmPassword: ''
          }));
        } else {
          toast.info('No user found using this email. You can create a new account for them.');
        }
      } catch (error) {
        toast.error('Failed to check user');
      } finally {
        setCheckingUser(false);
      }
    }, 2500); // 2.5 seconds delay

    setCheckUserTimeout(timeout);
  };

  useEffect(() => {
    fetchTeachers();
    fetchAssignmentOptions();
  }, [fetchTeachers, fetchAssignmentOptions]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (checkUserTimeout) {
        clearTimeout(checkUserTimeout);
      }
    };
  }, [checkUserTimeout]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Upload Image Helper
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        return data.imageUrl;
      } else {
        toast.error(data.error || 'Failed to upload image');
        return null;
      }
    } catch (error) {
      toast.error('Failed to upload image');
      return null;
    }
  };

  // Create teacher
  const createTeacher = async () => {
    // Validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      let imgUrl = formData.img;

      // Upload image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          imgUrl = uploadedUrl;
        } else {
          setSubmitting(false);
          return; // Stop if upload failed
        }
      }

      // Flatten assignments for API
      const flattenedAssignments = formData.assignments.flatMap(assignment =>
        assignment.classIds.map(classId => ({
          subjectId: assignment.subjectId,
          classId: classId
        }))
      );

      const response = await fetch(`/api/schools/${schoolId}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          img: imgUrl,
          assignments: flattenedAssignments
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requireOtp) {
          // Show OTP modal
          setTargetEmail(formData.email);
          setShowCreateModal(false); // Close create modal
          setShowOtpModal(true); // Open OTP modal
          toast.success("Please verify the teacher's email with the OTP sent.");
        } else {
          toast.success('Teacher created successfully');
          resetForm();
          setShowCreateModal(false);
          fetchTeachers();
        }
      } else {
        toast.error(data.error || 'Failed to create teacher');
      }
    } catch (error) {
      toast.error('Failed to create teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpVerification = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      setVerifyingOtp(true);
      const response = await fetch(`/api/schools/${schoolId}/teachers/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, otp: otpCode })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Email verified successfully! Teacher account is active.");
        setShowOtpModal(false);
        setOtp(['', '', '', '', '', '']);
        setTargetEmail('');
        resetForm(); // Now reset form
        fetchTeachers();
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      setResendingOtp(true);
      const response = await fetch(`/api/schools/${schoolId}/teachers/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Verification code resent! Please check your email.");
        setResendCooldown(60); // 60 seconds cooldown
      } else {
        toast.error(data.error || "Failed to resend code");
      }
    } catch (error) {
      toast.error("Failed to resend code");
    } finally {
      setResendingOtp(false);
    }
  };

  // Cooldown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return false;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      const nextInput = element.nextSibling as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = (e.currentTarget.previousSibling as HTMLInputElement);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last input or submit button
    const inputs = e.currentTarget.querySelectorAll('input');
    if (inputs.length > 0) {
      const targetIndex = Math.min(pastedData.length, 5);
      inputs[targetIndex].focus();
    }
  };


  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      birthday: '',
      sex: 'Male',
      img: '/default-avatar.png',
      assignments: []
    });
    setImagePreview(null);
    setSelectedFile(null);
    setUserCheckResult(null);
    setCheckingUser(false);
  };

  // Add assignment
  const addAssignment = () => {
    setFormData(prev => ({
      ...prev,
      assignments: [...prev.assignments, { subjectId: '', levelIds: [], classIds: [] }]
    }));
  };

  // Remove assignment
  const removeAssignment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      assignments: prev.assignments.filter((_, i) => i !== index)
    }));
  };

  // Update assignment
  const updateAssignment = (index: number, field: 'subjectId' | 'levelIds' | 'classIds', value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      assignments: prev.assignments.map((assignment, i) => {
        if (i !== index) return assignment; // Not the item we're updating

        if (field === 'subjectId') {
          // Reset level and class if subject changes
          return { ...assignment, subjectId: value as string, levelIds: [], classIds: [] };
        } else if (field === 'levelIds') {
          return { ...assignment, levelIds: value as string[], classIds: [] };
        } else {
          // Just update the class
          return { ...assignment, [field]: value as string[] };
        }
      })
    }));
  };

  // Edit teacher
  const editTeacher = async (teacher: Teacher) => {
    setEditingTeacher(teacher);

    // Group existing assignments by Subject to reconstruct the multi-select state
    const groupedAssignments: Record<string, { levelIds: Set<string>, classIds: Set<string> }> = {};

    teacher.assignments?.forEach(a => {
      if (!groupedAssignments[a.subjectId]) {
        groupedAssignments[a.subjectId] = { levelIds: new Set(), classIds: new Set() };
      }
      groupedAssignments[a.subjectId].levelIds.add(a.levelId);
      groupedAssignments[a.subjectId].classIds.add(a.classId);
    });

    const reconstructedAssignments = Object.entries(groupedAssignments).map(([subjectId, data]) => ({
      subjectId,
      levelIds: Array.from(data.levelIds),
      classIds: Array.from(data.classIds)
    }));

    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: '',
      confirmPassword: '',
      phone: teacher.phone,
      address: teacher.address,
      birthday: teacher.birthday,
      sex: teacher.sex,
      img: teacher.img,
      assignments: reconstructedAssignments
    });
    setImagePreview(teacher.img);
    setShowEditModal(true);
    setUserCheckResult(null);
  };

  // Update teacher
  const updateTeacher = async () => {
    if (!editingTeacher) return;

    try {
      setSubmitting(true);
      let imgUrl = formData.img;

      // Upload image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          imgUrl = uploadedUrl;
        } else {
          setSubmitting(false);
          return; // Stop if upload failed
        }
      }

      // Flatten assignments for API
      const flattenedAssignments = formData.assignments.flatMap(assignment =>
        assignment.classIds.map(classId => ({
          subjectId: assignment.subjectId,
          classId: classId
        }))
      );

      const response = await fetch(`/api/schools/${schoolId}/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          img: imgUrl,
          assignments: flattenedAssignments
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Teacher updated successfully');
        setShowEditModal(false);
        setEditingTeacher(null);
        resetForm();
        fetchTeachers();
      } else {
        toast.error(data.error || 'Failed to update teacher');
      }
    } catch (error) {
      toast.error('Failed to update teacher');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete teacher
  const deleteTeacher = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingTeacher(teacherId);
      const response = await fetch(`/api/schools/${schoolId}/teachers/${teacherId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Teacher deleted successfully');
        fetchTeachers();
      } else {
        toast.error(data.error || 'Failed to delete teacher');
      }
    } catch (error) {
      toast.error('Failed to delete teacher');
    } finally {
      setDeletingTeacher(null);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file); // Store file for later upload
    }
  };

  const renderRow = (item: Teacher) => (
    <tr
      key={item.id}
      className="border-b border-muted/60 last:border-0 hover:bg-muted/20 transition-colors group"
    >
      {/* Teacher */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3.5">
          <Image
            src={item.img || "/default-avatar.png"}
            alt={item.name}
            width={44}
            height={44}
            className="w-11 h-11 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-text text-sm leading-tight truncate">{item.name}</p>
            <p className="text-xs text-text/45 mt-0.5 truncate">{item.email}</p>
          </div>
        </div>
      </td>

      {/* ID + Joined */}
      <td className="hidden md:table-cell px-6 py-4">
        <p className="font-mono text-xs font-medium text-text/70">{item.teacherId}</p>
        <p className="text-[11px] text-text/35 mt-1">
          Since {new Date(item.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </p>
      </td>

      {/* Account status */}
      <td className="hidden sm:table-cell px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            item.user ? "bg-text/50" : "bg-text/20"
          )} />
          <span className="text-xs text-text/60">
            {item.user ? "Active account" : "No account"}
          </span>
        </div>
        <p className="text-[11px] text-text/35 mt-1.5 ml-3.5">{item.sex}</p>
      </td>

      {/* Assignments */}
      <td className="hidden lg:table-cell px-6 py-4">
        {item.assignments && item.assignments.length > 0 ? (() => {
          const expanded = expandedRows.has(item.id);
          const visible = expanded ? item.assignments : item.assignments.slice(0, 2);
          const hidden = item.assignments.length - 2;
          return (
            <div className="flex flex-col gap-1.5 max-w-[280px]">
              {visible.map((a, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-semibold text-text/70 text-[11px] w-14 shrink-0 truncate">{a.subjectCode}</span>
                  <span className="text-text/40 text-[11px] truncate">{a.fullClassName}</span>
                </div>
              ))}
              {hidden > 0 && !expanded && (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="text-[11px] text-text/45 hover:text-text/70 text-left cursor-pointer transition-colors w-fit"
                >
                  +{hidden} more subject{hidden !== 1 ? "s" : ""}
                </button>
              )}
              {expanded && (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="text-[11px] text-text/45 hover:text-text/70 text-left cursor-pointer transition-colors w-fit"
                >
                  Show less
                </button>
              )}
            </div>
          );
        })() : (
          <span className="text-xs text-text/30 italic">No assignments</span>
        )}
      </td>

      {/* Contact */}
      <td className="hidden xl:table-cell px-6 py-4">
        <p className="text-xs text-text/65">{item.phone || <span className="text-text/30">—</span>}</p>
        <p className="text-[11px] text-text/35 mt-1 truncate max-w-[150px]" title={item.address}>
          {item.address || "—"}
        </p>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex gap-1 justify-end">
          <button
            onClick={() => editTeacher(item)}
            className="p-2 rounded-lg text-text/30 hover:text-text hover:bg-muted/50 transition-all cursor-pointer"
            title="Edit"
          >
            <FiEdit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteTeacher(item.id)}
            disabled={deletingTeacher === item.id}
            className="p-2 rounded-lg text-text/30 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Delete"
          >
            {deletingTeacher === item.id ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiTrash className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );

  const renderForm = (isEditing: boolean) => (
    <div className="space-y-8">
      {/* Header Profile Section */}
      <div className="flex items-center gap-6 p-6 bg-surface rounded-xl border border-muted/60">
        <div className="relative group cursor-pointer shrink-0">
          <div className="w-24 h-24 rounded-full p-1 border-2 border-dashed border-muted group-hover:border-primary/50 transition-colors">
            <Image
              src={imagePreview || formData.img || "/default-avatar.png"}
              alt="Teacher"
              width={96}
              height={96}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full m-1 pointer-events-none">
            <FiEdit className="w-6 h-6" />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Change profile photo"
          />
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold text-text">Profile Photo</h3>
          <p className="text-sm text-text/60">Upload a professional photo. Preferred size 400x400px.</p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="text-xs bg-bg border border-muted px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors text-text"
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            >
              Choose File
            </button>
            {imagePreview && (
              <button
                type="button"
                className="text-xs text-red-500 hover:text-red-600 px-2"
                onClick={() => { setImagePreview(null); setFormData(p => ({ ...p, img: '/default-avatar.png' })); setSelectedFile(null); }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-text uppercase tracking-wider border-b border-muted pb-2">
          Personal Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text/70">Full Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-bg border border-muted rounded-lg text-sm text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text/30"
                placeholder="e.g. John Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text/70">Email Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  if (!isEditing) checkUser(e.target.value);
                }}
                className="w-full px-4 py-2.5 bg-bg border border-muted rounded-lg text-sm text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pr-10 placeholder:text-text/30"
                placeholder="email@school.com"
              />
              {checkingUser && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            {userCheckResult && !isEditing && (
              <div className={cn(
                "text-[11px] mt-1.5 flex items-center gap-2 font-medium px-2 py-1 rounded-md w-fit",
                userCheckResult.exists && userCheckResult.belongsToSchool && !userCheckResult.isTeacher
                  ? "bg-green-50 text-green-700"
                  : userCheckResult.exists && userCheckResult.isTeacher
                    ? "bg-red-50 text-red-700"
                    : "bg-blue-50 text-blue-700"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full",
                  userCheckResult.exists && userCheckResult.belongsToSchool && !userCheckResult.isTeacher ? "bg-green-600" :
                    userCheckResult.exists && userCheckResult.isTeacher ? "bg-red-600" : "bg-blue-600"
                )}></span>
                {userCheckResult.message || (userCheckResult.exists ? "User account found" : "New user account will be created")}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text/70">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2.5 bg-bg border border-muted rounded-lg text-sm text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text/30"
              placeholder="+1 234 567 890"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text/70">Gender</label>
            <Select
              value={formData.sex}
              onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}
            >
              <SelectTrigger className="w-full px-4 py-2.5 bg-bg border border-muted rounded-lg text-sm text-text focus:ring-2 focus:ring-primary/20 focus:border-primary h-auto">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text/70">Date of Birth</label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
              className="w-full px-4 py-2.5 bg-bg border border-muted rounded-lg text-sm text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text/70">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-2.5 bg-bg border border-muted rounded-lg text-sm text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text/30"
              placeholder="Full address"
            />
          </div>
        </div>
      </div>

      {/* Account Security (Conditional) */}
      {!isEditing && (!userCheckResult?.exists) && formData.email && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-muted pb-2">
            <h4 className="text-sm font-semibold text-text uppercase tracking-wider">Account Security</h4>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">New Account</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text/70">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-bg border border-muted rounded-lg text-sm text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text/30"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 hover:text-text transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text/70">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={cn(
                    "w-full px-4 py-2.5 bg-bg border rounded-lg text-sm text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text/30",
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-muted"
                  )}
                  placeholder="Repeat password"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {formData.confirmPassword && (
                    formData.password === formData.confirmPassword ? (
                      <FiCheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <FiAlertCircle className="w-4 h-4 text-red-500" />
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-text/40 hover:text-text transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject Assignments */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-muted pb-2">
          <h4 className="text-sm font-semibold text-text uppercase tracking-wider">Subject Assignments</h4>
          <button
            onClick={addAssignment}
            className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-muted hover:border-primary/50 text-xs font-medium rounded-lg text-text hover:text-primary transition-all shadow-sm"
          >
            <FiPlus className="w-3.5 h-3.5" />
            Add Subject
          </button>
        </div>

        <div className="space-y-3">
          {formData.assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 bg-surface border-2 border-dashed border-muted rounded-xl text-center">
              <div className="w-12 h-12 bg-bg rounded-full flex items-center justify-center mb-3">
                <FiPlus className="w-6 h-6 text-text/30" />
              </div>
              <p className="text-sm text-text font-medium">No subjects assigned</p>
              <p className="text-xs text-text/50 mt-1 max-w-[200px]">Assign subjects and classes to this teacher to get started.</p>
              <button
                onClick={addAssignment}
                className="mt-4 text-xs text-primary font-medium hover:underline"
              >
                Assign a Subject
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {formData.assignments.map((assignment, index) => {
                const selectedSubject = assignmentOptions.find(s => s.id === assignment.subjectId);
                const availableLevels = selectedSubject?.levels || [];
                const availableClasses = selectedSubject?.availableClasses.filter(cls =>
                  !cls.levelId || assignment.levelIds.includes(cls.levelId)
                ) || [];

                return (
                  <div
                    key={index}
                    className="group relative p-4 bg-surface rounded-xl border border-muted shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => removeAssignment(index)}
                        className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors"
                        title="Remove Assignment"
                      >
                        <FiTrash className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Subject Select */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-text/50 tracking-wider">Subject</label>
                        <Select
                          value={assignment.subjectId}
                          onValueChange={(value) => updateAssignment(index, 'subjectId', value)}
                        >
                          <SelectTrigger className="w-full bg-bg border-muted h-10 text-sm">
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {assignmentOptions.map(subject => (
                              <SelectItem key={subject.id} value={subject.id}>
                                <span className="font-medium">{subject.name}</span> <span className="text-text/50 text-xs">({subject.code})</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Levels Select */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-text/50 tracking-wider">Levels</label>
                        <MultiSelect
                          options={availableLevels.map(l => ({ label: l.name, value: l.id }))}
                          selected={assignment.levelIds}
                          onChange={(selected) => updateAssignment(index, 'levelIds', selected)}
                          placeholder={selectedSubject ? "Select Levels..." : "Choose Subject First"}
                          className="bg-bg border-muted min-h-[40px]"
                          disabled={!assignment.subjectId}
                        />
                      </div>

                      {/* Classes Select */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-text/50 tracking-wider">Classes</label>
                        <MultiSelect
                          options={availableClasses.map(c => ({ label: c.name, value: c.id }))}
                          selected={assignment.classIds}
                          onChange={(selected) => updateAssignment(index, 'classIds', selected)}
                          placeholder={assignment.levelIds.length > 0 ? "Select Classes..." : "Choose Levels First"}
                          className="bg-bg border-muted min-h-[40px]"
                          disabled={assignment.levelIds.length === 0}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-muted mt-8">
        <button
          onClick={() => {
            isEditing ? setShowEditModal(false) : setShowCreateModal(false);
            resetForm();
          }}
          className="px-5 py-2.5 text-sm font-medium text-text/70 hover:text-text hover:bg-surface rounded-lg transition-colors"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          onClick={isEditing ? updateTeacher : createTeacher}
          className="px-6 py-2.5 text-sm font-medium bg-primary text-white hover:opacity-90 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
          disabled={submitting}
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <FiSave className="w-4 h-4" />
          )}
          {isEditing ? 'Save Changes' : 'Create Teacher'}
        </button>
      </div>
    </div>
  );

  // Student sees their own teacher list
  if (role === 'student') {
    return (
      <div className="flex flex-col bg-bg p-6 h-full w-full overflow-auto font-poppins text-text animate-in fade-in duration-500">
        <StudentTeachersView schoolId={schoolId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-bg px-6 pt-6 pb-6 w-full min-h-full font-poppins text-text overflow-y-auto">

      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text">Teachers</h1>
          <p className="text-sm text-text/40 mt-0.5">Manage your school&apos;s teaching staff and subject assignments.</p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-2.5">
          <div className="relative flex-1 md:w-60 group">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text/30 group-focus-within:text-text/60 transition-colors" />
            <input
              type="text"
              placeholder="Search name, ID or email…"
              className="w-full pl-9 pr-4 py-2 bg-surface rounded-lg text-sm text-text placeholder:text-text/30 outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="shrink-0 px-4 py-2 bg-primary text-white rounded-lg font-medium flex items-center gap-2 text-sm hover:opacity-90 transition-opacity"
          >
            <FiPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Teacher</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Table card — grows to fit all rows, no internal scroll */}
      <div className="bg-surface rounded-xl overflow-hidden">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-7 h-7 border-2 border-muted border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-text/40">Loading teachers…</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <FiSearch className="w-8 h-8 text-text/20" />
            <p className="text-sm font-medium text-text/40">No teachers found</p>
            <p className="text-xs text-text/25">Try adjusting your search or add a new teacher.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-muted/60">
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-text/35 uppercase tracking-widest">Teacher</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-text/35 uppercase tracking-widest hidden md:table-cell">ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-text/35 uppercase tracking-widest hidden sm:table-cell">Account</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-text/35 uppercase tracking-widest hidden lg:table-cell">Assignments</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-text/35 uppercase tracking-widest hidden xl:table-cell">Contact</th>
                <th className="px-6 py-3 w-20" />
              </tr>
            </thead>
            <tbody>{teachers.map((item) => renderRow(item))}</tbody>
          </table>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-muted/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-text/40">
            <span>Rows per page</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => { setLimit(Number(value)); setCurrentPage(1); }}
            >
              <SelectTrigger className="w-16 h-7 bg-bg text-xs text-text/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-text/25">·</span>
            <span>{teachers.length} result{teachers.length !== 1 ? "s" : ""}</span>
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </div>
      </div>

      {/* Modal styling adjustment */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-surface ring-1 ring-white/10">
            <div className="flex items-center justify-between p-6 border-b border-muted bg-surface/50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-text">
                  {showEditModal ? 'Edit Teacher Profile' : 'Add New Teacher'}
                </h2>
                <p className="text-sm text-text/50 mt-1">
                  {showEditModal ? 'Update teacher details and assignments.' : 'Create a new teacher account and assign subjects.'}
                </p>
              </div>
              <button
                onClick={() => {
                  showEditModal ? setShowEditModal(false) : setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-muted rounded-full transition-colors text-text/60 hover:text-text"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              {renderForm(showEditModal)}
            </div>
          </div>
        </div>
      )}


      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 border border-border p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Verify Email</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Enter the 6-digit code sent to <span className="font-medium text-foreground">{targetEmail}</span>
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-10 h-12 border border-input rounded-lg text-center text-xl font-bold bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onFocus={e => e.target.select()}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleOtpVerification}
                disabled={verifyingOtp}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {verifyingOtp && (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                )}
                Verify Account
              </button>

              <div className="text-center mt-2">
                <button
                  onClick={handleResendOtp}
                  disabled={resendingOtp || resendCooldown > 0}
                  className="text-sm font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline transition-all"
                >
                  {resendingOtp ? (
                    <span className="flex items-center gap-2 justify-center">
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Resending...
                    </span>
                  ) : resendCooldown > 0 ? (
                    `Resend code in ${resendCooldown}s`
                  ) : (
                    "Didn't receive the code? Resend"
                  )}
                </button>
              </div>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setTargetEmail('');
                  setOtp(['', '', '', '', '', '']);
                }}
                className="w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;

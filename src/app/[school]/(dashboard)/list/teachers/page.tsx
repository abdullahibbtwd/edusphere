"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import FormModel from "@/components/FormModel";
import { FiEye,FiEdit,FiTrash } from "react-icons/fi";
import { useParams } from "next/navigation";
import { toast } from "sonner";

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
  }>;
};

const columns = [
  { header: "Teacher Info", accessor: "info" },
  { header: "Teacher ID", accessor: "teacherId", className: "hidden md:table-cell" },
  { header: "Assignments", accessor: "assignments", className: "hidden lg:table-cell" },
  { header: "Contact", accessor: "contact", className: "hidden xl:table-cell" },
  { header: "Actions", accessor: "action" },
];

const TeachersPage = () => {
  const params = useParams();
  const schoolId = params.school as string;
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [assignmentOptions, setAssignmentOptions] = useState<AssignmentOption[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthday: '',
    sex: 'Male',
    img: '/default-avatar.png',
    assignments: [] as Array<{ subjectId: string; classId: string }>
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userCheckResult, setUserCheckResult] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [checkUserTimeout, setCheckUserTimeout] = useState<NodeJS.Timeout | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schools/${schoolId}/teachers?page=${currentPage}&limit=10`);
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
  }, [schoolId, currentPage]);

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
            email: data.user.email
          }));
        } else {
          toast.info('No user found with this email. Teacher will be created without user account.');
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

  // Create teacher
  const createTeacher = async () => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Teacher created successfully');
        setShowCreateForm(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          birthday: '',
          sex: 'Male',
          img: '/default-avatar.png',
          assignments: []
        });
        setImagePreview(null);
        setUserCheckResult(null);
        fetchTeachers();
      } else {
        toast.error(data.error || 'Failed to create teacher');
      }
    } catch (error) {
      toast.error('Failed to create teacher');
    }
  };

  // Add assignment
  const addAssignment = () => {
    setFormData(prev => ({
      ...prev,
      assignments: [...prev.assignments, { subjectId: '', classId: '' }]
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
  const updateAssignment = (index: number, field: 'subjectId' | 'classId', value: string) => {
    setFormData(prev => ({
      ...prev,
      assignments: prev.assignments.map((assignment, i) => 
        i === index ? { ...assignment, [field]: value } : assignment
      )
    }));
  };

  // Edit teacher
  const editTeacher = async (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      address: teacher.address,
      birthday: teacher.birthday,
      sex: teacher.sex,
      img: teacher.img,
      assignments: teacher.assignments?.map(a => ({
        subjectId: a.subjectId,
        classId: a.classId
      })) || []
    });
    setImagePreview(teacher.img);
    setShowEditForm(true);
    setUserCheckResult(null);
  };

  // Update teacher
  const updateTeacher = async () => {
    if (!editingTeacher) return;

    try {
      const response = await fetch(`/api/schools/${schoolId}/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Teacher updated successfully');
        setShowEditForm(false);
        setEditingTeacher(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          birthday: '',
          sex: 'Male',
          img: '/default-avatar.png',
          assignments: []
        });
        setImagePreview(null);
        setUserCheckResult(null);
        fetchTeachers();
      } else {
        toast.error(data.error || 'Failed to update teacher');
      }
    } catch (error) {
      toast.error('Failed to update teacher');
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

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({ ...prev, img: data.imageUrl }));
        setImagePreview(data.imageUrl);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
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

      // Upload to Cloudinary
      handleImageUpload(file);
    }
  };

  const renderRow = (item: Teacher) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-secondary odd:bg-accent text-[12px] hover:bg-muted"
    >
      {/* Teacher Info */}
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/default-avatar.png"}
          alt=""
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold text-foreground">{item.name}</h3>
          <h3 className="text-xs text-muted-foreground">{item.email}</h3>
          <div className="flex items-center gap-2 mt-1">
            {item.user && (
              <span className="text-xs text-green-600">✓ User Account</span>
            )}
            <span className="text-xs text-blue-600">{item.sex}</span>
          </div>
        </div>
      </td>

      {/* Teacher ID */}
      <td className="hidden md:table-cell text-foreground p-4">
        <div className="font-mono text-sm">{item.teacherId}</div>
        <div className="text-xs text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString()}
        </div>
      </td>

      {/* Assignments */}
      <td className="hidden lg:table-cell text-foreground p-4">
        <div className="max-w-xs">
          {item.assignments && item.assignments.length > 0 ? (
            <div className="space-y-1">
              {item.assignments.slice(0, 3).map((assignment, index) => (
                <div key={index} className="text-xs bg-muted px-2 py-1 rounded">
                  <span className="font-medium">{assignment.subjectName}</span>
                  <span className="text-muted-foreground"> - {assignment.fullClassName}</span>
                </div>
              ))}
              {item.assignments.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{item.assignments.length - 3} more...
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No assignments</div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            {item.assignmentCount} total assignment{item.assignmentCount !== 1 ? 's' : ''}
          </div>
        </div>
      </td>

      {/* Contact Info */}
      <td className="hidden xl:table-cell text-foreground p-4">
        <div className="text-xs">
          <div className="font-medium">{item.phone}</div>
          <div className="text-muted-foreground truncate max-w-32" title={item.address}>
            {item.address}
          </div>
          <div className="text-muted-foreground">
            DOB: {new Date(item.birthday).toLocaleDateString()}
          </div>
        </div>
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex gap-2 items-center">
          <button
            className="p-2 rounded-full hover:bg-accent transition"
            title="View Details"
            onClick={() => editTeacher(item)}
          >
            <FiEye className="text-foreground w-4 h-4" />
          </button>
          <button
            onClick={() => editTeacher(item)}
            className="p-2 rounded-full hover:bg-blue-100 transition"
            title="Edit Teacher"
          >
            <FiEdit className="w-4 h-4 text-blue-500" />
          </button>
          <button
            onClick={() => deleteTeacher(item.id)}
            disabled={deletingTeacher === item.id}
            className="p-2 rounded-full hover:bg-red-100 transition disabled:opacity-50"
            title="Delete Teacher"
          >
            {deletingTeacher === item.id ? (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <FiTrash className="w-4 h-4 text-red-500" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col bg-background p-4 m-4 mt-0 flex-1 rounded-2xl shadow">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block font-semibold text-foreground">
          All Teachers
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
            <button 
              onClick={() => setShowCreateForm(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white cursor-pointer"
            >
              <Image src="/plus.png" alt="" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Teacher Form */}
      {showEditForm && editingTeacher && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Edit Teacher: {editingTeacher.name}</h3>
          
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Teacher Photo</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={imagePreview || formData.img || "/default-avatar.png"}
                  alt="Teacher preview"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-lg"
                  disabled={uploadingImage}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload JPEG, PNG, or WebP image (max 5MB)
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                placeholder="Full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="flex gap-2 items-center">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    checkUser(e.target.value);
                  }}
                  className="flex-1 p-2 border rounded-lg"
                  placeholder="Email address"
                />
                {checkingUser && (
                  <div className="flex items-center gap-1 text-sm text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking...</span>
                  </div>
                )}
              </div>
              {userCheckResult && (
                <div className={`text-xs mt-1 flex items-center gap-1 ${
                  userCheckResult.exists && userCheckResult.belongsToSchool && !userCheckResult.isTeacher 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    userCheckResult.exists && userCheckResult.belongsToSchool && !userCheckResult.isTeacher 
                      ? 'bg-green-600' 
                      : 'bg-red-600'
                  }`}></span>
                  {userCheckResult.message}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                placeholder="Phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sex</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Birthday</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                placeholder="Address"
              />
            </div>
          </div>

          {/* Subject Assignments */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Subject Assignments</label>
              <button
                onClick={addAssignment}
                className="px-3 py-1 bg-primary text-white rounded text-sm"
              >
                Add Assignment
              </button>
            </div>
            
            {formData.assignments.map((assignment, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  value={assignment.subjectId}
                  onChange={(e) => updateAssignment(index, 'subjectId', e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                >
                  <option value="">Select Subject</option>
                  {assignmentOptions.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
                
                <select
                  value={assignment.classId}
                  onChange={(e) => updateAssignment(index, 'classId', e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                  disabled={!assignment.subjectId}
                >
                  <option value="">Select Class</option>
                  {assignment.subjectId && assignmentOptions
                    .find(s => s.id === assignment.subjectId)
                    ?.availableClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.fullName}
                      </option>
                    ))}
                </select>
                
                <button
                  onClick={() => removeAssignment(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={updateTeacher}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Update Teacher
            </button>
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditingTeacher(null);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  address: '',
                  birthday: '',
                  sex: 'Male',
                  img: '/default-avatar.png',
                  assignments: []
                });
                setImagePreview(null);
                setUserCheckResult(null);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Teacher Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add New Teacher</h3>
          
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Teacher Photo</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={imagePreview || formData.img || "/default-avatar.png"}
                  alt="Teacher preview"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-lg"
                  disabled={uploadingImage}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload JPEG, PNG, or WebP image (max 5MB)
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                placeholder="Full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="flex gap-2 items-center">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    checkUser(e.target.value);
                  }}
                  className="flex-1 p-2 border rounded-lg"
                  placeholder="Email address"
                />
                {checkingUser && (
                  <div className="flex items-center gap-1 text-sm text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking...</span>
                  </div>
                )}
              </div>
              {userCheckResult && (
                <div className={`text-xs mt-1 flex items-center gap-1 ${
                  userCheckResult.exists && userCheckResult.belongsToSchool && !userCheckResult.isTeacher 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    userCheckResult.exists && userCheckResult.belongsToSchool && !userCheckResult.isTeacher 
                      ? 'bg-green-600' 
                      : 'bg-red-600'
                  }`}></span>
                  {userCheckResult.message}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                placeholder="Phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sex</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Birthday</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                placeholder="Address"
              />
            </div>
          </div>

          {/* Subject Assignments */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Subject Assignments</label>
              <button
                onClick={addAssignment}
                className="px-3 py-1 bg-primary text-white rounded text-sm"
              >
                Add Assignment
              </button>
            </div>
            
            {formData.assignments.map((assignment, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  value={assignment.subjectId}
                  onChange={(e) => updateAssignment(index, 'subjectId', e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                >
                  <option value="">Select Subject</option>
                  {assignmentOptions.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
                
                <select
                  value={assignment.classId}
                  onChange={(e) => updateAssignment(index, 'classId', e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                  disabled={!assignment.subjectId}
                >
                  <option value="">Select Class</option>
                  {assignment.subjectId && assignmentOptions
                    .find(s => s.id === assignment.subjectId)
                    ?.availableClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.fullName}
                      </option>
                    ))}
                </select>
                
                <button
                  onClick={() => removeAssignment(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={createTeacher}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Create Teacher
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  address: '',
                  birthday: '',
                  sex: 'Male',
                  img: '/default-avatar.png',
                  assignments: []
                });
                setImagePreview(null);
                setUserCheckResult(null);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Teacher Table */}
      <div>
        {loading ? (
          <div className="text-center py-8">Loading teachers...</div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={teachers} />
        )}
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

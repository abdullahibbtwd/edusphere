"use client"
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import { FaSort, FaFilter } from "react-icons/fa";
import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

type Subject = {
  id: string;
  name: string;
  code: string;
  creditUnit: number;
  term: string;
  levelName: string;
  classes: string;
  classAssignment: string | null;
  teacherCount: number;
  isGeneral: boolean;
  schoolId: string;
  levelId: string;
  createdAt: string;
  updatedAt: string;
};

const columns = [
  { header: "Subject Name", accessor: "name" },
  { header: "Level", accessor: "levelName" },
  { header: "Classes", accessor: "classes" },
  { header: "Teachers", accessor: "teacherCount" },
  { header: "Actions", accessor: "action" },
];

const subjectTypes = [
  { 
    value: 'school_general', 
    label: 'School General', 
    description: 'Subject for all students in the school' 
  },
  { 
    value: 'junior_general', 
    label: 'Junior General', 
    description: 'Subject for all junior secondary students (JSS1-3)' 
  },
  { 
    value: 'senior_general', 
    label: 'Senior General', 
    description: 'Subject for all senior secondary students (SS1-3)' 
  },
  { 
    value: 'class_specific', 
    label: 'Class Specific', 
    description: 'Subject for specific class across levels (e.g., Class A)' 
  }
];

const classAssignments = [
  { value: 'Junior Class A', label: 'Junior Class A (JSS1A, JSS2A, JSS3A)' },
  { value: 'Junior Class B', label: 'Junior Class B (JSS1B, JSS2B, JSS3B)' },
  { value: 'Junior Class C', label: 'Junior Class C (JSS1C, JSS2C, JSS3C)' },
  { value: 'Junior Class D', label: 'Junior Class D (JSS1D, JSS2D, JSS3D)' },
  { value: 'Senior Class A', label: 'Senior Class A (SS1A, SS2A, SS3A)' },
  { value: 'Senior Class B', label: 'Senior Class B (SS1B, SS2B, SS3B)' },
  { value: 'Senior Class C', label: 'Senior Class C (SS1C, SS2C, SS3C)' },
  { value: 'Senior Class D', label: 'Senior Class D (SS1D, SS2D, SS3D)' }
];

const SubjectsPage = () => {
  const params = useParams();
  const schoolId = params.school as string;
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subjectType: 'school_general',
    classAssignment: ''
  });

  // Fetch subjects from API
  const fetchSubjects = useCallback(async () => {
    if (!schoolId || schoolId === 'undefined' || schoolId.trim() === '') return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/schools/${schoolId}/subjects?page=${currentPage}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      
      const data = await response.json();
      setSubjects(data.subjects || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
      setSubjects([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [schoolId, currentPage]);

  // Create subject
  const createSubject = async () => {
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch(`/api/schools/${schoolId}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subject');
      }

      const data = await response.json();
      toast.success(data.message || 'Subject created successfully');
      setShowCreateForm(false);
      setFormData({ name: '', subjectType: 'school_general', classAssignment: '' });
      await fetchSubjects(); // Refresh the list
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create subject');
    } finally {
      setCreating(false);
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Fetch subjects on component mount and when page changes
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const renderRow = (item: Subject) => (
    <tr
      key={item.id}
      className="border-b border-muted text-text hover:bg-accent transition-colors text-[12px]"
    >
      <td className="font-semibold p-4 px-1">{item.name}</td>
      <td className="p-4 px-1">{item.levelName}</td>
      <td className="p-4 px-1">{item.classes || 'All Classes'}</td>
      <td className="p-4 px-1">{item.teacherCount}</td>
      <td>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {/* Edit functionality */}}
            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:opacity-90"
          >
            Edit
          </button>
          <button
            onClick={() => {/* Delete functionality */}}
            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col bg-surface p-4 m-4 mt-0 flex-1 rounded-lg shadow-sm">
      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
        <p>SubjectsPage - schoolId: {schoolId}</p>
        <p>Loading: {loading.toString()}, Subjects: {subjects?.length || 0}</p>
      </div>

      {/* Subject Creation Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Subject</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mathematics, English, Physics"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Type
              </label>
              <select
                value={formData.subjectType}
                onChange={(e) => setFormData({ ...formData, subjectType: e.target.value, classAssignment: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjectTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {formData.subjectType === 'class_specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Assignment
                </label>
                <select
                  value={formData.classAssignment}
                  onChange={(e) => setFormData({ ...formData, classAssignment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class Assignment</option>
                  {classAssignments.map((assignment) => (
                    <option key={assignment.value} value={assignment.value}>
                      {assignment.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSubject}
                disabled={creating}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating...' : 'Create Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Section */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="hidden md:block font-semibold text-xl">School Subjects</h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full">
              <FaFilter size={18}/>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full">
              <FaSort size={18}/>
            </button>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              Add Subject
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading subjects...</div>
        </div>
      ) : (
        <>
          {/* Subject List */}
          <div className="overflow-x-auto">
            <Table columns={columns} renderRow={renderRow} data={subjects || []} />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubjectsPage;
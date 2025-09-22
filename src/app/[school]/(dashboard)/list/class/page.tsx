"use client";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import { useState, useCallback, useEffect } from "react";
import ClassManagementModal from "@/components/ClassManagementModel";
import { FaFilter, FaSort } from "react-icons/fa";
import { useParams } from "next/navigation";
import { toast } from "sonner";

const columns = [
  { header: "Class", accessor: "name" },
  { header: "Level", accessor: "levelName" },
  { header: "No. of Students", accessor: "studentCount" },
  { header: "Head Teacher", accessor: "headTeacher" },
  { header: "Subjects", accessor: "subjectCount" },
  { header: "Actions", accessor: "action" },
];

type Class = {
  id: string;
  name: string;
  levelName: string;
  studentCount: number;
  subjectCount: number;
  headTeacher: string;
  description: string;
  isActive: boolean;
  schoolId: string;
  levelId: string;
  createdAt: string;
  updatedAt: string;
};

const classOptions = [
  { 
    range: 'JSS1-3', 
    title: 'Junior Secondary Classes (JSS1-3)', 
    description: 'Create classes A-D for JSS1, JSS2, JSS3',
    suffixes: ['A', 'B', 'C', 'D']
  },
  { 
    range: 'SS1-3', 
    title: 'Senior Secondary Classes (SS1-3)', 
    description: 'Create classes A-D for SS1, SS2, SS3',
    suffixes: ['A', 'B', 'C', 'D']
  },
  { 
    range: 'JSS1-SS3', 
    title: 'Complete School Classes (JSS1-SS3)', 
    description: 'Create classes A-D for all levels from JSS1 to SS3',
    suffixes: ['A', 'B', 'C', 'D']
  }
];

const SecondarySchoolPage = () => {
  const params = useParams();
  const schoolId = params.school as string;
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string>("");

  // Fetch classes from API
  const fetchClasses = useCallback(async () => {
    if (!schoolId || schoolId === 'undefined' || schoolId.trim() === '') return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/schools/${schoolId}/classes?page=${currentPage}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      
      const data = await response.json();
      setClasses(data.classes || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
      setClasses([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [schoolId, currentPage]);

  // Create classes automatically
  const createClasses = async (levelRange: string, classSuffixes: string[]) => {
    try {
      setCreating(true);
      const response = await fetch(`/api/schools/${schoolId}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          levelRange,
          classSuffixes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create classes');
      }

      const data = await response.json();
      toast.success(data.message || 'Classes created successfully');
      await fetchClasses(); // Refresh the list
    } catch (error) {
      console.error('Error creating classes:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create classes');
    } finally {
      setCreating(false);
    }
  };

  // Handle class creation with confirmation
  const handleCreateClasses = (levelRange: string, title: string, suffixes: string[]) => {
    const option = classOptions.find(opt => opt.range === levelRange);
    if (!option) return;

    toast.custom((t) => (
      <div className="bg-white p-6 rounded-lg shadow-lg border max-w-md">
        <h3 className="text-lg font-semibold mb-2">Create {title}</h3>
        <p className="text-gray-600 mb-4">
          This will create the following classes: {option.suffixes.map(suffix => 
            levelRange === 'JSS1-3' ? `JSS1${suffix}, JSS2${suffix}, JSS3${suffix}` :
            levelRange === 'SS1-3' ? `SS1${suffix}, SS2${suffix}, SS3${suffix}` :
            `JSS1${suffix}, JSS2${suffix}, JSS3${suffix}, SS1${suffix}, SS2${suffix}, SS3${suffix}`
          ).join(', ')}
        </p>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={() => toast.dismiss(t)} 
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t);
              createClasses(levelRange, suffixes);
            }}
            disabled={creating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {creating ? 'Creating...' : 'Create Classes'}
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleOpenClassModal = (classId: string, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setIsClassModalOpen(true);
  };

  const handleCloseClassModal = () => {
    setIsClassModalOpen(false);
    setSelectedClassId(null);
    setSelectedClassName("");
  };

  // Fetch classes on component mount and when page changes
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Stats calculation
  const totalJSS1 = classes.filter(c => c.name.startsWith("JSS1")).reduce((sum, c) => sum + c.studentCount, 0);
  const totalJSS2 = classes.filter(c => c.name.startsWith("JSS2")).reduce((sum, c) => sum + c.studentCount, 0);
  const totalJSS3 = classes.filter(c => c.name.startsWith("JSS3")).reduce((sum, c) => sum + c.studentCount, 0);
  const totalSS1 = classes.filter(c => c.name.startsWith("SS1")).reduce((sum, c) => sum + c.studentCount, 0);
  const totalSS2 = classes.filter(c => c.name.startsWith("SS2")).reduce((sum, c) => sum + c.studentCount, 0);
  const totalSS3 = classes.filter(c => c.name.startsWith("SS3")).reduce((sum, c) => sum + c.studentCount, 0);

const renderRow = (item: Class) => (
  <tr
    key={item.id}
    className="border-b border-muted text-text hover:bg-accent transition-colors text-[12px]"
  >
    <td className="font-semibold p-4 px-1">{item.name}</td>
    <td className="p-4 px-1">{item.levelName}</td>
    <td className="p-4 px-1">{item.studentCount}</td>
    <td className="p-4 px-1">{item.headTeacher}</td>
    <td className="p-4 px-1">{item.subjectCount}</td>
    <td>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => handleOpenClassModal(item.id, item.name)}
          className="bg-success text-surface px-2 py-1 rounded text-xs hover:opacity-90"
        >
          Manage Class
        </button>
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
        <p>ClassesPage - schoolId: {schoolId}</p>
        <p>Loading: {loading.toString()}, Classes: {classes?.length || 0}</p>
      </div>

      {/* Show create buttons when no classes exist */}
      {classes && classes.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create School Classes</h2>
          <p className="text-gray-600 mb-6">Choose the class structure for your school:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classOptions.map((option) => (
              <div key={option.range} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-800 mb-2">{option.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                <div className="text-xs text-gray-500 mb-4">
                  Classes: {option.suffixes.map(suffix => 
                    option.range === 'JSS1-3' ? `JSS1${suffix}, JSS2${suffix}, JSS3${suffix}` :
                    option.range === 'SS1-3' ? `SS1${suffix}, SS2${suffix}, SS3${suffix}` :
                    `JSS1${suffix}, JSS2${suffix}, JSS3${suffix}, SS1${suffix}, SS2${suffix}, SS3${suffix}`
                  ).join(', ')}
                </div>
                <button 
                  onClick={() => handleCreateClasses(option.range, option.title, option.suffixes)} 
                  disabled={creating}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Classes'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats at the top */}
      {classes && classes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="p-3 rounded-lg text-center bg-primary text-text">
            <p className="text-lg font-bold">{totalJSS1}</p>
            <p className="text-sm">JSS1 Students</p>
          </div>
          <div className="p-3 rounded-lg text-center bg-cta text-text">
            <p className="text-lg font-bold">{totalJSS2}</p>
            <p className="text-sm">JSS2 Students</p>
          </div>
          <div className="p-3 rounded-lg text-center bg-success text-text">
            <p className="text-lg font-bold">{totalJSS3}</p>
            <p className="text-sm">JSS3 Students</p>
          </div>
          <div className="p-3 rounded-lg text-center bg-primary-400 text-text">
            <p className="text-lg font-bold">{totalSS1}</p>
            <p className="text-sm">SS1 Students</p>
          </div>
          <div className="p-3 rounded-lg text-center bg-accent text-text">
            <p className="text-lg font-bold">{totalSS2}</p>
            <p className="text-sm">SS2 Students</p>
          </div>
          <div className="p-3 rounded-lg text-center bg-muted text-text">
            <p className="text-lg font-bold">{totalSS3}</p>
            <p className="text-sm">SS3 Students</p>
          </div>
        </div>
      )}


      <div className="flex justify-between items-center mb-4">
        <h1 className="hidden md:block font-semibold text-xl">
          Our School Classes
        </h1>
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
              onClick={() => {/* Add single class functionality */}}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              Add Class
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading classes...</div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table columns={columns} renderRow={renderRow} data={classes || []} />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </>
      )}

      {isClassModalOpen && selectedClassId && (
        <ClassManagementModal
          schoolName={schoolId}
          onClose={handleCloseClassModal}
        />
      )}
    </div>
  );
};

export default SecondarySchoolPage;

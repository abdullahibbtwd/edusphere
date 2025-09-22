"use client"
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import { FaSort,FaFilter } from "react-icons/fa";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

// Level Type
type Level = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  classCount: number;
  subjectCount: number;
  studentCount: number;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
};

// Columns
const columns = [
  { header: "Level Name", accessor: "name" },
  { header: "Description", accessor: "description", className: "hidden md:table-cell" },
  { header: "Classes", accessor: "classCount", className: "hidden md:table-cell" },
  { header: "Subjects", accessor: "subjectCount", className: "hidden md:table-cell" },
  { header: "Students", accessor: "studentCount", className: "hidden md:table-cell" },
  { header: "Status", accessor: "status" },
  { header: "Actions", accessor: "action" },
];

// Level creation options
const levelOptions = [
  {
    type: 'JSS1-3',
    title: 'Junior Secondary (JSS1-3)',
    description: 'Create JSS1, JSS2, JSS3 levels',
    levels: ['JSS1', 'JSS2', 'JSS3']
  },
  {
    type: 'SS1-3',
    title: 'Senior Secondary (SS1-3)',
    description: 'Create SS1, SS2, SS3 levels',
    levels: ['SS1', 'SS2', 'SS3']
  },
  {
    type: 'JSS1-SS3',
    title: 'Complete School (JSS1-SS3)',
    description: 'Create all levels from JSS1 to SS3',
    levels: ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3']
  }
];

const LevelsPage = () => {
  const params = useParams();
  const schoolId = params.school as string;
  
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch levels from API
  const fetchLevels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schools/${schoolId}/levels?page=${currentPage}&limit=${itemsPerPage}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure we have the expected data structure
      setLevels(data.levels || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast.error('Failed to fetch levels');
      // Set default values on error
      setLevels([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [schoolId, currentPage, itemsPerPage]);

  useEffect(() => {
    if (schoolId && schoolId !== 'undefined' && schoolId.trim() !== '') {
      fetchLevels();
    }
  }, [schoolId, fetchLevels]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Create levels automatically
  const createLevels = async (levelType: string) => {
    try {
      setCreating(true);
      const response = await fetch(`/api/schools/${schoolId}/levels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ levelType })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create levels');
      }
      
      toast.success(data.message);
      await fetchLevels(); // Refresh the list
    } catch (error) {
      console.error('Error creating levels:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create levels');
    } finally {
      setCreating(false);
    }
  };

  // Handle level creation with confirmation
  const handleCreateLevels = (levelType: string, title: string) => {
    const option = levelOptions.find(opt => opt.type === levelType);
    if (!option) return;

    toast.custom((t) => (
      <div className="bg-bg p-6 rounded-lg shadow-lg max-w-md">
        <h3 className="text-lg font-semibold mb-2">Create {title}</h3>
        <p className="text-text mb-4">
          This will create the following levels: {option.levels.join(', ')}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-4 py-2 text-text hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t);
              createLevels(levelType);
            }}
            disabled={creating}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {creating ? 'Creating...' : 'Create Levels'}
          </button>
        </div>
      </div>
    ), {
      duration: 10000, // Keep open for 10 seconds
    });
  };

  const renderRow = (item: Level) => (
    <tr
      key={item.id}
      className="border-b table-custom border-gray-200  text-[12px] hover:bg-[#F1F0FF]"
    >
      <td className="font-semibold p-4 px-1 items-center">{item.name}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center">{item.description}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center">{item.classCount}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center">{item.subjectCount}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center">{item.studentCount}</td>
      <td className="p-4 px-1 items-center">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {item.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td>
        <div className="flex gap-2 items-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
          <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col bg-surface p-4 m-4 mt-0 flex-1">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block font-semibold text-text">All Levels</h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full ">
              <FaFilter className=""size={18}/>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full ">
              <FaSort className="" size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* Level Creation Buttons */}
      {levels && levels.length === 0 && !loading && (
        <div className="bg-bg rounded-lg shadow-sm  p-6 mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Create School Levels</h2>
          <p className="text-text mb-6">Choose the level structure for your school:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {levelOptions.map((option) => (
              <div key={option.type} className="rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-text mb-2">{option.title}</h3>
                <p className="text-sm text-text mb-3">{option.description}</p>
                <div className="text-xs text-text mb-4">
                  Levels: {option.levels.join(', ')}
                </div>
                <button
                  onClick={() => handleCreateLevels(option.type, option.title)}
                  disabled={creating}
                  className="w-full cursor-pointer bg-primary text-white py-2 px-4 rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Levels'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level List */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-text">Loading levels...</div>
        </div>
      ) : levels && levels.length > 0 ? (
        <div>
          <Table columns={columns} renderRow={renderRow} data={levels || []} />
          
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
        </div>
      ) : (
        <div className="text-center py-8 text-text">
          No levels found. Create levels using the options above.
        </div>
      )}
    </div>
  );
};

export default LevelsPage;

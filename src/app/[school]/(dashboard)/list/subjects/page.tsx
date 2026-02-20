"use client"
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import { FaEdit, FaTrash, FaChevronDown, FaChevronRight, FaBook, FaChalkboardTeacher } from "react-icons/fa";
import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import clsx from "clsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Using Radix Select
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

// Types for teacher view
type TeacherClass = {
  id: string;
  name: string;
  levelName: string;
  levelId: string;
  headTeacher: string;
  supervisorId: string | null;
  studentCount: number;
  subjectCount: number;
  subjects: { id: string; name: string; code: string }[];
  isSupervised: boolean;
};

// ... Type definitions remain the same ...
type Subject = {
  id: string;
  name: string;
  code: string;
  creditUnit: number;
  term: string;
  levelName: string;
  classes: string;
  classAssignment: string | null;
  classIds?: string[];
  teacherCount: number;
  isGeneral: boolean;
  schoolId: string;
  levelId: string;
  createdAt: string;
  updatedAt: string;
};

type Level = {
  id: string;
  name: string;
};

type Class = {
  id: string;
  name: string;
  levelId: string;
};

const columns = [
  { header: "Subject Name", accessor: "name" },
  { header: "Level", accessor: "levelName" },
  { header: "Classes", accessor: "classes" },
  { header: "Teachers", accessor: "teacherCount" },
  { header: "Actions", accessor: "action" },
];

function TeacherSubjectView({ schoolId, userId }: { schoolId: string; userId: string }) {
  const [subjectGroups, setSubjectGroups] = useState<{
    [subjectId: string]: {
      id: string;
      name: string;
      code: string;
      classes: {
        id: string;
        name: string;
        levelName: string;
        studentCount: number;
      }[];
    };
  }>({});
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/schools/${schoolId}/teachers/${userId}/my-classes?byUserId=true`);
      if (!res.ok) throw new Error("Failed to fetch assignments");
      const data = await res.json();

      setTeacherName(data.teacher?.name ?? "");

      // Group by subject
      const groups: typeof subjectGroups = {};
      const taught: TeacherClass[] = data.taughtClasses || [];

      taught.forEach(cls => {
        cls.subjects.forEach(sub => {
          if (!groups[sub.id]) {
            groups[sub.id] = {
              id: sub.id,
              name: sub.name,
              code: sub.code,
              classes: []
            };
          }
          groups[sub.id].classes.push({
            id: cls.id,
            name: cls.name,
            levelName: cls.levelName,
            studentCount: cls.studentCount
          });
        });
      });

      setSubjectGroups(groups);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your subjects");
    } finally {
      setLoading(false);
    }
  }, [schoolId, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text/60">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading your subjects…</p>
      </div>
    );
  }

  const subjects = Object.values(subjectGroups).sort((a, b) => a.name.localeCompare(b.name));

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text/60">
        <FaBook size={48} className="mb-4 text-primary/40" />
        <p className="text-lg font-semibold">No subjects assigned yet</p>
        <p className="text-sm mt-1">Contact your school admin to get subject assignments.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FaBook size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">
            {teacherName ? `${teacherName}'s Subjects` : "My Subjects"}
          </h1>
          <p className="text-sm text-text/60">
            You are teaching {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => (
          <div key={sub.id} className="bg-surface border border-muted rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FaBook size={18} />
              </div>
              <div>
                <h3 className="font-bold text-text leading-tight">{sub.name}</h3>
                <p className="text-xs text-text/50 font-mono uppercase tracking-wider">{sub.code}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-text/40 uppercase">Assigned Classes</p>
              <div className="flex flex-wrap gap-2">
                {sub.classes.map(cls => (
                  <div key={cls.id} className="px-2.5 py-1 bg-bg border border-muted rounded-lg flex items-center gap-2">
                    <span className="text-sm font-medium text-text">{cls.levelName} {cls.name}</span>
                    <span className="w-px h-3 bg-muted" />
                    <span className="text-[10px] text-text/50">{cls.studentCount} sts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SubjectsPage = () => {
  const params = useParams();
  const schoolId = params.school as string;
  const { user, role, loading: userLoading } = useUser();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Metadata for form AND filters
  const [levels, setLevels] = useState<Level[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [expandedLevels, setExpandedLevels] = useState<string[]>([]);

  // Filter State
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: '',
    subjectType: 'general' as 'general' | 'specific',
    classIds: [] as string[]
  });

  // Fetch subjects from API
  const fetchSubjects = useCallback(async () => {
    if (!schoolId || schoolId === 'undefined' || schoolId.trim() === '') return;

    try {
      setLoading(true);
      let query = `/api/schools/${schoolId}/subjects?page=${currentPage}&limit=10`;

      // Add filters if selected
      if (filterLevel && filterLevel !== 'all') {
        query += `&levelId=${filterLevel}`;
      }
      if (filterClass && filterClass !== 'all') {
        query += `&classId=${filterClass}`;
      }

      const response = await fetch(query);

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
  }, [schoolId, currentPage, filterLevel, filterClass]);


  // Fetch levels and classes for the form
  const fetchMetaData = useCallback(async () => {
    if (!schoolId) return;
    try {
      const [levelsRes, classesRes] = await Promise.all([
        fetch(`/api/schools/${schoolId}/levels`),
        fetch(`/api/schools/${schoolId}/classes?limit=1000`) // Fetch all classes
      ]);

      if (levelsRes.ok) {
        const levelsData = await levelsRes.json();

        setLevels(levelsData.levels || []);
      } else {
        console.error("Levels API failed:", levelsRes.status, levelsRes.statusText);
      }

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData.classes || []);
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  }, [schoolId]);

  // Create or Update subject
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    if (formData.subjectType === 'specific' && formData.classIds.length === 0) {
      toast.error('Please select at least one class for specific subjects');
      return;
    }

    try {
      setCreating(true);

      const url = editingSubjectId
        ? `/api/schools/${schoolId}/subjects/${editingSubjectId}`
        : `/api/schools/${schoolId}/subjects`;

      const method = editingSubjectId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          subjectType: formData.subjectType,
          classIds: formData.classIds // Sending IDs
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingSubjectId ? 'update' : 'create'} subject`);
      }

      const data = await response.json();
      toast.success(data.message || `Subject ${editingSubjectId ? 'updated' : 'created'} successfully`);

      // Reset form
      setShowCreateForm(false);
      setFormData({ name: '', subjectType: 'general', classIds: [] });
      setEditingSubjectId(null);

      await fetchSubjects(); // Refresh the list
    } catch (error) {
      console.error(`Error ${editingSubjectId ? 'updating' : 'creating'} subject:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${editingSubjectId ? 'update' : 'create'} subject`);
    } finally {
      setCreating(false);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);

    // Determine classIds to populate
    let initialClassIds: string[] = [];
    if (subject.classIds && subject.classIds.length > 0) {
      initialClassIds = subject.classIds;
    } else if (subject.classAssignment) {
      // Fallback for legacy data if API didn't return IDs (should not happen with new API)
      const classNames = subject.classAssignment.split(',').map(s => s.trim());
      // Try to find IDs from name
      initialClassIds = classes
        .filter(c => classNames.includes(c.name))
        .map(c => c.id);
    }

    setFormData({
      name: subject.name,
      subjectType: subject.isGeneral ? 'general' : 'specific',
      classIds: initialClassIds
    });
    setShowCreateForm(true);
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Fetch subjects on component mount and when page changes
  useEffect(() => {
    fetchSubjects();
    fetchMetaData();
  }, [fetchSubjects, fetchMetaData]);

  const toggleLevelExpand = (levelId: string) => {
    setExpandedLevels(prev =>
      prev.includes(levelId)
        ? prev.filter(id => id !== levelId)
        : [...prev, levelId]
    );
  };

  const toggleClassSelection = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId]
    }));
  };

  const toggleLevelSelection = (levelId: string, levelClasses: Class[]) => {
    const classIdsInLevel = levelClasses.map(c => c.id);
    const allSelected = classIdsInLevel.every(id => formData.classIds.includes(id));

    if (allSelected) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        classIds: prev.classIds.filter(id => !classIdsInLevel.includes(id))
      }));
    } else {
      // Select all
      setFormData(prev => ({
        ...prev,
        classIds: [...new Set([...prev.classIds, ...classIdsInLevel])]
      }));
    }
  };

  // Group classes by level
  const getClassesForLevel = (levelId: string) => {
    return classes.filter(c => c.levelId === levelId);
  };

  // Delete subject
  const handleDeleteSubject = async (subjectId: string, subjectName: string) => {
    toast.custom((t) => (
      <div className="bg-surface border border-muted p-6 rounded-lg shadow-lg max-w-md">
        <h3 className="text-lg font-semibold mb-2 text-text">Delete Subject</h3>
        <p className="text-text/70 mb-4">
          Are you sure you want to delete <strong>{subjectName}</strong>?
          <br />
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-4 py-2 text-text/70 hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t);
              try {
                const response = await fetch(`/api/schools/${schoolId}/subjects/${subjectId}`, {
                  method: 'DELETE',
                });

                if (!response.ok) {
                  const data = await response.json();
                  throw new Error(data.error || 'Failed to delete subject');
                }

                toast.success('Subject deleted successfully');
                await fetchSubjects();
              } catch (error) {
                console.error('Error deleting subject:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to delete subject');
              }
            }}
            className="bg-red-600 text-white py-2 px-4 rounded hover:opacity-90 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

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
            onClick={() => handleEditSubject(item)}
            className="bg-primary text-white p-2 rounded hover:opacity-90 transition-opacity cursor-pointer"
            title="Edit Subject"
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => handleDeleteSubject(item.id, item.name)}
            className="bg-red-600 text-white p-2 rounded hover:opacity-90 transition-opacity cursor-pointer"
            title="Delete Subject"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </td>
    </tr>
  );

  if (!userLoading && role === 'teacher' && user?.userId) {
    return (
      <div className="flex flex-col bg-surface p-4 m-4 mt-0 flex-1 rounded-lg shadow-sm font-inter">
        <TeacherSubjectView schoolId={schoolId} userId={user.userId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface p-4 m-4 mt-0 flex-1 rounded-lg shadow-sm">


      {/* Subject Creation Form */}
      {showCreateForm && (
        <div className="bg-surface rounded-lg shadow-sm border border-muted p-6 mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">
            {editingSubjectId ? 'Edit Subject' : 'Create New Subject'}
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Subject Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-muted rounded-md bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Mathematics, English, Physics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-3">
                Subject Scope
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="subjectType"
                    value="general"
                    checked={formData.subjectType === 'general'}
                    onChange={() => setFormData({ ...formData, subjectType: 'general' })}
                    className="w-4 h-4 text-primary focus:ring-primary border-muted bg-bg"
                  />
                  <span className="text-sm text-text">General (All Levels & Classes)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="subjectType"
                    value="specific"
                    checked={formData.subjectType === 'specific'}
                    onChange={() => setFormData({ ...formData, subjectType: 'specific' })}
                    className="w-4 h-4 text-primary focus:ring-primary border-muted bg-bg"
                  />
                  <span className="text-sm text-text">Specific (Select Level & Classes)</span>
                </label>
              </div>
            </div>

            {formData.subjectType === 'specific' && (
              <div className="border border-muted rounded-md p-4 bg-bg/50 max-h-[400px] overflow-y-auto">
                <label className="block text-sm font-medium text-text mb-2">
                  Select Classes
                </label>
                {levels.length === 0 ? (
                  <p className="text-sm text-text/60 italic">No levels found.</p>
                ) : (
                  <div className="space-y-2">
                    {levels.map((level) => {
                      const levelClasses = getClassesForLevel(level.id);
                      const isExpanded = expandedLevels.includes(level.id);

                      const classIdsInLevel = levelClasses.map(c => c.id);
                      const selectedCount = classIdsInLevel.filter(id => formData.classIds.includes(id)).length;
                      const isPartiallySelected = selectedCount > 0 && selectedCount < classIdsInLevel.length;
                      const isFullySelected = selectedCount > 0 && selectedCount === classIdsInLevel.length;

                      return (
                        <div key={level.id} className="border border-muted rounded bg-surface">
                          <div className="flex items-center p-2 gap-2">
                            <button
                              onClick={() => toggleLevelExpand(level.id)}
                              className="text-text/70 hover:text-text p-1"
                            >
                              {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                            </button>

                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="checkbox"
                                checked={isFullySelected}
                                ref={input => { if (input) input.indeterminate = isPartiallySelected; }}
                                onChange={() => toggleLevelSelection(level.id, levelClasses)}
                                className="w-4 h-4 rounded border-muted text-primary focus:ring-primary"
                              />
                              <span className="text-sm font-medium text-text">{level.name}</span>
                              <span className="text-xs text-text/60 ml-auto">
                                {selectedCount} / {levelClasses.length} selected
                              </span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="pl-9 pr-2 pb-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                              {levelClasses.length > 0 ? (
                                levelClasses.map((cls) => (
                                  <label key={cls.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded">
                                    <input
                                      type="checkbox"
                                      checked={formData.classIds.includes(cls.id)}
                                      onChange={() => toggleClassSelection(cls.id)}
                                      className="w-3 h-3 rounded border-muted text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs text-text">{cls.name}</span>
                                  </label>
                                ))
                              ) : (
                                <p className="text-xs text-text/50 py-1 col-span-3">No classes in this level</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingSubjectId(null);
                  setFormData({ name: '', subjectType: 'general', classIds: [] });
                }}
                className="px-4 py-2 text-text/70 hover:text-text transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={creating}
                className="bg-primary text-white py-2 px-4 rounded hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {creating
                  ? (editingSubjectId ? 'Updating...' : 'Creating...')
                  : (editingSubjectId ? 'Update Subject' : 'Create Subject')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="hidden md:block font-semibold text-xl">School Subjects</h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">

          {/* Level Filter */}
          <div className="w-full md:w-48">
            <Select
              value={filterLevel}
              onValueChange={(value) => {
                setFilterLevel(value);
                setFilterClass("all"); // Reset class filter when level changes
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full bg-surface border-muted text-text">
                <SelectValue placeholder="Filter by Level" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-muted text-text">
                <SelectItem value="all">All Levels</SelectItem>
                {levels.length > 0 ? (
                  levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">No levels found</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Class Filter */}
          <div className="w-full md:w-48">
            <Select
              value={filterClass}
              onValueChange={(value) => {
                setFilterClass(value);
                setCurrentPage(1);
              }}
              disabled={filterLevel === "all"} // Optional: restrict class filtering to selected level
            >
              <SelectTrigger className="w-full bg-surface border-muted text-text">
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-muted text-text">
                <SelectItem value="all">All Classes</SelectItem>
                {classes
                  .filter((c) => filterLevel === "all" || c.levelId === filterLevel)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:opacity-90 transition-colors w-full md:w-auto whitespace-nowrap"
          >
            Add Subject
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-text/70">Loading subjects...</div>
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
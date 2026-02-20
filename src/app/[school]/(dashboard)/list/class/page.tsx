"use client";
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import { useState, useCallback, useEffect } from "react";
import ClassManagementModal from "@/components/ClassManagementModel";
import { FaEdit, FaTrash, FaCog, FaChalkboardTeacher, FaStar, FaChevronDown, FaChevronUp, FaUserGraduate } from "react-icons/fa";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/UserContext";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type Level = {
  id: string;
  name: string;
  description: string;
  classCount: number;
  subjectCount: number;
};

type TeacherStudent = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  applicationNumber: string;
  profileImagePath: string | null;
};

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
  students: TeacherStudent[];
  isSupervised: boolean;
};

// ─── Teacher View ─────────────────────────────────────────────────────────────

function TeacherClassView({ schoolId, userId }: { schoolId: string; userId: string }) {
  const [taughtClasses, setTaughtClasses] = useState<TeacherClass[]>([]);
  const [supervisedOnlyClasses, setSupervisedOnlyClasses] = useState<TeacherClass[]>([]);
  const [teacherName, setTeacherName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  const fetchMyClasses = useCallback(async () => {
    if (!schoolId || !userId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/schools/${schoolId}/teachers/${userId}/my-classes?byUserId=true`
      );
      if (!res.ok) throw new Error("Failed to fetch teacher classes");
      const data = await res.json();
      setTaughtClasses(data.taughtClasses ?? []);
      setSupervisedOnlyClasses(data.supervisedOnlyClasses ?? []);
      setTeacherName(data.teacher?.name ?? "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your classes");
    } finally {
      setLoading(false);
    }
  }, [schoolId, userId]);

  useEffect(() => {
    fetchMyClasses();
  }, [fetchMyClasses]);

  const toggleExpand = (classId: string) => {
    setExpandedClassId((prev) => (prev === classId ? null : classId));
  };

  const allClasses: (TeacherClass & { section: "taught" | "supervised" })[] = [
    ...taughtClasses.map((c) => ({ ...c, section: "taught" as const })),
    ...supervisedOnlyClasses.map((c) => ({ ...c, section: "supervised" as const })),
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text/60">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading your classes…</p>
      </div>
    );
  }

  if (allClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text/60">
        <FaChalkboardTeacher size={48} className="mb-4 text-primary/40" />
        <p className="text-lg font-semibold">No classes assigned yet</p>
        <p className="text-sm mt-1">Contact your school admin to get class assignments.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FaChalkboardTeacher size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">
            {teacherName ? `${teacherName}'s Classes` : "My Classes"}
          </h1>
          <p className="text-sm text-text/60">
            {taughtClasses.length} class{taughtClasses.length !== 1 ? "es" : ""} assigned
            {supervisedOnlyClasses.length > 0 &&
              ` · ${supervisedOnlyClasses.length} supervised only`}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{taughtClasses.length}</p>
          <p className="text-xs text-text/70 mt-1">Classes Teaching</p>
        </div>
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {taughtClasses.filter((c) => c.isSupervised).length + supervisedOnlyClasses.length}
          </p>
          <p className="text-xs text-text/70 mt-1">Head Teacher Of</p>
        </div>
        <div className="bg-cta/10 border border-cta/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-cta">
            {allClasses.reduce((s, c) => s + c.studentCount, 0)}
          </p>
          <p className="text-xs text-text/70 mt-1">Total Students</p>
        </div>
        <div className="bg-accent border border-muted rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-text">
            {Array.from(new Set(taughtClasses.flatMap((c) => c.subjects.map((s) => s.id)))).length}
          </p>
          <p className="text-xs text-text/70 mt-1">Subjects Teaching</p>
        </div>
      </div>

      {/* Class cards */}
      <div className="flex flex-col gap-4">
        {allClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-surface border border-muted rounded-xl shadow-sm overflow-hidden"
          >
            {/* Card header */}
            <div
              className="flex items-start justify-between p-4 cursor-pointer hover:bg-accent/40 transition-colors"
              onClick={() => toggleExpand(cls.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Level badge */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{cls.levelName}</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-text">
                      {cls.levelName}
                      {cls.name}
                    </h2>
                    {cls.isSupervised && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success/15 border border-success/30 text-success rounded-full text-xs font-semibold">
                        <FaStar size={9} />
                        Head Teacher
                      </span>
                    )}
                    {cls.section === "supervised" && !cls.isSupervised && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success/15 border border-success/30 text-success rounded-full text-xs font-semibold">
                        <FaStar size={9} />
                        Head Teacher
                      </span>
                    )}
                  </div>

                  {/* Subjects being taught */}
                  {cls.subjects.length > 0 && (
                    <p className="text-xs text-text/60 mt-0.5">
                      Teaching:{" "}
                      <span className="font-medium text-text/80">
                        {cls.subjects.map((s) => s.name).join(", ")}
                      </span>
                    </p>
                  )}
                  {cls.subjects.length === 0 && cls.isSupervised && (
                    <p className="text-xs text-text/60 mt-0.5">Supervisor only (no subjects taught)</p>
                  )}
                </div>
              </div>

              {/* Right side stats + chevron */}
              <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                <div className="hidden sm:flex items-center gap-1 text-text/60">
                  <FaUserGraduate size={12} />
                  <span className="text-sm font-semibold text-text">{cls.studentCount}</span>
                  <span className="text-xs">students</span>
                </div>
                <div className="text-text/40">
                  {expandedClassId === cls.id ? (
                    <FaChevronUp size={14} />
                  ) : (
                    <FaChevronDown size={14} />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded student list */}
            {expandedClassId === cls.id && (
              <div className="border-t border-muted">
                {/* Head teacher info bar */}
                {!cls.isSupervised && cls.headTeacher !== "Not assigned" && (
                  <div className="px-4 py-2 bg-bg text-xs text-text/60 flex items-center gap-2">
                    <FaStar size={10} className="text-success" />
                    Head Teacher: <span className="font-medium text-text/80">{cls.headTeacher}</span>
                  </div>
                )}

                {cls.students.length === 0 ? (
                  <div className="px-4 py-6 text-center text-text/50 text-sm">
                    No students enrolled in this class yet.
                  </div>
                ) : (
                  <div className="divide-y divide-muted/50">
                    {/* Student list header */}
                    <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-text/50 uppercase bg-bg">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">Name</div>
                      <div className="col-span-3">Gender</div>
                      <div className="col-span-3">ID</div>
                    </div>

                    {cls.students.map((student, index) => (
                      <div
                        key={student.id}
                        className="grid grid-cols-12 px-4 py-2.5 items-center text-sm hover:bg-accent/30 transition-colors"
                      >
                        <div className="col-span-1 text-text/40 text-xs">{index + 1}</div>
                        <div className="col-span-5 font-medium text-text">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="col-span-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${student.gender.toLowerCase() === "male"
                              ? "bg-primary/10 text-primary"
                              : "bg-cta/10 text-cta"
                              }`}
                          >
                            {student.gender}
                          </span>
                        </div>
                        <div className="col-span-3 text-text/50 text-xs font-mono truncate">
                          {student.applicationNumber.slice(0, 8)}…
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Admin / Principal View (unchanged) ───────────────────────────────────────

const SecondarySchoolPage = () => {
  const params = useParams();
  const schoolId = params.school as string;
  const { user, role, loading: userLoading } = useUser();

  const [classes, setClasses] = useState<Class[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [creationMode, setCreationMode] = useState<'auto' | 'custom'>('auto');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedSuffixes, setSelectedSuffixes] = useState<string[]>(['A', 'B', 'C']);
  const [customClassNames, setCustomClassNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string>("");
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLevelId, setEditLevelId] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>("");



  // Fetch levels from API
  const fetchLevels = async () => {
    if (!schoolId || schoolId === 'undefined' || schoolId.trim() === '') return;

    try {
      setLoadingLevels(true);
      const response = await fetch(`/api/schools/${schoolId}/levels?page=1&limit=100`);

      if (!response.ok) {
        throw new Error('Failed to fetch levels');
      }

      const data = await response.json();
      setLevels(data.levels || []);
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast.error('Failed to fetch levels');
      setLevels([]);
    } finally {
      setLoadingLevels(false);
    }
  };

  // Fetch classes from API
  const fetchClasses = async () => {
    if (!schoolId || schoolId === 'undefined' || schoolId.trim() === '') return;

    try {
      setLoading(true);
      const url = new URL(`/api/schools/${schoolId}/classes`, window.location.origin);
      url.searchParams.set('page', currentPage.toString());
      url.searchParams.set('limit', '10');
      if (filterLevel) {
        url.searchParams.set('levelId', filterLevel);
      }

      const response = await fetch(url.toString());

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
  };

  // Create classes automatically or with custom names
  const createClasses = async () => {
    try {
      setCreating(true);

      const payload = creationMode === 'auto'
        ? {
          mode: 'auto',
          levelIds: selectedLevels,
          suffixes: selectedSuffixes
        }
        : {
          mode: 'custom',
          classes: selectedLevels.flatMap(levelId =>
            customClassNames
              .filter(name => name.trim())
              .map(name => ({
                levelId,
                name: name.trim()
              }))
          )
        };

      const response = await fetch(`/api/schools/${schoolId}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create classes');
      }

      const data = await response.json();
      toast.success(data.message || 'Classes created successfully');
      await fetchClasses();

      setSelectedLevels([]);
      if (creationMode === 'auto') {
        setSelectedSuffixes(['A', 'B', 'C']);
      } else {
        setCustomClassNames([]);
      }
    } catch (error) {
      console.error('Error creating classes:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create classes');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateClasses = () => {
    if (creationMode === 'auto') {
      if (selectedLevels.length === 0) {
        toast.error('Please select at least one level');
        return;
      }
      if (selectedSuffixes.length === 0) {
        toast.error('Please select at least one suffix');
        return;
      }

      const selectedLevelNames = levels
        .filter(l => selectedLevels.includes(l.id))
        .map(l => l.name)
        .join(', ');

      toast.custom((t) => (
        <div className="bg-surface border border-muted p-6 rounded-lg shadow-lg max-w-md">
          <h3 className="text-lg font-semibold mb-2 text-text">Create Classes</h3>
          <p className="text-text/70 mb-4">
            Creating classes for: <strong>{selectedLevelNames}</strong><br />
            Suffixes: <strong>{selectedSuffixes.join(', ')}</strong><br />
            Total classes: <strong>{selectedLevels.length * selectedSuffixes.length}</strong>
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-4 py-2 text-text/70 hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t);
                createClasses();
              }}
              disabled={creating}
              className="bg-primary text-white py-2 px-4 rounded hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating...' : 'Create Classes'}
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    } else {
      if (selectedLevels.length === 0) {
        toast.error('Please select at least one level');
        return;
      }
      const validClassNames = customClassNames.filter(name => name.trim());
      if (validClassNames.length === 0) {
        toast.error('Please add at least one class name');
        return;
      }

      const selectedLevelNames = levels
        .filter(l => selectedLevels.includes(l.id))
        .map(l => l.name)
        .join(', ');

      toast.custom((t) => (
        <div className="bg-surface border border-muted p-6 rounded-lg shadow-lg max-w-md">
          <h3 className="text-lg font-semibold mb-2 text-text">Create Custom Classes</h3>
          <p className="text-text/70 mb-4">
            Creating classes for: <strong>{selectedLevelNames}</strong><br />
            Class names: <strong>{validClassNames.join(', ')}</strong><br />
            Total classes: <strong>{selectedLevels.length * validClassNames.length}</strong>
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-4 py-2 text-text/70 hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t);
                createClasses();
              }}
              disabled={creating}
              className="bg-primary text-white py-2 px-4 rounded hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating...' : 'Create Classes'}
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    }
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

  const handleDeleteClass = async (classId: string, className: string, studentCount: number) => {
    if (studentCount > 0) {
      toast.error(`Cannot delete "${className}". This class has ${studentCount} student${studentCount > 1 ? 's' : ''} enrolled.`, {
        duration: 5000
      });
      return;
    }

    toast.custom((t) => (
      <div className="bg-surface border border-muted p-6 rounded-lg shadow-lg max-w-md">
        <h3 className="text-lg font-semibold mb-2 text-text">Delete Class</h3>
        <p className="text-text/70 mb-4">
          Are you sure you want to delete <strong>{className}</strong>?
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
                const response = await fetch(`/api/schools/${schoolId}/classes/${classId}`, {
                  method: 'DELETE',
                });

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(data.error || 'Failed to delete class');
                }

                toast.success('Class deleted successfully');
                await fetchClasses();
              } catch (error) {
                console.error('Error deleting class:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to delete class');
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

  const handleEditClass = (classItem: Class) => {
    setEditingClass(classItem);
    setEditName(classItem.name);
    setEditLevelId(classItem.levelId);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingClass) return;

    if (!editName.trim()) {
      toast.error('Class name is required');
      return;
    }

    if (!editLevelId) {
      toast.error('Please select a level');
      return;
    }

    try {
      const response = await fetch(`/api/schools/${schoolId}/classes/${editingClass.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          levelId: editLevelId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update class');
      }

      toast.success('Class updated successfully');
      setIsEditModalOpen(false);
      setEditingClass(null);
      setEditName("");
      setEditLevelId("");
      await fetchClasses();
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update class');
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, currentPage, filterLevel]);

  const filteredClasses = classes;

  const totalJSS1 = filteredClasses.filter(c => c.name.startsWith("JSS1")).reduce((sum, c) => sum + c.studentCount, 0);
  const totalJSS2 = filteredClasses.filter(c => c.name.startsWith("JSS2")).reduce((sum, c) => sum + c.studentCount, 0);
  const totalJSS3 = filteredClasses.filter(c => c.name.startsWith("JSS3")).reduce((sum, c) => sum + c.studentCount, 0);
  const totalSS1 = filteredClasses.filter(c => c.name.startsWith("SS1")).reduce((sum, c) => sum + c.studentCount, 0);
  const totalSS2 = filteredClasses.filter(c => c.name.startsWith("SS2")).reduce((sum, c) => sum + c.studentCount, 0);
  const totalSS3 = filteredClasses.filter(c => c.name.startsWith("SS3")).reduce((sum, c) => sum + c.studentCount, 0);

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
            className="bg-success text-surface p-2 rounded hover:opacity-90 transition-opacity cursor-pointer"
            title="Manage Class"
          >
            <FaCog size={14} />
          </button>
          <button
            onClick={() => handleEditClass(item)}
            className="bg-primary text-white p-2 rounded hover:opacity-90 transition-opacity cursor-pointer"
            title="Edit Class"
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => handleDeleteClass(item.id, item.name, item.studentCount)}
            className="bg-red-600 text-white p-2 rounded hover:opacity-90 transition-opacity cursor-pointer"
            title="Delete Class"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </td>
    </tr>
  );

  if (!userLoading && role === 'teacher' && user?.userId) {
    return (
      <div className="flex flex-col bg-surface p-4 m-4 mt-0 flex-1 rounded-lg shadow-sm">
        <TeacherClassView schoolId={schoolId} userId={user.userId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface p-4 m-4 mt-0 flex-1 rounded-lg shadow-sm">
      {/* Show create buttons when no classes exist OR when Add Class is clicked */}
      {(showCreateForm || (classes && classes.length === 0 && !loading)) && (
        <div className="bg-surface rounded-lg shadow-sm border border-muted p-6 mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Create School Classes</h2>

          {loadingLevels ? (
            <p className="text-text/70">Loading levels...</p>
          ) : levels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text/70 mb-4">No levels found. Please create levels first before creating classes.</p>
              <a href="../levels" className="text-primary hover:underline">Go to Levels Page</a>
            </div>
          ) : (
            <>
              {/* Mode Switcher */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setCreationMode('auto')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all font-semibold ${creationMode === 'auto'
                    ? 'border-primary bg-primary text-white'
                    : 'border-muted bg-bg text-text hover:border-muted/60'
                    }`}
                >
                  Auto Generate
                </button>
                <button
                  onClick={() => setCreationMode('custom')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all font-semibold ${creationMode === 'custom'
                    ? 'border-primary bg-primary text-white'
                    : 'border-muted bg-bg text-text hover:border-muted/60'
                    }`}
                >
                  Custom Names
                </button>
              </div>

              <p className="text-text/70 mb-6">
                {creationMode === 'auto'
                  ? 'Select levels and suffixes to auto-generate class names (e.g., JSS1A, JSS1B)'
                  : 'Select levels and enter custom class names - each name will be created for all selected levels'}
              </p>

              {creationMode === 'auto' ? (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-text mb-3">Select Levels:</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {levels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => {
                            if (selectedLevels.includes(level.id)) {
                              setSelectedLevels(selectedLevels.filter(id => id !== level.id));
                            } else {
                              setSelectedLevels([...selectedLevels, level.id]);
                            }
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${selectedLevels.includes(level.id)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-muted hover:border-muted/60 bg-bg text-text'
                            }`}
                        >
                          <p className="font-semibold">{level.name}</p>
                          {level.description && (
                            <p className="text-xs opacity-60 truncate">{level.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-text mb-3">Select Suffixes (Class Variations):</label>
                    <div className="flex flex-wrap gap-2">
                      {['A', 'B', 'C', 'D', 'E', 'F'].map((suffix) => (
                        <button
                          key={suffix}
                          onClick={() => {
                            if (selectedSuffixes.includes(suffix)) {
                              setSelectedSuffixes(selectedSuffixes.filter(s => s !== suffix));
                            } else {
                              setSelectedSuffixes([...selectedSuffixes, suffix]);
                            }
                          }}
                          className={`px-4 py-2 rounded-lg border-2 transition-all font-semibold ${selectedSuffixes.includes(suffix)
                            ? 'border-primary bg-primary text-white'
                            : 'border-muted hover:border-muted/60 bg-bg text-text'
                            }`}
                        >
                          {suffix}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted mt-2">
                      Example: Selecting JSS1 and suffixes A, B will create JSS1A and JSS1B
                    </p>
                  </div>

                  {selectedLevels.length > 0 && selectedSuffixes.length > 0 && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                      <p className="text-sm text-primary font-semibold mb-2">
                        Will create {selectedLevels.length * selectedSuffixes.length} classes:
                      </p>
                      <p className="text-xs text-primary/80">
                        {levels.filter(l => selectedLevels.includes(l.id)).map(l => l.name).join(', ')} ×
                        {selectedSuffixes.join(', ')}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleCreateClasses}
                    disabled={creating || selectedLevels.length === 0 || selectedSuffixes.length === 0}
                    className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    {creating ? 'Creating Classes...' : `Create ${selectedLevels.length * selectedSuffixes.length} Classes`}
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-text mb-3">Select Levels:</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {levels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => {
                            if (selectedLevels.includes(level.id)) {
                              setSelectedLevels(selectedLevels.filter(id => id !== level.id));
                            } else {
                              setSelectedLevels([...selectedLevels, level.id]);
                            }
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${selectedLevels.includes(level.id)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-muted hover:border-muted/60 bg-bg text-text'
                            }`}
                        >
                          <p className="font-semibold">{level.name}</p>
                          {level.description && (
                            <p className="text-xs opacity-60 truncate">{level.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedLevels.length > 0 && (
                    <>
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-text mb-3">
                          Custom Class Names (will be applied to all selected levels):
                        </label>
                        <div className="space-y-2">
                          {customClassNames.map((className, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={className}
                                onChange={(e) => {
                                  const newClassNames = [...customClassNames];
                                  newClassNames[index] = e.target.value;
                                  setCustomClassNames(newClassNames);
                                }}
                                placeholder="e.g., Alpha, Beta, Science Class"
                                className="flex-1 px-3 py-2 border border-muted rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                              <button
                                onClick={() => {
                                  setCustomClassNames(customClassNames.filter((_, i) => i !== index));
                                }}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:opacity-90"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              setCustomClassNames([...customClassNames, '']);
                            }}
                            className="w-full px-4 py-2 border-2 border-dashed border-muted rounded-lg text-text hover:border-primary hover:text-primary transition-colors"
                          >
                            + Add Class Name
                          </button>
                        </div>
                        <p className="text-xs text-text/60 mt-2">
                          Example: Enter "Alpha", "Beta" with JSS1, JSS2 selected → Creates JSS1 Alpha, JSS1 Beta, JSS2 Alpha, JSS2 Beta
                        </p>
                      </div>

                      {customClassNames.filter(n => n.trim()).length > 0 && (
                        <>
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                            <p className="text-sm text-primary font-semibold mb-2">
                              Will create {selectedLevels.length * customClassNames.filter(n => n.trim()).length} classes:
                            </p>
                            <p className="text-xs text-primary/80">
                              {levels.filter(l => selectedLevels.includes(l.id)).map(l => l.name).join(', ')} ×{' '}
                              {customClassNames.filter(n => n.trim()).join(', ')}
                            </p>
                          </div>

                          <button
                            onClick={handleCreateClasses}
                            disabled={creating || customClassNames.filter(n => n.trim()).length === 0}
                            className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                          >
                            {creating ? 'Creating Classes...' : `Create ${selectedLevels.length * customClassNames.filter(n => n.trim()).length} Classes`}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {showCreateForm && classes.length > 0 && (
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setSelectedLevels([]);
                    setSelectedSuffixes(['A', 'B', 'C']);
                    setCustomClassNames([]);
                  }}
                  className="mt-4 w-full bg-muted text-text py-2 px-4 rounded-lg hover:opacity-90 transition-colors"
                >
                  Cancel / Hide
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Stats */}
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

      {classes && classes.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="hidden md:block font-semibold text-xl">
              Our School Classes
            </h1>
            <div className="flex items-center gap-4">
              <Select
                value={filterLevel === "" ? "all" : filterLevel}
                onValueChange={(value) => {
                  setFilterLevel(value === "all" ? "" : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px] bg-bg border-muted text-text">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-primary text-white px-4 py-2 rounded text-sm hover:opacity-90 cursor-pointer"
              >
                Add Class
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-text/70">Loading classes...</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table columns={columns} renderRow={renderRow} data={filteredClasses || []} />
              </div>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              )}
            </>
          )}
        </>
      )}

      {isClassModalOpen && selectedClassId && (
        <ClassManagementModal
          schoolId={schoolId}
          classId={selectedClassId}
          className={selectedClassName}
          onClose={handleCloseClassModal}
          onRefresh={fetchClasses}
        />
      )}

      {isEditModalOpen && editingClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-muted rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-text">Edit Class</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Class Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-muted rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Alpha, Science Class"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Level
                </label>
                <select
                  value={editLevelId}
                  onChange={(e) => setEditLevelId(e.target.value)}
                  className="w-full px-3 py-2 border border-muted rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Level</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-muted/20 border border-muted/40 rounded p-3">
                <p className="text-xs text-text/70">
                  <strong>Current:</strong> {editingClass.name} ({editingClass.levelName})
                </p>
                <p className="text-xs text-text/70 mt-1">
                  <strong>Students:</strong> {editingClass.studentCount}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingClass(null);
                  setEditName("");
                  setEditLevelId("");
                }}
                className="px-4 py-2 text-text/70 hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-primary text-white py-2 px-4 rounded hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecondarySchoolPage;

"use client"
import Pagination from "@/components/pagination";
import Table from "@/components/Table";
import { FaGraduationCap, FaPlus, FaTimes, FaBookOpen, FaSchool, FaEdit, FaTrash } from "react-icons/fa";
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

// Custom Level Input Type
type CustomLevel = {
  name: string;
  description: string;
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

// Enhanced Level creation options with icons and colors
const levelOptions = [
  {
    type: 'JSS1-3',
    title: 'Junior Secondary',
    subtitle: 'JSS1 - JSS3',
    description: 'Perfect for junior secondary schools',
    levels: ['JSS1', 'JSS2', 'JSS3'],
    icon: FaBookOpen,
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    iconBg: 'bg-primary',
    iconColor: 'text-white'
  },
  {
    type: 'SS1-3',
    title: 'Senior Secondary',
    subtitle: 'SS1 - SS3',
    description: 'Ideal for senior secondary schools',
    levels: ['SS1', 'SS2', 'SS3'],
    icon: FaGraduationCap,
    bgColor: 'bg-primary-400/10',
    borderColor: 'border-primary-400/30',
    iconBg: 'bg-primary-400',
    iconColor: 'text-white'
  },
  {
    type: 'JSS1-SS3',
    title: 'Complete School',
    subtitle: 'JSS1 - SS3',
    description: 'Full secondary education structure',
    levels: ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'],
    icon: FaSchool,
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    iconBg: 'bg-success',
    iconColor: 'text-white'
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
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showCreationOptions, setShowCreationOptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [editLevelName, setEditLevelName] = useState('');
  const [editLevelDescription, setEditLevelDescription] = useState('');
  const [customLevels, setCustomLevels] = useState<CustomLevel[]>([
    { name: '', description: '' }
  ]);
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
  const createLevels = async (levelType: string, customLevelData?: CustomLevel[]) => {
    try {
      setCreating(true);
      const response = await fetch(`/api/schools/${schoolId}/levels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          levelType,
          customLevels: customLevelData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create levels');
      }

      toast.success(data.message);
      await fetchLevels(); // Refresh the list
      setShowCustomModal(false);
      setShowCreationOptions(false); // Close creation options panel
      setCustomLevels([{ name: '', description: '' }]); // Reset custom levels
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
      <div className="bg-surface border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-2xl max-w-md">
        <h3 className="text-lg font-bold text-text mb-2">Create {title}?</h3>
        <p className="text-text/70 mb-4">
          This will create the following levels: <span className="font-semibold text-primary">{option.levels.join(', ')}</span>
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-5 py-2 text-text/70 hover:text-text hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t);
              createLevels(levelType);
            }}
            disabled={creating}
            className="px-5 py-2 bg-primary text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 font-medium cursor-pointer"
          >
            {creating ? 'Creating...' : 'Create Levels'}
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
    });
  };

  // Add custom level
  const addCustomLevel = () => {
    setCustomLevels([...customLevels, { name: '', description: '' }]);
  };

  // Remove custom level
  const removeCustomLevel = (index: number) => {
    if (customLevels.length > 1) {
      setCustomLevels(customLevels.filter((_, i) => i !== index));
    }
  };

  // Update custom level
  const updateCustomLevel = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...customLevels];
    updated[index][field] = value;
    setCustomLevels(updated);
  };

  // Handle custom level creation
  const handleCustomLevelsSubmit = () => {
    // Validate
    const validLevels = customLevels.filter(level => level.name.trim() !== '');

    if (validLevels.length === 0) {
      toast.error('Please add at least one level with a name');
      return;
    }

    createLevels('CUSTOM', validLevels);
  };

  // Handle edit level
  const handleEditLevel = (level: Level) => {
    setEditingLevel(level);
    setEditLevelName(level.name);
    setEditLevelDescription(level.description || '');
    setShowEditModal(true);
  };

  // Submit edit
  const handleEditSubmit = async () => {
    if (!editingLevel || !editLevelName.trim()) {
      toast.error('Level name is required');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch(`/api/schools/${schoolId}/levels/${editingLevel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editLevelName.trim(),
          description: editLevelDescription.trim(),
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update level');
      }

      toast.success('Level updated successfully');
      await fetchLevels();
      setShowEditModal(false);
      setEditingLevel(null);
    } catch (error) {
      console.error('Error updating level:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update level');
    } finally {
      setCreating(false);
    }
  };

  // Handle delete level
  const handleDeleteLevel = (level: Level) => {
    toast.custom((t) => (
      <div className="bg-surface border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-2xl max-w-md">
        <h3 className="text-lg font-bold text-text mb-2">Delete {level.name}?</h3>
        <p className="text-text/70 mb-4">
          This action cannot be undone. {level.classCount > 0 || level.subjectCount > 0 ? (
            <span className="text-red-600 dark:text-red-400 font-semibold">
              This level has {level.classCount} class(es) and {level.subjectCount} subject(s).
            </span>
          ) : null}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-5 py-2 text-text/70 hover:text-text hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t);
              try {
                setCreating(true);
                const response = await fetch(`/api/schools/${schoolId}/levels/${level.id}`, {
                  method: 'DELETE',
                });

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(data.error || 'Failed to delete level');
                }

                toast.success(data.message);
                await fetchLevels();
              } catch (error) {
                console.error('Error deleting level:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to delete level');
              } finally {
                setCreating(false);
              }
            }}
            disabled={creating}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 font-medium cursor-pointer"
          >
            {creating ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
    });
  };

  const renderRow = (item: Level) => (
    <tr
      key={item.id}
      className="border-b table-custom border-gray-200 dark:border-gray-700 text-[12px] hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-colors duration-150"
    >
      <td className="font-semibold p-4 px-1 items-center text-text">{item.name}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center text-text/70">{item.description}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center text-text">{item.classCount}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center text-text">{item.subjectCount}</td>
      <td className="hidden md:table-cell p-4 px-1 items-center text-text">{item.studentCount}</td>
      <td className="p-4 px-1 items-center">
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${item.isActive
          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
          }`}>
          {item.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handleEditLevel(item)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
            title="Edit"
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => handleDeleteLevel(item)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            title="Delete"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col bg-surface p-4 m-4 mt-0 flex-1 rounded-xl">
      {/* Top Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-2xl text-text">School Levels</h1>
        <div className="flex items-center gap-2">
          {/* Add More Levels Button - Shows when levels exist */}
          {levels && levels.length > 0 && !loading && (
            <button
              onClick={() => setShowCreationOptions(!showCreationOptions)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-sm cursor-pointer"
              title="Add More Levels"
            >
              <FaPlus size={16} />
              <span>Add Levels</span>
            </button>
          )}
        </div>
      </div>

      {/* Level Creation Options */}
      {((levels && levels.length === 0 && !loading) || showCreationOptions) && (
        <div className="bg-bg rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text mb-2">Create Your School Levels</h2>
            <p className="text-text/70 text-sm">Choose a preset structure or create custom levels tailored to your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Preset Options */}
            {levelOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.type}
                  className={`group relative ${option.bgColor} ${option.borderColor} border-2 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer`}
                  onClick={() => handleCreateLevels(option.type, option.title)}
                >
                  {/* Icon */}
                  <div className="mb-4">
                    <div className={`w-14 h-14 rounded-xl ${option.iconBg} flex items-center justify-center shadow-lg`}>
                      <Icon className={option.iconColor} size={24} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-lg text-text mb-1">{option.title}</h3>
                  <p className={`text-sm font-medium ${option.iconColor} mb-2`}>{option.subtitle}</p>
                  <p className="text-xs text-text/60 mb-4">{option.description}</p>

                  {/* Levels Preview */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {option.levels.slice(0, 3).map((level, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-text/70 font-medium"
                      >
                        {level}
                      </span>
                    ))}
                    {option.levels.length > 3 && (
                      <span className="text-[10px] px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-text/70 font-medium">
                        +{option.levels.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Button */}
                  <button
                    disabled={creating}
                    className={`w-full ${option.iconBg} ${option.iconColor} py-2.5 px-4 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all duration-200 text-sm cursor-pointer`}
                  >
                    {creating ? 'Creating...' : 'Create Levels'}
                  </button>
                </div>
              );
            })}

            {/* Custom Option */}
            <div
              className="group relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => setShowCustomModal(true)}
            >
              {/* Icon */}
              <div className="mb-4">
                <div className="w-14 h-14 rounded-xl bg-cta flex items-center justify-center shadow-lg">
                  <FaPlus className="text-white" size={24} />
                </div>
              </div>

              {/* Content */}
              <h3 className="font-bold text-lg text-text mb-1">Custom Levels</h3>
              <p className="text-sm font-medium text-cta mb-2">Fully Customizable</p>
              <p className="text-xs text-text/60 mb-4">Create your own level structure with custom names</p>

              {/* Feature List */}
              <div className="flex flex-wrap gap-1 mb-4">
                <span className="text-[10px] px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-text/70 font-medium">
                  Unlimited
                </span>
                <span className="text-[10px] px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-text/70 font-medium">
                  Flexible
                </span>
              </div>

              {/* Button */}
              <button
                className="w-full bg-cta text-white py-2.5 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 text-sm cursor-pointer"
              >
                Customize
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
              💡 <span className="font-semibold">Tip:</span> You can always add more levels later or modify existing ones
            </p>
          </div>
        </div>
      )}

      {/* Custom Level Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-cta">
              <div>
                <h2 className="text-2xl font-bold text-white">Create Custom Levels</h2>
                <p className="text-white/80 text-sm mt-1">Add as many levels as you need for your school</p>
              </div>
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setCustomLevels([{ name: '', description: '' }]);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-4">
                {customLevels.map((level, index) => (
                  <div
                    key={index}
                    className="bg-bg p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-text mb-2">
                            Level Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Year 1, Grade 1, Nursery"
                            value={level.name}
                            onChange={(e) => updateCustomLevel(index, 'name', e.target.value)}
                            className="w-full px-4 py-2.5 bg-surface border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary focus:outline-none text-text placeholder-text/40 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-text mb-2">
                            Description <span className="text-text/40">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., First year of study"
                            value={level.description}
                            onChange={(e) => updateCustomLevel(index, 'description', e.target.value)}
                            className="w-full px-4 py-2.5 bg-surface border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary focus:outline-none text-text placeholder-text/40 transition-colors"
                          />
                        </div>
                      </div>
                      {customLevels.length > 1 && (
                        <button
                          onClick={() => removeCustomLevel(index)}
                          className="mt-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-lg transition-colors cursor-pointer"
                          title="Remove level"
                        >
                          <FaTimes size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Level Button */}
              <button
                onClick={addCustomLevel}
                className="mt-4 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-text/60 hover:text-primary hover:border-primary transition-all duration-200 flex items-center justify-center gap-2 font-medium cursor-pointer"
              >
                <FaPlus size={16} />
                Add Another Level
              </button>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-bg">
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setCustomLevels([{ name: '', description: '' }]);
                }}
                className="px-6 py-2.5 text-text hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomLevelsSubmit}
                disabled={creating}
                className="px-6 py-2.5 bg-cta text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 font-semibold cursor-pointer"
              >
                {creating ? 'Creating...' : `Create ${customLevels.filter(l => l.name.trim()).length} Level(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level List */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <div className="text-text font-medium">Loading levels...</div>
        </div>
      ) : levels && levels.length > 0 ? (
        <div className="bg-bg rounded-xl shadow-sm p-4 overflow-hidden">
          <Table columns={columns} renderRow={renderRow} data={levels || []} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-text/60">
          <FaGraduationCap className="mx-auto mb-4 text-text/30" size={48} />
          <p className="font-medium">No levels found</p>
          <p className="text-sm mt-1">Create levels using the options above to get started</p>
        </div>
      )}

      {/* Edit Level Modal */}
      {showEditModal && editingLevel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-primary">
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Level</h2>
                <p className="text-white/80 text-sm mt-1">Update level information</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Level Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., JSS1, SS2"
                    value={editLevelName}
                    onChange={(e) => setEditLevelName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-bg border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary focus:outline-none text-text placeholder-text/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Description <span className="text-text/40">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Junior Secondary School Year 1"
                    value={editLevelDescription}
                    onChange={(e) => setEditLevelDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-bg border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary focus:outline-none text-text placeholder-text/40 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-bg">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2.5 text-text hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={creating}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 font-semibold cursor-pointer"
              >
                {creating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelsPage;

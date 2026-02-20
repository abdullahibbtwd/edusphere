// components/ClassManagementModal.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FiUser, FiCheck, FiX, FiSettings, FiLoader, FiAlertCircle } from "react-icons/fi";
import { toast } from "sonner";

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface ClassManagementModalProps {
  schoolId: string;
  classId: string;
  className: string;
  onClose: () => void;
  onRefresh: () => void;
}

const ClassManagementModal: React.FC<ClassManagementModalProps> = ({
  schoolId,
  classId,
  className,
  onClose,
  onRefresh,
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClassDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/classes/${classId}`);
      if (!response.ok) throw new Error("Failed to fetch class details");
      const data = await response.json();
      if (data.class?.supervisorId) {
        setSelectedTeacherId(data.class.supervisorId);
      }
    } catch (err) {
      console.error("Error fetching class details:", err);
    }
  }, [schoolId, classId]);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schools/${schoolId}/teachers?limit=100`);
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("Could not load teachers list. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    Promise.all([fetchClassDetails(), fetchTeachers()]);
  }, [fetchClassDetails, fetchTeachers]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/schools/${schoolId}/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supervisorId: selectedTeacherId || null }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save assignment");
      }

      toast.success("Head teacher assigned successfully");
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Error saving assignment:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-muted overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-primary p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <FiSettings size={20} />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight">Class Management</h2>
          </div>
          <p className="text-white/80 font-medium">Assigning Head Teacher for <span className="text-white font-bold">{className}</span></p>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-text/60 gap-4">
              <FiLoader className="animate-spin text-primary" size={40} />
              <p className="font-medium">Loading school teachers...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-500 gap-4 text-center">
              <FiAlertCircle size={40} />
              <p className="font-medium">{error}</p>
              <button
                onClick={fetchTeachers}
                className="text-primary hover:underline font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text/60 uppercase tracking-wider flex items-center gap-2">
                  <FiUser className="text-primary" />
                  Select Class Supervisor
                </label>
                <div className="relative group">
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full bg-bg border-2 border-muted rounded-xl px-4 py-3.5 text-text focus:border-primary focus:ring-0 transition-all appearance-none cursor-pointer font-medium"
                  >
                    <option value="">-- No Teacher Assigned --</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text/40 group-focus-within:text-primary transition-colors">
                    <FiSettings size={16} className="rotate-90" />
                  </div>
                </div>
                <p className="text-xs text-text/40 italic">
                  The Class Supervisor (Head Teacher) will have administrative oversight of this class.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 rounded-xl border-2 border-muted text-text font-bold hover:bg-muted/30 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-primary text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {saving ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassManagementModal;

"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { FiPlus, FiX, FiLoader, FiMessageCircle } from "react-icons/fi";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  targetRoles: string[];
  createdBy: string | null;
  createdAt: string;
}

function targetLabel(roles: string[]): string {
  if (roles.includes("STUDENT") && roles.includes("TEACHER")) return "All";
  if (roles.includes("TEACHER")) return "Teachers";
  return "Students";
}

export default function AnnouncementsPage() {
  const params = useParams();
  const schoolId = params.school as string;
  const { role } = useUser();

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRoles, setTargetRoles] = useState<"both" | "student" | "teacher">("both");

  const isAdmin = role === "admin";

  const fetchAnnouncements = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const url =
        role === "admin"
          ? `/api/schools/${schoolId}/announcements`
          : `/api/schools/${schoolId}/announcements?viewerRole=${role || "student"}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.announcements) {
        setAnnouncements(data.announcements);
      } else {
        toast.error(data.error || "Failed to load announcements");
      }
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [schoolId, role]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill title and content");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/schools/${schoolId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), targetRoles }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create announcement");
        return;
      }
      toast.success("Announcement created");
      setOpen(false);
      setTitle("");
      setContent("");
      setTargetRoles("both");
      fetchAnnouncements();
    } catch {
      toast.error("Failed to create announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    if (!submitting) setOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col bg-surface p-4 sm:p-6 m-4 mt-0 flex-1 rounded-2xl shadow-sm items-center justify-center min-h-[280px] gap-3 ring-1 ring-black/5 dark:ring-white/5">
        <FiLoader className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface p-4 sm:p-6 m-4 mt-0 flex-1 rounded-2xl shadow-sm gap-5 sm:gap-6 font-poppins text-text min-w-0 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">Announcements</h1>
          <p className="text-xs text-muted mt-0.5">
            {announcements.length > 0
              ? `${announcements.length} announcement${announcements.length === 1 ? "" : "s"}`
              : "School notices and updates"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            New Announcement
          </button>
        )}
      </header>

      <section className="rounded-2xl bg-muted/10 p-4 sm:p-5 ring-1 ring-black/5 dark:ring-white/5 min-w-0">
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] py-10 text-center rounded-xl bg-muted/15">
            <FiMessageCircle className="w-10 h-10 text-muted/70 mb-2" />
            <p className="text-sm font-medium text-text mb-0.5">No announcements yet</p>
            <p className="text-xs text-muted max-w-xs">
              {isAdmin
                ? "Create an announcement to show it here."
                : "Announcements will appear here when the school posts them."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:gap-4">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="p-4 sm:p-5 rounded-2xl bg-surface shadow-sm hover:shadow-md transition-shadow ring-1 ring-black/5 dark:ring-white/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h2 className="text-base font-semibold text-text">{a.title}</h2>
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium shrink-0">
                    {targetLabel(a.targetRoles)}
                  </span>
                </div>
                <p className="text-sm text-text/90 mb-2">{a.content}</p>
                <p className="text-xs text-muted">
                  {a.createdBy ? `Posted by ${a.createdBy}` : "Posted"} on{" "}
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden ring-1 ring-black/10 dark:ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h2 className="text-lg font-semibold text-text">Create new announcement</h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="p-2 rounded-lg text-muted hover:text-text hover:bg-muted/50 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Announcement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-bg border border-border text-text text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Content</label>
                <textarea
                  placeholder="Write your announcement..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-2">Target audience</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "both" as const, label: "All" },
                    { value: "student" as const, label: "Students" },
                    { value: "teacher" as const, label: "Teachers" },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 text-sm text-text cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="targetRoles"
                        value={value}
                        checked={targetRoles === value}
                        onChange={() => setTargetRoles(value)}
                        className="rounded-full border-border text-primary focus:ring-primary/50"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-border/50 bg-muted/10">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="h-9 px-4 rounded-lg border border-border bg-surface text-text text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={submitting || !title.trim() || !content.trim()}
                className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

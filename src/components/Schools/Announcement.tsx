"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { FiLoader, FiMessageCircle } from "react-icons/fi";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const Announcement = () => {
  const router = useRouter();
  const params = useParams();
  const { role } = useUser();
  const schoolId = params?.school as string;

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Keep role in a ref so the fetch callback doesn't need it as a dependency.
  // Without this, role changing null→"student" on mount triggers a second
  // identical fetch even though the resulting URL is the same.
  const roleRef = useRef(role);
  useEffect(() => { roleRef.current = role; }, [role]);

  const fetchAnnouncements = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const currentRole = roleRef.current;
      const viewerRole = currentRole === "admin" ? "" : (currentRole || "student");
      const url = viewerRole
        ? `/api/schools/${schoolId}/announcements?viewerRole=${viewerRole}`
        : `/api/schools/${schoolId}/announcements`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.announcements) {
        setAnnouncements(data.announcements);
      }
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId]); // role is accessed via ref — no re-fetch on role transitions

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleViewAll = () => {
    router.push(`/${schoolId}/list/announcements`);
  };

  return (
    <div className="bg-surface/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 sm:p-5 min-w-0 ring-1 ring-black/5 dark:ring-white/5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-sm font-semibold text-text">Announcements</h2>
        <button
          type="button"
          onClick={handleViewAll}
          className="text-xs font-medium text-primary hover:underline focus:outline-none"
        >
          View all
        </button>
      </div>
      <div className="flex flex-col gap-2.5">
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted">
            <FiLoader className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl bg-muted/20">
            <FiMessageCircle className="w-7 h-7 text-muted/70 mb-1.5" />
            <p className="text-xs text-muted">No announcements yet</p>
          </div>
        ) : (
          announcements.slice(0, 3).map((announcement) => (
            <button
              type="button"
              key={announcement.id}
              className="text-left rounded-xl p-3 sm:p-3.5 bg-muted/20 hover:bg-muted/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              onClick={handleViewAll}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-sm font-medium text-text truncate">
                  {announcement.title}
                </h3>
                <span className="text-[10px] sm:text-xs text-muted shrink-0">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-muted line-clamp-2 leading-relaxed">{announcement.content}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcement;

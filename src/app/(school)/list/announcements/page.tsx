"use client";

import { useState } from "react";

export default function AnnouncementsPage() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRoles, setTargetRoles] = useState("both");

  // Dummy current user (admin toggle)
  const currentUser = { name: "Admin User", role: "admin" };
  const isAdmin = currentUser.role === "admin";

  // Dummy announcements
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Welcome Back!",
      content: "We’re excited to start the new term. Please check your timetable.",
      targetRoles: ["student"],
      createdBy: { name: "Principal" },
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Teachers Meeting",
      content: "There will be a staff meeting this Friday at 2 PM.",
      targetRoles: ["teacher"],
      createdBy: { name: "Admin User" },
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleCreateAnnouncement = () => {
    const newAnnouncement = {
      id: Date.now(),
      title,
      content,
      targetRoles: [targetRoles],
      createdBy: { name: currentUser.name },
      createdAt: new Date().toISOString(),
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setOpen(false);
    setTitle("");
    setContent("");
    setTargetRoles("both");
  };

  return (
    <div className="p-6 bg-bg min-h-screen font-poppins">
      {/* Header */}
      <div className="bg-surface p-4 mb-6 rounded-2xl flex justify-between items-center shadow">
        <h1 className="text-xl font-semibold text-text">Announcements</h1>
        {isAdmin && (
          <button
            onClick={() => setOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-400 transition"
          >
            + New Announcement
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="bg-surface p-4 rounded-2xl shadow hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold text-text">{a.title}</h2>
              <span className="px-3 py-1 text-xs rounded-lg bg-primary text-white">
                {a.targetRoles[0] === "both"
                  ? "All Users"
                  : a.targetRoles[0] === "student"
                  ? "Students"
                  : "Teachers"}
              </span>
            </div>
            <p className="text-muted mb-3">{a.content}</p>
            <p className="text-xs text-muted">
              Posted by {a.createdBy?.name} on{" "}
              {new Date(a.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text">
                Create New Announcement
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-text"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-3 p-2 rounded-lg border border-muted bg-bg text-text"
            />

            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full mb-3 p-2 rounded-lg border border-muted bg-bg text-text"
              rows={4}
            />

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-text">
                Target Audience
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-text">
                  <input
                    type="radio"
                    value="both"
                    checked={targetRoles === "both"}
                    onChange={(e) => setTargetRoles(e.target.value)}
                  />
                  All Users
                </label>
                <label className="flex items-center gap-2 text-sm text-text">
                  <input
                    type="radio"
                    value="student"
                    checked={targetRoles === "student"}
                    onChange={(e) => setTargetRoles(e.target.value)}
                  />
                  Students
                </label>
                <label className="flex items-center gap-2 text-sm text-text">
                  <input
                    type="radio"
                    value="teacher"
                    checked={targetRoles === "teacher"}
                    onChange={(e) => setTargetRoles(e.target.value)}
                  />
                  Teachers
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg bg-muted text-text"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                disabled={!title || !content}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-400 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

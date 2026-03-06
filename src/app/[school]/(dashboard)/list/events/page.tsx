"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import {
  FiCalendar,
  FiPlus,
  FiX,
  FiClock,
  FiLoader,
} from "react-icons/fi";

interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EventsPage() {
  const params = useParams();
  const schoolId = params.school as string;
  const { role } = useUser();

  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("14:00");

  const isAdmin = role === "admin";

  const fetchEvents = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/schools/${schoolId}/events`);
      const data = await res.json();
      if (res.ok && data.events) {
        setEvents(data.events);
      } else {
        toast.error(data.error || "Failed to load events");
      }
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreateEvent = async () => {
    if (!title.trim() || !description.trim() || !date || !startTime || !endTime) {
      toast.error("Please fill title, description, date, and time range");
      return;
    }
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    if (end <= start) {
      toast.error("End time must be after start time");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/schools/${schoolId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          date,
          startTime,
          endTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create event");
        return;
      }
      toast.success("Event added");
      setOpen(false);
      setTitle("");
      setDescription("");
      setDate("");
      setStartTime("09:00");
      setEndTime("14:00");
      fetchEvents();
    } catch {
      toast.error("Failed to create event");
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
        <p className="text-sm text-muted">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface p-4 sm:p-6 m-4 mt-0 flex-1 rounded-2xl shadow-sm gap-5 sm:gap-6 font-poppins text-text ring-1 ring-black/5 dark:ring-white/5 overflow-hidden">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">Events</h1>
          <p className="text-xs text-muted mt-0.5">
            {events.length > 0
              ? `${events.length} event${events.length === 1 ? "" : "s"}`
              : "School events and announcements"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            New Event
          </button>
        )}
      </header>

      {/* Events list */}
      <section className="rounded-2xl bg-muted/10 p-4 sm:p-5 ring-1 ring-black/5 dark:ring-white/5">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] py-10 text-center rounded-xl bg-muted/15">
            <FiCalendar className="w-10 h-10 text-muted/70 mb-2" />
            <p className="text-sm font-medium text-text mb-0.5">No events yet</p>
            <p className="text-xs text-muted max-w-xs">
              {isAdmin
                ? "Add an event (e.g. Inter-House Sports, Cultural Day) to show it here."
                : "Events will appear here when the school adds them."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:gap-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="p-4 sm:p-5 rounded-2xl bg-surface shadow-sm hover:shadow-md transition-shadow ring-1 ring-black/5 dark:ring-white/5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-text mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted flex items-center gap-1.5">
                      <FiCalendar className="w-3.5 h-3.5 shrink-0" />
                      {formatEventDate(event.date)}
                    </p>
                    <p className="text-sm text-muted flex items-center gap-1.5 mt-0.5">
                      <FiClock className="w-3.5 h-3.5 shrink-0" />
                      {event.startTime} – {event.endTime}
                    </p>
                    <p className="mt-2 text-sm text-text/90">
                      {event.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create event modal (admin only) */}
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
              <h2 className="text-lg font-semibold text-text">
                Add new event
              </h2>
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
                <label className="block text-xs font-medium text-muted mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inter-House Sports, Cultural Day"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-bg border border-border text-text text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of the event"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    Start time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    End time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
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
                onClick={handleCreateEvent}
                disabled={
                  submitting ||
                  !title.trim() ||
                  !description.trim() ||
                  !date ||
                  !startTime ||
                  !endTime
                }
                className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Adding…
                  </>
                ) : (
                  "Add event"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

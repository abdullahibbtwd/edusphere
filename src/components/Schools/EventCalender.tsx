"use client";

import { useState, useCallback, useEffect } from "react";
import Calendar from "react-calendar";
import { useRouter, useParams } from "next/navigation";
import "react-calendar/dist/Calendar.css";
import { FiLoader } from "react-icons/fi";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
}

const EventCalendar = () => {
  const router = useRouter();
  const params = useParams();
  const schoolId = params?.school as string;

  const [value, onChange] = useState<Value>(new Date());
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/schools/${schoolId}/events`);
      const data = await res.json();
      if (res.ok && data.events) setEvents(data.events);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Get all dates that have events (for calendar tiles)
  const eventDates = events.map((e) => {
    const [y, m, d] = e.date.split("-").map(Number);
    return new Date(y, m - 1, d);
  });

  const selectedDate = value instanceof Date ? value.toISOString().split("T")[0] : "";
  const eventsForSelectedDate = events.filter((e) => e.date === selectedDate);
  // Show events for selected date if any, otherwise show upcoming events (sorted by date)
  const eventsToShow =
    eventsForSelectedDate.length > 0
      ? eventsForSelectedDate
      : [...events].sort((a, b) => a.date.localeCompare(b.date));
  const displayEvents = eventsToShow.slice(0, 8);

  const handleEventClick = () => {
    router.push(`/${schoolId}/list/events`);
  };

  return (
    <div className="bg-surface/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 sm:p-5 ring-1 ring-black/5 dark:ring-white/5">
      <style jsx global>{`
        .react-calendar { border: none; width: 100%; background: transparent; color: inherit; border-radius: 0.75rem; padding: 4px; }
        .dark .react-calendar { color: #e5e7eb; }
        .react-calendar__tile { border-radius: 8px; padding: 6px; }
        .react-calendar__tile--now { background: #dbeafe !important; color: #1d4ed8 !important; }
        .dark .react-calendar__tile--now { background: rgba(59, 130, 246, 0.25) !important; color: #93c5fd !important; }
        .react-calendar__tile--active { background: #3b82f6 !important; color: white !important; }
        .dark .react-calendar__tile--active { background: #2563eb !important; color: white !important; }
        .react-calendar__tile--hasEvent { background: #edf2f7 !important; }
        .react-calendar__tile--hasEvent:hover { background: #e2e8f0 !important; }
        .react-calendar__tile--hasEvent abbr { color: #16a34a; font-weight: 600; }
        .dark .react-calendar__tile--hasEvent { background: rgba(34, 197, 94, 0.15) !important; }
        .dark .react-calendar__tile--hasEvent abbr { color: #4ade80; }
      `}</style>

      <Calendar
        onChange={onChange}
        value={value}
        tileClassName={({ date }) => {
          return eventDates.some(
            (eventDate) =>
              eventDate.getDate() === date.getDate() &&
              eventDate.getMonth() === date.getMonth() &&
              eventDate.getFullYear() === date.getFullYear()
          )
            ? "react-calendar__tile--hasEvent"
            : null;
        }}
      />

      <div className="flex items-center justify-between mt-4 mb-3">
        <h2 className="text-sm font-semibold text-text">Upcoming Events</h2>
        <button
          type="button"
          onClick={handleEventClick}
          className="text-xs font-medium text-primary hover:underline focus:outline-none"
        >
          View all
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted">
            <FiLoader className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading events...</span>
          </div>
        ) : events.length > 0 ? (
          displayEvents.map((event) => (
            <button
              type="button"
              className="text-left rounded-xl p-3 sm:p-3.5 bg-muted/20 hover:bg-muted/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              key={event.id}
              onClick={handleEventClick}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <h3 className="text-sm font-medium text-text truncate">
                  {event.title}
                </h3>
                <span className="text-[10px] sm:text-xs text-muted shrink-0">
                  {event.date} | {event.startTime} – {event.endTime}
                </span>
              </div>
              <p className="text-xs text-text/80 line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            </button>
          ))
        ) : (
          <div className="rounded-xl bg-muted/20 py-8 text-center">
            <p className="text-xs text-muted">No events scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;

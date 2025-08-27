"use client";

import { useState } from "react";
import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

// Define event type
interface TimetableEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: string;
}

const TeacherCalendar = () => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  // 🔹 Dummy timetable events
  const events: TimetableEvent[] = [
    {
      id: "1",
      title: "Mathematics",
      start: new Date(2025, 7, 25, 9, 0),
      end: new Date(2025, 7, 25, 11, 0),
      resource: "SS1A",
    },
    {
      id: "2",
      title: "English",
      start: new Date(2025, 7, 26, 12, 0),
      end: new Date(2025, 7, 26, 14, 0),
      resource: "SS2B",
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-[120vh] p-4 bg-surface rounded-2xl shadow-md font-poppins">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text">My Schedule</h2>
        <p className="text-sm text-muted">Teacher Name</p>
      </div>

      {/* Calendar */}
      <div className="flex-1">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={["work_week", "day"]}
          view={view}
          style={{ height: "100%" }}
          onView={(v) => setView(v)}
          min={new Date(2025, 0, 1, 8, 0, 0)} // 8 AM
          max={new Date(2025, 0, 1, 17, 0, 0)} // 5 PM
          components={{
            event: ({ event }) => (
              <div className="p-1 h-full flex flex-col justify-center ">
                <span className="text-xs text-white">
                  {event.title}
                </span>
                <span className="text-xs text-white">
                  Class: {event.resource}
                </span>
              </div>
            ),
          }}
          eventPropGetter={() => ({
            className:
              "bg-primary text-white rounded-md text-sm px-1 hover:bg-primary-400 transition-colors",
          })}
        />
      </div>
    </div>
  );
};

export default TeacherCalendar;

"use client"

import Image from "next/image";
import { useState } from "react";
import Calendar from "react-calendar";
import { useRouter } from "next/navigation";
import 'react-calendar/dist/Calendar.css';

// Types

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

// Dummy Events Data
const dummyEvents = [
  {
    _id: "1",
    title: "Orientation Day",
    date: "2025-08-20",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    description: "Welcome event for new students.",
  },
  {
    _id: "2",
    title: "Sports Day",
    date: "2025-08-22",
    startTime: "10:00 AM",
    endTime: "04:00 PM",
    description: "Annual school sports competition.",
  },
  {
    _id: "3",
    title: "Science Fair",
    date: "2025-08-25",
    startTime: "11:00 AM",
    endTime: "03:00 PM",
    description: "Students showcase science projects.",
  },
];

const EventCalendar = () => {
  const router = useRouter();
  const [value, onChange] = useState<Value>(new Date());

  // Get events for the selected date
  const selectedDate = value instanceof Date ? value.toISOString().split("T")[0] : "";
  const eventsForSelectedDate = dummyEvents.filter((event) => event.date === selectedDate);

  // Get all dates that have events
  const eventDates = dummyEvents.map((event) => {
    const [year, month, day] = event.date.split("-").map(Number);
    return new Date(year, month - 1, day);
  });

  const handleEventClick = () => {
    router.push("/list/events");
  };

  return (
    <div className="bg-bg p-4 rounded-xl shadow-sm">
      <style jsx global>{`
        /* Base Calendar Styling */
        .react-calendar {
          border: none;
          width: 100%;
          background-color: white;
          color: #374151;
          border-radius: 0.75rem;
          padding: 8px;
        }
        .dark .react-calendar {
          background-color: #1f2937;
          color: #e5e7eb;
        }
        .react-calendar__tile {
          border-radius: 8px;
          padding: 6px;
        }
        .react-calendar__tile--now {
          background: #dbeafe !important;
          color: #1d4ed8 !important;
        }
        .dark .react-calendar__tile--now {
          background: #374151 !important;
          color: #93c5fd !important;
        }
        .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white !important;
        }
        .dark .react-calendar__tile--active {
          background: #2563eb !important;
          color: white !important;
        }
        .react-calendar__tile--hasEvent {
          background-color: #edf9f0 !important;
        }
        .react-calendar__tile--hasEvent:hover {
          background-color: #e5f5ea !important;
        }
        .react-calendar__tile--hasEvent abbr {
          color: #16a34a;
          font-weight: 600;
        }
        .dark .react-calendar__tile--hasEvent {
          background-color: #064e3b !important;
        }
        .dark .react-calendar__tile--hasEvent abbr {
          color: #34d399;
        }
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

      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[16px] font-semibold my-2  ">
          Upcoming Events
        </h1>
        <Image
          src="/moreDark.png"
          alt=""
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={handleEventClick}
        />
      </div>

      <div className="flex flex-col gap-2">
        {dummyEvents && dummyEvents.length > 0 ? (
          dummyEvents.map((event) => (
            <div
              className="p-3 rounded-md border border-gray-200 dark:border-gray-700 border-t-4 odd:border-t-[#C3EBFA] even:border-t-[#CFCEFF] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              key={event._id}
              onClick={handleEventClick}
            >
              <div className="flex items-center justify-between">
                <h1 className="font-semibold text-[14px] ">
                  {event.title}
                </h1>
                <span className="text-xs">
                  {event.date} | {event.startTime} - {event.endTime}
                </span>
              </div>
              <p className="mt-2 text-sm">
                {event.description}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-4  text-sm">
            No events scheduled
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;

"use client";

import { useState } from "react";

export default function EventsPage() {
  const [events, setEvents] = useState([
    { id: 1, title: "Inter-House Sports", description: "Annual inter-house sports competition.", date: "2025-09-05", startTime: "09:00", endTime: "14:00" },
    { id: 2, title: "Cultural Day", description: "Students showcase different cultures.", date: "2025-09-12", startTime: "10:00", endTime: "15:00" },
  ]);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleCreateEvent = () => {
    const newEvent = {
      id: Date.now(),
      title,
      description,
      date,
      startTime,
      endTime,
    };
    setEvents([...events, newEvent]);
    setOpen(false);
    setTitle("");
    setDescription("");
    setDate("");
    setStartTime("");
    setEndTime("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Events</h2>
        <button
          onClick={() => setOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg  transition"
        >
          New Event
        </button>
      </div>

      {/* Events List */}
      <div className="grid gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-4 rounded-xl shadow-sm bg-surface"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <span className="text-sm ">{event.date}</span>
            </div>
            <p className="text-sm ">
              {event.startTime} - {event.endTime}
            </p>
            <p className="mt-2 ">{event.description}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50">
          <div className="bg-surface p-6 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Event</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-400"
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-400"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-400"
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-1/2 border rounded-lg px-3 py-2 focus:ring focus:ring-blue-400"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-1/2 border rounded-lg px-3 py-2 focus:ring focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={!title || !description || !date || !startTime || !endTime}
                className="bg-primary text-white px-4 py-2 rounded-lg  transition disabled:opacity-50"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client"
import { useState } from "react";

export function DataTable() {
  // Dummy data for now
  const [slots] = useState([
    {
      _id: "1",
      date: "2025-09-01",
      startTime: "09:00",
      bookings: 20,
      maxCapacity: 50,
    },
    {
      _id: "2",
      date: "2025-09-02",
      startTime: "10:30",
      bookings: 50,
      maxCapacity: 50,
    },
    {
      _id: "3",
      date: "2025-09-03",
      startTime: "14:00",
      bookings: 35,
      maxCapacity: 40,
    },
  ]);

  return (
    <div className="overflow-x-auto rounded-xl shadow">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        {/* Table Head */}
        <thead className="bg-surgace">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold  uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold  uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold  uppercase tracking-wider">
              Bookings
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold  uppercase tracking-wider">
              Capacity
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {slots.map((slot, index) => (
            <tr
              key={slot._id}
              className={
                index % 2 === 0
                  ? "bg-bg"
                  : "bg-surface"
              }
            >
              {/* Date */}
              <td className="px-6 py-4 whitespace-nowrap ">
                {new Date(slot.date).toLocaleDateString()}
              </td>

              {/* Time */}
              <td className="px-6 py-4 whitespace-nowrap ">
                {slot.startTime}
              </td>

              {/* Bookings with status pill */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    slot.bookings >= slot.maxCapacity
                      ? "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200"
                      : "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {slot.bookings}
                </span>
              </td>

              {/* Capacity */}
              <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                {slot.maxCapacity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

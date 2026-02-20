"use client"
import { useState } from "react";

export const SlotManager = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [capacity, setCapacity] = useState(50);
  const [slots, setSlots] = useState<
    { id: number; date: string; time: string; capacity: number }[]
  >([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newSlot = {
      id: Date.now(),
      date,
      time,
      capacity,
    };

    setSlots([...slots, newSlot]);
    setDate("");
    setTime("");
    setCapacity(50);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-surface rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6  ">
        Add Screening Slot
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded-lg "
            required
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium  mb-1">
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-2 border rounded-lg "
            required
          />
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Capacity (default: 50)
          </label>
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full p-2 border rounded-lg -700"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary font-medium rounded-lg cursor-pointer text-white hover:scale-105 transition ease-in-out duration-500 transition"
        >
          Add Slot
        </button>
      </form>

      {/* Added Slots Preview */}
      {slots.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold   mb-3">
            Screening Slots
          </h3>
          <ul className="space-y-2">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-between"
              >
                <span className="text-gray-800 dark:text-gray-200">
                  📅 {slot.date} ⏰ {slot.time}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Capacity: {slot.capacity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default SlotManager;
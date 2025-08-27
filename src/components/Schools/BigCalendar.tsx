"use client"

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useState, useEffect } from "react"

const localizer = momentLocalizer(moment)

// Dummy user
const dummyUser = {
  role: "student",
  name: "John Doe",
  programName: "SS1A",
}

// Dummy timetable
const dummyTimetables = [
  {
    class: "SS1A",
    term: "First Term",
    schedule: [
      {
        day: "Monday",
        slots: [
          { startTime: "09:00", endTime: "10:00", subject: "Mathematics", classroom: "Room 1" },
          { startTime: "10:00", endTime: "11:00", subject: "English", classroom: "Room 2" },
        ],
      },
      {
        day: "Tuesday",
        slots: [
          { startTime: "09:00", endTime: "10:00", subject: "Physics", classroom: "Lab 1" },
          { startTime: "10:15", endTime: "11:15", subject: "Chemistry", classroom: "Lab 2" },
        ],
      },
    ],
  },
]

interface TimetableEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: string
}

const BigCalendar = () => {
  const [view, setView] = useState<View>(Views.WORK_WEEK)
  const [term, setTerm] = useState("First Term")
  const [events, setEvents] = useState<TimetableEvent[]>([])

  useEffect(() => {
    const timetable = dummyTimetables.find(
      (t) => t.class === dummyUser.programName && t.term === term
    )

    if (!timetable) {
      setEvents([])
      return
    }

    const calendarEvents = timetable.schedule.flatMap((day) => {
      const dayIndex = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
        .indexOf(day.day)

      const now = new Date()
      const diff = dayIndex - now.getDay()
      const eventDate = new Date(now)
      eventDate.setDate(now.getDate() + diff)

      return day.slots.map((slot, idx) => {
        const [sh, sm] = slot.startTime.split(":").map(Number)
        const [eh, em] = slot.endTime.split(":").map(Number)

        const start = new Date(eventDate)
        start.setHours(sh, sm, 0)
        const end = new Date(eventDate)
        end.setHours(eh, em, 0)

        return {
          id: `${day.day}-${idx}`,
          title: slot.subject,
          start,
          end,
          resource: slot.classroom,
        }
      })
    })

    setEvents(calendarEvents)
  }, [term])

  return (
    <div className="flex flex-col gap-4 p-4 h-full bg-bg text-text font-poppins">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-text">
            Schedule ({dummyUser.programName})
          </h2>
          <p className="text-sm text-text">{dummyUser.name}</p>
        </div>

        <select
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-surface text-text"
        >
          <option value="First Term">First Term</option>
          <option value="Second Term">Second Term</option>
          <option value="Third Term">Third Term</option>
        </select>
      </div>

      {/* Calendar */}
      <div className="bg-surface rounded-xl shadow p-2 h-[120vh]"> 
        {/* 👆 h-[80vh] makes it tall and clear */}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={["work_week", "day"]}
          view={view}
          onView={(selectedView) => setView(selectedView)}
          min={new Date(2024, 0, 1, 8, 0, 0)}
          max={new Date(2024, 0, 1, 17, 0, 0)}
          className="h-full text-text"
          components={{
            event: ({ event }) => (
              <div className="p-1 h-full w-full flex flex-col justify-center bg-primary text-text rounded-lg">
                <span className=" text-sm">{event.title}</span>
                <span className="text-xs opacity-80">Room: {event.resource}</span>
              </div>
            ),
          }}
          eventPropGetter={() => ({
            style: {
              backgroundColor: "var(--primary)",
              color: "var(--surface)",
              borderRadius: "0.5rem",
              padding: "4px 8px",
            },
          })}
          formats={{
            eventTimeRangeFormat: () => "",
          }}
        />
      </div>
    </div>
  )
}

export default BigCalendar

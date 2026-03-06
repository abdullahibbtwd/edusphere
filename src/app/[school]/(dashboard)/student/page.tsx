import Announcement from "@/components/Schools/Announcement"
import EventCalender from "@/components/Schools/EventCalender"
import StudentCalendar from "@/components/Schools/StudentCalendar"

const StudentPage = () => {
  return (
    <div className="flex-1 p-3 sm:p-4 flex flex-col xl:flex-row gap-3 sm:gap-4 min-w-0">
      {/* left */}
      <div className="w-full xl:w-2/3 min-w-0">
        <StudentCalendar />
      </div>
      {/* Right */}
      <div className="w-full xl:w-1/3 flex flex-col gap-3 sm:gap-4 min-w-0">
        <EventCalender />
        <Announcement />
      </div>
    </div>
  )
}

export default StudentPage
"use client"
import Announcement from "@/components/Schools/Announcement"
import ProgramsChart from "@/components/Schools/Attendance"
import CountChart from "@/components/Schools/Countchart"
import EventCalender from "@/components/Schools/EventCalender"
import SchoolFeesChart from "@/components/Schools/FinanceChart"
import TopStudentsLeaderboard from "@/components/Schools/TopStudent"
import TopSubjectsChart from "@/components/Schools/TopSubject"
import UserCard from "@/components/Schools/UserCard"

const AdminPage = () => {
 const teacherStats = {total:5};
 const studentStats = {total:5};
  return (
    <div className="flex flex-col gap-4">
       <div className='p-4 flex gap-4 flex-col md:flex-row'>
      {/* Left */}
      <div className="w-full lg:w-2/3 flex flex-col gap-2 ">
        {/* Usercard */}
        <div className="flex gap-4 justify-between flex-wrap">
        <UserCard type="student" stats={studentStats ? studentStats.total : 0}/>
        <UserCard type="teacher"  stats={teacherStats ? teacherStats.total : 0} />
        </div>
        {/* Middle chart */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* radial */}
          <div className="w-full lg:w-1/3 h-[370px]">
            <CountChart/>
          </div>
          {/* Bar chart */}
          <div className="w-full lg:w-2/3 h-[370px]">
            <ProgramsChart/>
          </div>
        </div>
        {/* bottom chart */}
         <div className="w-full h-[400px]">
  <SchoolFeesChart/>
        </div>
       
      </div>
      {/* Right */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
      <EventCalender/>
      <Announcement/>
     
      </div>
    
      </div>
          <div className="w-full h-[700px]">
 <TopSubjectsChart/>
        </div>
         <div className="w-full h-[700px]">
 <TopStudentsLeaderboard/>
        </div>
    </div>
   
  )
}

export default AdminPage
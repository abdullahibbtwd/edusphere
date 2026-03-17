"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import Announcement from "@/components/Schools/Announcement"
import ProgramsChart from "@/components/Schools/Attendance"
import CountChart from "@/components/Schools/Countchart"
import EventCalender from "@/components/Schools/EventCalender"
import SchoolFeesChart from "@/components/Schools/FinanceChart"
import FinanceTracking from "@/components/Schools/FinanceTracking"
import TopStudentsLeaderboard from "@/components/Schools/TopStudent"
import TopSubjectsChart from "@/components/Schools/TopSubject"
import UserCard from "@/components/Schools/UserCard"

const AdminPage = () => {
  const params = useParams()
  const schoolId = params.school as string

  const [studentStats, setStudentStats] = useState<{ total: number } | null>(null)
  const [teacherStats, setTeacherStats] = useState<{ total: number } | null>(null)
  const [currentSessionName, setCurrentSessionName] = useState<string | null>(null)
  const [classEnrollment, setClassEnrollment] = useState<{ name: string; count: number }[]>([])

  // Prevent race conditions / dev StrictMode double-invocation from overwriting state
  const requestSeq = useRef(0)

  const fetchCounts = useCallback(async () => {
    if (!schoolId) return
    const seq = ++requestSeq.current
    try {
      const res = await fetch(`/api/schools/${schoolId}/dashboard-summary`, {
        cache: 'no-store',
      })

      // Ignore stale responses
      if (seq !== requestSeq.current) return

      const data = await res.json()

      // Ignore stale responses again (in case JSON parsing is slow)
      if (seq !== requestSeq.current) return

      if (res.ok) {
        setStudentStats({ total: data.studentTotal ?? 0 })
        setTeacherStats({ total: data.teacherTotal ?? 0 })
        setCurrentSessionName(data.currentSessionName ?? null)
        if (Array.isArray(data.classEnrollment)) {
          setClassEnrollment(data.classEnrollment)
        }
      }
    } catch {
      // If a request fails, don't wipe existing chart data (prevents flicker)
      if (seq !== requestSeq.current) return
      setStudentStats((prev) => prev ?? { total: 0 })
      setTeacherStats((prev) => prev ?? { total: 0 })
    }
  }, [schoolId])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  return (
    <div className="flex flex-col gap-4">
       <div className='p-4 flex gap-4 flex-col md:flex-row'>
      {/* Left */}
      <div className="w-full lg:w-2/3 flex flex-col gap-2 ">
        {/* Usercard */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="student" stats={studentStats?.total ?? 0} sessionName={currentSessionName ?? undefined} />
          <UserCard type="teacher" stats={teacherStats?.total ?? 0} sessionName={currentSessionName ?? undefined} />
        </div>
        {/* Middle chart */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* radial */}
          <div className="w-full lg:w-1/3 h-[370px]">
            <CountChart schoolId={schoolId} />
          </div>
          {/* Bar chart */}
          <div className="w-full lg:w-2/3 h-[370px]">
            <ProgramsChart data={classEnrollment} />
          </div>
        </div>
        {/* bottom chart */}
         <div className="w-full h-[400px]">
          <SchoolFeesChart schoolId={schoolId} />
        </div>
       
      </div>
      {/* Right */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
      <EventCalender/>
      <Announcement/>
     
      </div>
    
      </div>
          <div className="w-full min-h-[500px] p-4">
            <FinanceTracking schoolId={schoolId} />
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
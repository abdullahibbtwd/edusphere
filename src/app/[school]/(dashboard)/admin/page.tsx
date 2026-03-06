"use client"

import { useState, useEffect, useCallback } from "react"
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

  const fetchCounts = useCallback(async () => {
    if (!schoolId) return
    try {
      const [studentsRes, teachersRes, calendarRes, enrollmentRes] = await Promise.all([
        fetch(`/api/schools/${schoolId}/students?page=1&limit=1`),
        fetch(`/api/schools/${schoolId}/teachers?page=1&limit=1`),
        fetch(`/api/schools/${schoolId}/academic-calendar`),
        fetch(`/api/schools/${schoolId}/classes/enrollment?limit=10`)
      ])
      const studentsData = await studentsRes.json()
      const teachersData = await teachersRes.json()
      const calendarData = await calendarRes.json()
      const enrollmentData = await enrollmentRes.json()
      if (studentsRes.ok && studentsData.pagination) {
        setStudentStats({ total: studentsData.pagination.totalCount ?? 0 })
      }
      if (teachersRes.ok && teachersData.pagination) {
        setTeacherStats({ total: teachersData.pagination.totalCount ?? 0 })
      }
      if (calendarRes.ok && Array.isArray(calendarData.sessions)) {
        const active = calendarData.sessions.find((s: { isActive?: boolean }) => s.isActive)
        setCurrentSessionName(active?.name ?? null)
      }
      if (enrollmentRes.ok && Array.isArray(enrollmentData.data)) {
        setClassEnrollment(enrollmentData.data)
      } else {
        setClassEnrollment([])
      }
    } catch {
      setStudentStats({ total: 0 })
      setTeacherStats({ total: 0 })
      setClassEnrollment([])
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
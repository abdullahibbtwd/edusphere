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

  const requestSeq = useRef(0)

  const fetchCounts = useCallback(async () => {
    if (!schoolId) return
    const seq = ++requestSeq.current
    try {
      const res = await fetch(`/api/schools/${schoolId}/dashboard-summary`, {
        cache: "no-store",
      })

      if (seq !== requestSeq.current) return

      const data = await res.json()

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
      if (seq !== requestSeq.current) return
      setStudentStats((prev) => prev ?? { total: 0 })
      setTeacherStats((prev) => prev ?? { total: 0 })
    }
  }, [schoolId])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      {/* Main column + calendar/announcements: single column on sm/md, side-by-side from lg */}
      <div className="flex w-full min-w-0 flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex w-full min-w-0 flex-col gap-6 lg:w-2/3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UserCard
              type="student"
              stats={studentStats?.total ?? 0}
              sessionName={currentSessionName ?? undefined}
            />
            <UserCard
              type="teacher"
              stats={teacherStats?.total ?? 0}
              sessionName={currentSessionName ?? undefined}
            />
          </div>

          <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row">
            <div className="h-[320px] w-full shrink-0 lg:h-[370px] lg:w-1/3">
              <CountChart schoolId={schoolId} />
            </div>
            <div className="h-[320px] w-full min-w-0 lg:h-[370px] lg:w-2/3">
              <ProgramsChart data={classEnrollment} />
            </div>
          </div>

          <div className="h-[360px] w-full min-w-0 lg:h-[400px]">
            <SchoolFeesChart schoolId={schoolId} />
          </div>
        </div>

        <aside className="flex w-full min-w-0 flex-col gap-6 lg:w-1/3 lg:shrink-0">
          <EventCalender />
          <Announcement />
        </aside>
      </div>

      <section className="w-full min-w-0 min-h-[420px]">
        <FinanceTracking schoolId={schoolId} />
      </section>

      <section className="h-[480px] w-full min-w-0 lg:h-[700px]">
        <TopSubjectsChart />
      </section>

      <section className="h-[480px] w-full min-w-0 lg:h-[700px]">
        <TopStudentsLeaderboard />
      </section>
    </div>
  )
}

export default AdminPage

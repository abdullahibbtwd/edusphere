export const dynamic = 'force-dynamic';
import React from 'react';
import { prisma } from '@/lib/prisma';
import Dashboard from '../../components/SuperAdmin/Dashboard';

async function getDashboardData() {
  const now = new Date();

  // Build last-6-months labels + date ranges
  const monthRanges = Array.from({ length: 6 }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - 4 + i, 1);
    const label = start.toLocaleString('default', { month: 'short' });
    return { start, end, label };
  });

  const [
    totalSchools,
    activeSchools,
    pendingApplications,
    totalTeachers,
    totalStudents,
    schoolsWithCounts,
    userGrowthCounts,
  ] = await Promise.all([
    prisma.school.count(),
    prisma.school.count({ where: { isActive: true } }),
    prisma.schoolApplication.count({ where: { status: 'PENDING' } }),
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.school.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        isActive: true,
        _count: {
          select: { students: true, teachers: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    Promise.all(
      monthRanges.map(({ start, end }) =>
        prisma.user.count({ where: { createdAt: { gte: start, lt: end } } })
      )
    ),
  ]);

  return {
    totalSchools,
    activeSchools,
    pendingApplications,
    totalTeachers,
    totalStudents,
    userGrowthMonths: monthRanges.map((r) => r.label),
    userGrowthCounts,
    schools: schoolsWithCounts.map((s) => ({
      id: s.id,
      name: s.name,
      subdomain: s.subdomain,
      isActive: s.isActive,
      totalStudents: s._count.students,
      totalTeachers: s._count.teachers,
    })),
  };
}

export default async function DashboardHome() {
  const data = await getDashboardData();
  return <Dashboard data={data} />;
}

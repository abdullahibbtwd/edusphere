import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';
import { requireRole } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const sessionUser = requireRole(request, ['ADMIN']);
  if (sessionUser instanceof NextResponse) return sessionUser;

  try {
    const { schoolId } = await params;
    const school = await getSchool(schoolId);

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const actualSchoolId = school.id;
    if (sessionUser.schoolId && sessionUser.schoolId !== actualSchoolId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only view dashboard summary for your school' },
        { status: 403 }
      );
    }

    const [studentTotal, teacherTotal, activeSession, classes] = await Promise.all([
      prisma.student.count({ where: { schoolId: actualSchoolId } }),
      prisma.teacher.count({ where: { schoolId: actualSchoolId } }),
      prisma.academicSession.findFirst({
        where: { schoolId: actualSchoolId, isActive: true },
        select: { name: true },
      }),
      prisma.class.findMany({
        where: { schoolId: actualSchoolId },
        select: {
          id: true,
          name: true,
          level: { select: { name: true } },
        },
        orderBy: [{ level: { name: 'asc' } }, { name: 'asc' }],
        take: 200,
      }),
    ]);

    const classIds = classes.map((c) => c.id);
    const grouped = classIds.length
      ? await prisma.student.groupBy({
          by: ['classId'],
          where: { schoolId: actualSchoolId, classId: { in: classIds } },
          _count: { _all: true },
        })
      : [];

    const countByClassId = new Map(grouped.map((g) => [g.classId, g._count._all]));

    const classEnrollment = classes
      .map((c) => ({
        id: c.id,
        name: `${c.level?.name ?? ''} ${c.name}`.trim(),
        count: countByClassId.get(c.id) ?? 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ name, count }) => ({ name, count }));

    return NextResponse.json({
      studentTotal,
      teacherTotal,
      currentSessionName: activeSession?.name ?? null,
      classEnrollment,
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


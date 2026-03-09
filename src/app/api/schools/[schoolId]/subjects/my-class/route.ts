import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

/**
 * GET - Subjects for the current student's class.
 * Uses TeacherSubjectClass as the single source of truth — matching
 * exactly what the timetable and exam timetable generators use.
 * Student role only.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const sessionUser = requireRole(request, ['STUDENT']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const resolvedSchool = await getSchool(schoolId);
        if (!resolvedSchool) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const userId = (sessionUser as { userId: string }).userId;
        const student = await prisma.student.findFirst({
            where: { userId, schoolId: resolvedSchool.id },
            include: {
                class: {
                    include: { level: { select: { name: true } } }
                }
            }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student record not found for this school' }, { status: 404 });
        }

        // Use TeacherSubjectClass as single source of truth — same as timetable & exam generation
        const assignments = await prisma.teacherSubjectClass.findMany({
            where: {
                classId: student.classId,
                schoolId: resolvedSchool.id,
                isActive: true,
            },
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        creditUnit: true,
                        term: true,
                        levels: { select: { name: true } },
                    }
                },
                teacher: { select: { id: true, name: true } },
            },
            orderBy: { subject: { name: 'asc' } },
        });

        // Deduplicate by subjectId (multiple teachers can teach the same subject in a class)
        const subjectMap = new Map<string, {
            id: string; name: string; code: string;
            creditUnit: number; term: string; levelName: string; teacherName: string;
        }>();

        for (const a of assignments) {
            const existing = subjectMap.get(a.subjectId);
            const teacherName = a.teacher.name;
            if (existing) {
                // Append additional teacher if different
                if (!existing.teacherName.includes(teacherName)) {
                    existing.teacherName = `${existing.teacherName}, ${teacherName}`;
                }
            } else {
                subjectMap.set(a.subjectId, {
                    id: a.subject.id,
                    name: a.subject.name,
                    code: a.subject.code,
                    creditUnit: a.subject.creditUnit,
                    term: a.subject.term,
                    levelName: a.subject.levels.length > 0 ? a.subject.levels[0].name : 'All Levels',
                    teacherName,
                });
            }
        }

        return NextResponse.json({
            subjects: Array.from(subjectMap.values()),
            student: {
                name: `${student.firstName} ${student.lastName}`,
                class: student.class?.name ?? '',
                level: student.class?.level?.name ?? '',
            }
        });
    } catch (error) {
        console.error('Error fetching my-class subjects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

/**
 * GET - All teachers who teach the current student's class.
 * Groups by teacher and lists the subjects they teach.
 * Student role only.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: identifier } = await params;

        const sessionUser = requireRole(request, ['STUDENT']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const school = await getSchool(identifier);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        if (sessionUser.schoolId && sessionUser.schoolId !== school.id && sessionUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - You can only view teachers for your school' },
                { status: 403 }
            );
        }

        const userId = (sessionUser as { userId: string }).userId;

        const student = await prisma.student.findFirst({
            where: { userId, schoolId: school.id },
            include: {
                class: { include: { level: { select: { name: true } } } },
            },
        });

        if (!student) return NextResponse.json({ error: 'Student record not found' }, { status: 404 });

        // Get all TeacherSubjectClass records for this student's class
        const assignments = await prisma.teacherSubjectClass.findMany({
            where: { classId: student.classId, schoolId: school.id, isActive: true },
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        img: true,
                        sex: true,
                    },
                },
                subject: { select: { id: true, name: true, code: true } },
            },
            orderBy: { teacher: { name: 'asc' } },
        });

        // Group by teacher
        const teacherMap = new Map<string, {
            id: string; name: string; email: string; phone: string;
            img: string; sex: string;
            subjects: { id: string; name: string; code: string }[];
        }>();

        for (const a of assignments) {
            const t = a.teacher;
            if (!teacherMap.has(t.id)) {
                teacherMap.set(t.id, {
                    id: t.id, name: t.name, email: t.email,
                    phone: t.phone, img: t.img, sex: t.sex,
                    subjects: [],
                });
            }
            const entry = teacherMap.get(t.id)!;
            if (!entry.subjects.some(s => s.id === a.subject.id)) {
                entry.subjects.push(a.subject);
            }
        }

        return NextResponse.json({
            teachers: Array.from(teacherMap.values()),
            student: {
                className: `${student.class?.level?.name ?? ''} ${student.class?.name ?? ''}`.trim(),
            },
        });
    } catch (error) {
        console.error('Error fetching student teachers:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';

async function resolveSchoolId(identifier: string): Promise<string | null> {
    const school = await prisma.school.findFirst({
        where: { OR: [{ id: identifier }, { subdomain: identifier, isActive: true }] },
        select: { id: true },
    });
    return school?.id || null;
}

/**
 * GET - Exam timetable for the current student's class.
 * Student role only. Query: term (optional, default FIRST).
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: identifier } = await params;

        const sessionUser = requireRole(request, ['STUDENT']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const actualSchoolId = await resolveSchoolId(identifier);
        if (!actualSchoolId) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const userId = (sessionUser as { userId: string }).userId;

        const student = await prisma.student.findFirst({
            where: { userId, schoolId: actualSchoolId },
            include: {
                class: { include: { level: { select: { id: true, name: true } } } },
            },
        });

        if (!student) {
            return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const term = (searchParams.get('term') || 'FIRST') as 'FIRST' | 'SECOND' | 'THIRD';

        const exams = await prisma.examTimetable.findMany({
            where: { schoolId: actualSchoolId, classId: student.classId, term },
            include: {
                subject: { select: { id: true, name: true, code: true, creditUnit: true } },
                teacher: { select: { id: true, name: true } },
                invigilator: { select: { id: true, name: true } },
                class: { select: { id: true, name: true } },
                level: { select: { id: true, name: true } },
            },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });

        return NextResponse.json({
            success: true,
            exams,
            student: {
                classId: student.classId,
                className: `${student.class?.level?.name ?? ''} ${student.class?.name ?? ''}`.trim(),
            },
            term,
        });
    } catch (error) {
        console.error('Error fetching student exam timetable:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

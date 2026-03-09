import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

/**
 * GET - Timetable for the current student's class.
 * Student role only. Query: term (optional, default FIRST).
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
        const actualSchoolId = resolvedSchool.id;

        const userId = (sessionUser as { userId: string }).userId;
        const student = await prisma.student.findFirst({
            where: { userId, schoolId: actualSchoolId },
            include: {
                class: {
                    include: { level: { select: { name: true } } }
                }
            }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student record not found for this school' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const term = (searchParams.get('term') || 'FIRST') as 'FIRST' | 'SECOND' | 'THIRD';

        const timetable = await prisma.timetable.findFirst({
            where: {
                schoolId: actualSchoolId,
                classId: student.classId,
                term
            },
            include: {
                class: {
                    include: { level: { select: { name: true } } }
                }
            }
        });

        if (!timetable) {
            return NextResponse.json({
                success: true,
                timetable: null,
                student: {
                    className: `${student.class?.level?.name ?? ''} ${student.class?.name ?? ''}`.trim(),
                    classId: student.classId
                },
                term
            });
        }

        const formatted = {
            id: timetable.id,
            classId: timetable.classId,
            className: `${timetable.class.level.name} ${timetable.class.name}`,
            levelName: timetable.class.level.name,
            term: timetable.term,
            schedule: timetable.schedule,
            createdAt: timetable.createdAt,
            updatedAt: timetable.updatedAt
        };

        return NextResponse.json({
            success: true,
            timetable: formatted,
            student: {
                className: formatted.className,
                classId: timetable.classId
            },
            term
        });
    } catch (error) {
        console.error('Error fetching my-class timetable:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

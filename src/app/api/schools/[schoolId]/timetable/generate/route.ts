import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateTimetableForClass, convertScheduleToJson } from '@/lib/timetable/generator';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

/**
 * GET - Fetch existing timetable for a class and term
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const sessionUser = requireRole(request, ['ADMIN', 'TEACHER', 'SUPER_ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const { schoolId: schoolIdentifier } = await params;
        const { searchParams } = new URL(request.url);
        const classId = searchParams.get('classId');
        const term = searchParams.get('term');

        if (!classId || !term) {
            return NextResponse.json(
                { error: 'Missing classId or term' },
                { status: 400 }
            );
        }

        const resolvedSchool = await getSchool(schoolIdentifier);
        if (!resolvedSchool) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        const schoolId = resolvedSchool.id;
        if (sessionUser.schoolId && sessionUser.schoolId !== schoolId && sessionUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const timetable = await prisma.timetable.findFirst({
            where: {
                classId,
                term: term as 'FIRST' | 'SECOND' | 'THIRD',
                schoolId
            }
        });

        return NextResponse.json({ timetable });
    } catch (error: any) {
        console.error('Fetch timetable error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch timetable' },
            { status: 500 }
        );
    }
}

/**
 * POST - Generate timetable for a specific class
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const sessionUser = requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const { schoolId: schoolIdentifier } = await params;
        const body = await request.json();
        const { classId, term } = body;

        if (!classId || !term) {
            return NextResponse.json(
                { error: 'Missing classId or term' },
                { status: 400 }
            );
        }
        if (!['FIRST', 'SECOND', 'THIRD'].includes(term)) {
            return NextResponse.json({ error: 'Invalid term' }, { status: 400 });
        }

        const resolvedSchool2 = await getSchool(schoolIdentifier);
        if (!resolvedSchool2) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        const schoolId = resolvedSchool2.id;
        if (sessionUser.schoolId && sessionUser.schoolId !== schoolId && sessionUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Generate the timetable
        const schedule = await generateTimetableForClass(schoolId, classId, term);
        const scheduleJson = convertScheduleToJson(schedule);

        // Get class info for response
        const classData = await prisma.class.findUnique({
            where: { id: classId },
            include: { level: true }
        });
        if (!classData || classData.schoolId !== schoolId) {
            return NextResponse.json({ error: 'Class not found for this school' }, { status: 404 });
        }

        // Save or update timetable
        const timetable = await prisma.timetable.upsert({
            where: {
                classId_term_schoolId: {
                    classId,
                    term: term as 'FIRST' | 'SECOND' | 'THIRD',
                    schoolId
                }
            },
            update: {
                schedule: scheduleJson,
                updatedAt: new Date()
            },
            create: {
                classId,
                levelId: classData?.levelId || '',
                term: term as 'FIRST' | 'SECOND' | 'THIRD',
                schedule: scheduleJson,
                schoolId
            }
        });

        return NextResponse.json({
            success: true,
            timetable,
            periodsGenerated: schedule.length
        });
    } catch (error: any) {
        console.error('Timetable generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate timetable' },
            { status: 500 }
        );
    }
}

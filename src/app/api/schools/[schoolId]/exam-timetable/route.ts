import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: identifier } = await params;
        const resolvedSchool = await getSchool(identifier);
        if (!resolvedSchool) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        const schoolId = resolvedSchool.id;

        const { searchParams } = new URL(req.url);
        const classId = searchParams.get('classId');
        const term = searchParams.get('term');
        const levelId = searchParams.get('levelId');

        const where: Record<string, unknown> = { schoolId };
        if (classId) where.classId = classId;
        if (term) where.term = term;
        if (levelId) where.levelId = levelId;

        const exams = await prisma.examTimetable.findMany({
            where,
            include: {
                subject: { select: { id: true, name: true, code: true, creditUnit: true } },
                teacher: { select: { id: true, name: true } },
                invigilator: { select: { id: true, name: true } },
                class: { select: { id: true, name: true } },
                level: { select: { id: true, name: true } },
            },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });

        return NextResponse.json({ exams });
    } catch (error) {
        console.error('Fetch exam timetable error:', error);
        return NextResponse.json({ error: 'Failed to fetch exam timetable' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: identifier } = await params;
        const resolvedSchool = await getSchool(identifier);
        if (!resolvedSchool) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        const schoolId = resolvedSchool.id;

        const { searchParams } = new URL(req.url);
        const term = searchParams.get('term');

        if (!term) return NextResponse.json({ error: 'Term required' }, { status: 400 });

        await prisma.examTimetable.deleteMany({ where: { schoolId, term: term as any } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete exam timetable error:', error);
        return NextResponse.json({ error: 'Failed to delete exam timetable' }, { status: 500 });
    }
}

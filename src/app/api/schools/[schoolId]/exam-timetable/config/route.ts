import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';
import { requireRole } from '@/lib/auth-middleware';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    const sessionUser = requireRole(req, ['ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    try {
        const { schoolId: identifier } = await params;
        const resolvedSchool = await getSchool(identifier);
        if (!resolvedSchool) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        const schoolId = resolvedSchool.id;
        if (sessionUser.schoolId && sessionUser.schoolId !== schoolId) {
            return NextResponse.json(
                { error: 'Forbidden - You can only view exam config for your school' },
                { status: 403 }
            );
        }

        const config = await prisma.examTimetableConfig.findUnique({ where: { schoolId } });
        return NextResponse.json({ config });
    } catch (error) {
        console.error('Fetch exam config error:', error);
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    const sessionUser = requireRole(req, ['ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    try {
        const { schoolId: identifier } = await params;
        const resolvedSchool = await getSchool(identifier);
        if (!resolvedSchool) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        const schoolId = resolvedSchool.id;
        if (sessionUser.schoolId && sessionUser.schoolId !== schoolId) {
            return NextResponse.json(
                { error: 'Forbidden - You can only manage exam config for your school' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { examsPerDay, examDuration, breakBetweenExams, examStartTime } = body;

        if (!examsPerDay || !examDuration || !examStartTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const parsedExamsPerDay = Number.parseInt(String(examsPerDay), 10);
        const parsedExamDuration = Number.parseInt(String(examDuration), 10);
        const parsedBreakBetween = Number.parseInt(String(breakBetweenExams ?? 30), 10);
        if (!Number.isFinite(parsedExamsPerDay) || parsedExamsPerDay <= 0 || parsedExamsPerDay > 12) {
            return NextResponse.json({ error: 'examsPerDay must be between 1 and 12' }, { status: 400 });
        }
        if (!Number.isFinite(parsedExamDuration) || parsedExamDuration < 15 || parsedExamDuration > 300) {
            return NextResponse.json({ error: 'examDuration must be between 15 and 300 minutes' }, { status: 400 });
        }
        if (!Number.isFinite(parsedBreakBetween) || parsedBreakBetween < 0 || parsedBreakBetween > 180) {
            return NextResponse.json({ error: 'breakBetweenExams must be between 0 and 180 minutes' }, { status: 400 });
        }
        if (!/^\d{2}:\d{2}$/.test(String(examStartTime))) {
            return NextResponse.json({ error: 'examStartTime must be in HH:mm format' }, { status: 400 });
        }

        const config = await prisma.examTimetableConfig.upsert({
            where: { schoolId },
            update: { examsPerDay: parsedExamsPerDay, examDuration: parsedExamDuration, breakBetweenExams: parsedBreakBetween, examStartTime },
            create: { schoolId, examsPerDay: parsedExamsPerDay, examDuration: parsedExamDuration, breakBetweenExams: parsedBreakBetween, examStartTime },
        });

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error('Save exam config error:', error);
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}

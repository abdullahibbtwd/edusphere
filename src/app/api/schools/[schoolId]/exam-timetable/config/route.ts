import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: identifier } = await params;
        const resolvedSchool = await getSchool(identifier);
        if (!resolvedSchool) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        const schoolId = resolvedSchool.id;

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
    try {
        const { schoolId: identifier } = await params;
        const resolvedSchool = await getSchool(identifier);
        if (!resolvedSchool) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        const schoolId = resolvedSchool.id;

        const body = await req.json();
        const { examsPerDay, examDuration, breakBetweenExams, examStartTime } = body;

        if (!examsPerDay || !examDuration || !examStartTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const config = await prisma.examTimetableConfig.upsert({
            where: { schoolId },
            update: { examsPerDay, examDuration, breakBetweenExams: breakBetweenExams ?? 30, examStartTime },
            create: { schoolId, examsPerDay, examDuration, breakBetweenExams: breakBetweenExams ?? 30, examStartTime },
        });

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error('Save exam config error:', error);
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}

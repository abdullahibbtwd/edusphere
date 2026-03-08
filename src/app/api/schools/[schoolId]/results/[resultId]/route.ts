import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-middleware';

async function resolveSchool(schoolId: string) {
    return prisma.school.findFirst({
        where: { OR: [{ id: schoolId }, { subdomain: schoolId }] },
    });
}

// GET a single result with all scores
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; resultId: string }> }
) {
    try {
        const { schoolId, resultId } = await params;
        const user = requireAuth(request);
        if (user instanceof NextResponse) return user;

        const school = await resolveSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const result = await prisma.result.findFirst({
            where: { id: resultId, schoolId: school.id },
            include: {
                student: { select: { id: true, firstName: true, lastName: true } },
                subject: { select: { id: true, name: true, code: true } },
                term: { select: { id: true, name: true } },
                scores: {
                    include: {
                        component: { select: { id: true, name: true, maxScore: true, order: true } },
                    },
                    orderBy: { component: { order: 'asc' } },
                },
            },
        });

        if (!result) return NextResponse.json({ error: 'Result not found' }, { status: 404 });

        return NextResponse.json({ result });
    } catch (error) {
        console.error('Error fetching result:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT update scores for a single result
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; resultId: string }> }
) {
    try {
        const { schoolId, resultId } = await params;
        const user = requireAuth(request);
        if (user instanceof NextResponse) return user;

        if (user.role === 'STUDENT') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const school = await resolveSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const result = await prisma.result.findFirst({
            where: { id: resultId, schoolId: school.id },
        });

        if (!result) return NextResponse.json({ error: 'Result not found' }, { status: 404 });

        // Teacher access check
        if (user.role === 'TEACHER') {
            const teacher = await prisma.teacher.findFirst({
                where: { userId: user.userId, schoolId: school.id },
                include: {
                    teacherSubjectClasses: { select: { subjectId: true, classId: true } },
                    classesSupervised: { select: { id: true } },
                },
            });
            if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

            const isAssigned = teacher.teacherSubjectClasses.some(
                (t) => t.subjectId === result.subjectId && t.classId === result.classId
            );
            const isSupervisor = teacher.classesSupervised.some((c) => c.id === result.classId);

            if (!isAssigned && !isSupervisor) {
                return NextResponse.json({ error: 'Forbidden — not your subject or class' }, { status: 403 });
            }
        }

        const body = await request.json();
        const { scores } = body; // [{ componentId, score }]

        if (!Array.isArray(scores)) {
            return NextResponse.json({ error: 'scores[] is required' }, { status: 400 });
        }

        const updatedScores = await prisma.$transaction(
            scores.map((s: { componentId: string; score: number }) =>
                prisma.resultScore.upsert({
                    where: {
                        resultId_componentId: {
                            resultId: result.id,
                            componentId: s.componentId,
                        },
                    },
                    update: { score: parseFloat(String(s.score)) },
                    create: {
                        resultId: result.id,
                        componentId: s.componentId,
                        score: parseFloat(String(s.score)),
                    },
                })
            )
        );

        return NextResponse.json({ message: 'Scores updated', scores: updatedScores });
    } catch (error) {
        console.error('Error updating result:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE a result (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; resultId: string }> }
) {
    try {
        const { schoolId, resultId } = await params;
        const user = requireAuth(request);
        if (user instanceof NextResponse) return user;

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const school = await resolveSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        await prisma.result.delete({ where: { id: resultId } });

        return NextResponse.json({ message: 'Result deleted' });
    } catch (error) {
        console.error('Error deleting result:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

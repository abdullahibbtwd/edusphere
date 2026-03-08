import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-middleware';

async function resolveSchool(schoolId: string) {
    return prisma.school.findFirst({
        where: { OR: [{ id: schoolId }, { subdomain: schoolId }] },
    });
}

/**
 * GET /results/my — student views their own results
 * Only accessible when admin has published results for that term.
 * Query params: termId (optional — returns all terms if omitted)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const user = requireAuth(request);
        if (user instanceof NextResponse) return user;

        const school = await resolveSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        // Find the student record linked to this user
        const student = await prisma.student.findFirst({
            where: { userId: user.userId, schoolId: school.id },
        });

        if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });

        // Check result settings to see if results are published
        const settings = await prisma.resultSettings.findUnique({
            where: { schoolId: school.id },
        });

        const { searchParams } = new URL(request.url);
        const termId = searchParams.get('termId');

        // Students can only see results for the published term (unless admin — but this route is student-only)
        if (!settings?.publishedTermId) {
            return NextResponse.json({
                results: [],
                message: 'Results have not been published yet',
                isPublished: false,
            });
        }

        const effectiveTermId = termId || settings.publishedTermId;

        // If student requests a specific term that isn't published, deny
        if (termId && termId !== settings.publishedTermId) {
            return NextResponse.json({
                results: [],
                message: 'Results for this term have not been published',
                isPublished: false,
            });
        }

        // Fetch all subjects for the student's class via TeacherSubjectClass
        // This is the ground truth of what subjects the student is taking
        const [results, tscRaw, components] = await Promise.all([
            prisma.result.findMany({
                where: { studentId: student.id, schoolId: school.id, termId: effectiveTermId },
                include: {
                    subject: { select: { id: true, name: true, code: true } },
                    term: {
                        select: {
                            id: true,
                            name: true,
                            session: { select: { id: true, name: true } },
                        },
                    },
                    scores: {
                        include: {
                            component: { select: { id: true, name: true, maxScore: true, order: true } },
                        },
                        orderBy: { component: { order: 'asc' } },
                    },
                },
            }),
            prisma.teacherSubjectClass.findMany({
                where: { classId: student.classId, schoolId: school.id, isActive: true },
                select: { subject: { select: { id: true, name: true, code: true } } },
                distinct: ['subjectId'],
                orderBy: { subject: { name: 'asc' } },
            }),
            prisma.assessmentComponent.findMany({
                where: { schoolId: school.id },
                orderBy: { order: 'asc' },
            }),
        ]);

        const classSubjects = tscRaw.map((t) => t.subject);
        const totalMaxScore = components.reduce((sum, c) => sum + c.maxScore, 0);

        // Build a result for EVERY subject in the class (pending for unrecorded ones)
        const resultMap = new Map(results.map((r) => [r.subjectId, r]));
        const termInfo = results[0]?.term ?? null;

        const processedResults = classSubjects.map((subject) => {
            const r = resultMap.get(subject.id);
            if (r) {
                const totalScore = r.scores.reduce((sum, s) => sum + s.score, 0);
                const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
                return {
                    id: r.id,
                    subject: r.subject,
                    term: r.term,
                    scores: r.scores,
                    totalScore,
                    percentage: parseFloat(percentage.toFixed(2)),
                    grade: getGrade(percentage),
                    isPending: false,
                };
            }
            // Subject has no result recorded yet
            return {
                id: `pending-${subject.id}`,
                subject,
                term: termInfo,
                scores: [],
                totalScore: 0,
                percentage: 0,
                grade: 'F',
                isPending: true,
            };
        });

        // Average based on ALL class subjects (pending ones count as 0)
        const subjectCount = processedResults.length;
        const overallTotal = processedResults.reduce((sum, r) => sum + r.percentage, 0);
        const overallAverage = subjectCount > 0 ? overallTotal / subjectCount : 0;

        return NextResponse.json({
            results: processedResults,
            summary: {
                studentName: `${student.firstName} ${student.lastName}`,
                overallAverage: parseFloat(overallAverage.toFixed(2)),
                overallGrade: getGrade(overallAverage),
                promotionAverage: settings.promotionAverage,
                isPromoted: overallAverage >= settings.promotionAverage,
                subjectCount,
                recordedCount: results.length,
            },
            isPublished: true,
        });
    } catch (error) {
        console.error('Error fetching student results:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function getGrade(percentage: number): string {
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 45) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
}

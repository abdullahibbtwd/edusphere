import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

/**
 * GET results — role-based filtering:
 *  ADMIN: all results for the school (filterable by termId, classId, subjectId)
 *  TEACHER: results for subjects/classes they teach (or all classes if class supervisor)
 *  STUDENT: blocked — use /results/my instead
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const user = requireAuth(request);
        if (user instanceof NextResponse) return user;

        if (user.role === 'STUDENT') {
            return NextResponse.json({ error: 'Use /results/my for your results' }, { status: 403 });
        }

        const school = await getSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const { searchParams } = new URL(request.url);
        const termId = searchParams.get('termId');
        const classId = searchParams.get('classId');
        const subjectId = searchParams.get('subjectId');
        const studentId = searchParams.get('studentId');

        let subjectFilter: string[] | undefined;
        let classFilter: string[] | undefined;

        if (user.role === 'TEACHER') {
            const teacher = await prisma.teacher.findFirst({
                where: { userId: user.userId, schoolId: school.id },
                include: {
                    teacherSubjectClasses: { select: { subjectId: true, classId: true } },
                    classesSupervised: { select: { id: true } },
                },
            });

            if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

            const assignedSubjectIds = teacher.teacherSubjectClasses.map((t) => t.subjectId);
            const assignedClassIds = teacher.teacherSubjectClasses.map((t) => t.classId);
            const supervisedClassIds = teacher.classesSupervised.map((c) => c.id);

            // If class supervisor: can see all subjects for supervised classes too
            const allClassIds = [...new Set([...assignedClassIds, ...supervisedClassIds])];

            subjectFilter = subjectId ? [subjectId] : assignedSubjectIds;
            classFilter = classId ? [classId] : allClassIds;

            // Enforce teacher can only access their own subjects (unless class supervisor)
            if (subjectId && !assignedSubjectIds.includes(subjectId)) {
                const isSupervisor = supervisedClassIds.length > 0;
                if (!isSupervisor) {
                    return NextResponse.json({ error: 'Forbidden — not your subject' }, { status: 403 });
                }
            }
        }

        const results = await prisma.result.findMany({
            where: {
                schoolId: school.id,
                ...(termId && { termId }),
                ...(studentId && { studentId }),
                ...(classFilter ? { classId: { in: classFilter } } : classId ? { classId } : {}),
                ...(subjectFilter ? { subjectId: { in: subjectFilter } } : subjectId ? { subjectId } : {}),
            },
            include: {
                student: { select: { id: true, firstName: true, lastName: true, registrationNumber: true } },
                subject: { select: { id: true, name: true, code: true } },
                term: { select: { id: true, name: true, session: { select: { id: true, name: true } } } },
                scores: {
                    include: {
                        component: { select: { id: true, name: true, maxScore: true, order: true } },
                    },
                    orderBy: { component: { order: 'asc' } },
                },
            },
            orderBy: [
                { student: { lastName: 'asc' } },
                { subject: { name: 'asc' } },
            ],
        });

        // When a specific class is requested, also return all students and subjects for that class
        // so the frontend can show a complete picture (including rows with no results yet)
        let classStudents: { id: string; firstName: string; lastName: string; registrationNumber: string | null }[] = [];
        let classSubjects: { id: string; name: string; code: string }[] = [];

        const effectiveClassId = classId || (classFilter?.length === 1 ? classFilter[0] : null);

        if (effectiveClassId) {
            const [studentsRaw, tscRaw] = await Promise.all([
                prisma.student.findMany({
                    where: { classId: effectiveClassId, schoolId: school.id, isActive: true },
                    select: { id: true, firstName: true, lastName: true, registrationNumber: true },
                    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
                }),
                prisma.teacherSubjectClass.findMany({
                    where: { classId: effectiveClassId, schoolId: school.id, isActive: true },
                    select: { subject: { select: { id: true, name: true, code: true } } },
                    distinct: ['subjectId'],
                    orderBy: { subject: { name: 'asc' } },
                }),
            ]);
            classStudents = studentsRaw;
            classSubjects = tscRaw.map((t) => t.subject);
        }

        return NextResponse.json({ results, classStudents, classSubjects });
    } catch (error) {
        console.error('Error fetching results:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST — bulk upsert results (teacher/admin enters marks)
 * Body: { termId, sessionId, classId, entries: [{ studentId, subjectId, scores: [{ componentId, score }] }] }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const user = requireAuth(request);
        if (user instanceof NextResponse) return user;

        if (user.role === 'STUDENT') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const school = await getSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const body = await request.json();
        const { termId, sessionId, classId, entries } = body;

        if (!termId || !sessionId || !classId || !Array.isArray(entries) || entries.length === 0) {
            return NextResponse.json({ error: 'termId, sessionId, classId, and entries[] are required' }, { status: 400 });
        }

        // Validate teacher access if teacher role
        if (user.role === 'TEACHER') {
            const teacher = await prisma.teacher.findFirst({
                where: { userId: user.userId, schoolId: school.id },
                include: {
                    teacherSubjectClasses: { select: { subjectId: true, classId: true } },
                    classesSupervised: { select: { id: true } },
                },
            });

            if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

            const submittedSubjectIds = [...new Set(entries.map((e: { subjectId: string }) => e.subjectId))];
            const assignedSubjectIds = teacher.teacherSubjectClasses
                .filter((t) => t.classId === classId)
                .map((t) => t.subjectId);
            const isSupervisor = teacher.classesSupervised.some((c) => c.id === classId);

            for (const subId of submittedSubjectIds) {
                if (!assignedSubjectIds.includes(subId) && !isSupervisor) {
                    return NextResponse.json(
                        { error: `You are not assigned to teach subject ${subId} in this class` },
                        { status: 403 }
                    );
                }
            }
        }

        // Validate term and session belong to this school
        const term = await prisma.academicTerm.findFirst({
            where: { id: termId, schoolId: school.id },
        });
        if (!term) return NextResponse.json({ error: 'Term not found' }, { status: 404 });

        // Upsert all results in a transaction
        const upsertOps = entries.flatMap(
            (entry: { studentId: string; subjectId: string; scores: { componentId: string; score: number }[] }) => {
                const resultCreateOrConnect = {
                    studentId: entry.studentId,
                    subjectId: entry.subjectId,
                    termId,
                    sessionId,
                    classId,
                    schoolId: school.id,
                };

                return [
                    prisma.result.upsert({
                        where: {
                            studentId_subjectId_termId: {
                                studentId: entry.studentId,
                                subjectId: entry.subjectId,
                                termId,
                            },
                        },
                        update: {},
                        create: resultCreateOrConnect,
                    }),
                ];
            }
        );

        // First pass: ensure Result records exist
        await prisma.$transaction(upsertOps);

        // Second pass: upsert scores
        const scoreOps = [];
        for (const entry of entries) {
            const result = await prisma.result.findUnique({
                where: {
                    studentId_subjectId_termId: {
                        studentId: entry.studentId,
                        subjectId: entry.subjectId,
                        termId,
                    },
                },
            });

            if (!result) continue;

            for (const scoreEntry of entry.scores) {
                scoreOps.push(
                    prisma.resultScore.upsert({
                        where: {
                            resultId_componentId: {
                                resultId: result.id,
                                componentId: scoreEntry.componentId,
                            },
                        },
                        update: { score: parseFloat(String(scoreEntry.score)) },
                        create: {
                            resultId: result.id,
                            componentId: scoreEntry.componentId,
                            score: parseFloat(String(scoreEntry.score)),
                        },
                    })
                );
            }
        }

        await prisma.$transaction(scoreOps);

        return NextResponse.json({ message: 'Results saved successfully', count: entries.length });
    } catch (error) {
        console.error('Error saving results:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/schools/:schoolId/teachers/:teacherId/my-classes
 *
 * Returns:
 *  - taughtClasses  – classes where this teacher has a TeacherSubjectClass row
 *  - supervisedClasses – classes where this teacher is the supervisor (head teacher)
 *
 * Each class object includes the full student list so the frontend can render
 * an expandable accordion without a second round-trip.
 *
 * Query params:
 *  - userId  (optional) – resolve teacher by userId instead of teacherId (DB id)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; teacherId: string }> }
) {
    try {
        const { schoolId, teacherId } = await params;
        const { searchParams } = new URL(request.url);
        const byUserId = searchParams.get('byUserId') === 'true';

        console.log(`[API] Fetching my-classes for ${teacherId} (byUserId: ${byUserId}) in school ${schoolId}`);

        // ── Resolve school ──────────────────────────────────────────────────────
        let school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: { id: true },
        });

        if (!school) {
            school = await prisma.school.findUnique({
                where: { subdomain: schoolId, isActive: true },
                select: { id: true },
            });
        }

        if (!school) {
            console.warn(`[API] School not found: ${schoolId}`);
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const actualSchoolId = school.id;
        console.log(`[API] Resolved actualSchoolId: ${actualSchoolId}`);

        // ── Resolve teacher ─────────────────────────────────────────────────────
        const teacher = await prisma.teacher.findFirst({
            where: byUserId
                ? { userId: teacherId, schoolId: actualSchoolId }
                : { id: teacherId, schoolId: actualSchoolId },
            select: {
                id: true,
                name: true,
                email: true,
                img: true,
                teacherId: true,
            },
        });

        if (!teacher) {
            console.warn(`[API] Teacher not found for userId/teacherId: ${teacherId} in school ${actualSchoolId}`);
            return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
        }

        console.log(`[API] Resolved teacher: ${teacher.name} (ID: ${teacher.id})`);

        // ── Taught classes ──────────────────────────────────────────────────────
        // Fetch all TeacherSubjectClass rows for this teacher, group by class
        const tscRows = await prisma.teacherSubjectClass.findMany({
            where: { teacherId: teacher.id, schoolId: actualSchoolId },
            include: {
                subject: { select: { id: true, name: true, code: true } },
                class: {
                    include: {
                        level: { select: { id: true, name: true } },
                        supervisor: { select: { id: true, name: true } },
                        students: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                gender: true,
                                applicationNumber: true,
                                profileImagePath: true,
                            },
                            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
                        },
                        _count: { select: { students: true, teacherSubjectClasses: true } },
                    },
                },
            },
        });

        // Deduplicate by classId – collect subjects per class
        const taughtMap = new Map<
            string,
            {
                id: string;
                name: string;
                levelName: string;
                levelId: string;
                headTeacher: string;
                supervisorId: string | null;
                studentCount: number;
                subjectCount: number;
                subjects: { id: string; name: string; code: string }[];
                students: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    gender: string;
                    applicationNumber: string;
                    profileImagePath: string | null;
                }[];
                isSupervised: boolean;
            }
        >();

        for (const row of tscRows) {
            const cls = row.class;
            if (!taughtMap.has(cls.id)) {
                taughtMap.set(cls.id, {
                    id: cls.id,
                    name: cls.name,
                    levelName: cls.level.name,
                    levelId: cls.level.id,
                    headTeacher: cls.supervisor?.name ?? 'Not assigned',
                    supervisorId: cls.supervisorId ?? null,
                    studentCount: cls._count.students,
                    subjectCount: cls._count.teacherSubjectClasses,
                    subjects: [],
                    students: cls.students,
                    isSupervised: cls.supervisorId === teacher.id,
                });
            }
            taughtMap.get(cls.id)!.subjects.push({
                id: row.subject.id,
                name: row.subject.name,
                code: row.subject.code,
            });
        }

        const taughtClasses = Array.from(taughtMap.values()).sort((a, b) =>
            a.levelName.localeCompare(b.levelName) || a.name.localeCompare(b.name)
        );

        // ── Supervised classes (head teacher) ───────────────────────────────────
        // Include any supervised class NOT already in taughtClasses
        const taughtClassIds = new Set(taughtClasses.map((c) => c.id));

        const supervisedRaw = await prisma.class.findMany({
            where: { supervisorId: teacher.id, schoolId: actualSchoolId },
            include: {
                level: { select: { id: true, name: true } },
                supervisor: { select: { id: true, name: true } },
                students: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        gender: true,
                        applicationNumber: true,
                        profileImagePath: true,
                    },
                    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
                },
                _count: { select: { students: true, teacherSubjectClasses: true } },
            },
            orderBy: [{ level: { name: 'asc' } }, { name: 'asc' }],
        });

        // Mark taught classes that are also supervised
        for (const cls of supervisedRaw) {
            if (taughtMap.has(cls.id)) {
                taughtMap.get(cls.id)!.isSupervised = true;
            }
        }

        // Only the supervised classes that this teacher does NOT also teach
        const supervisedOnlyClasses = supervisedRaw
            .filter((cls) => !taughtClassIds.has(cls.id))
            .map((cls) => ({
                id: cls.id,
                name: cls.name,
                levelName: cls.level.name,
                levelId: cls.level.id,
                headTeacher: cls.supervisor?.name ?? 'Not assigned',
                supervisorId: cls.supervisorId ?? null,
                studentCount: cls._count.students,
                subjectCount: cls._count.teacherSubjectClasses,
                subjects: [],
                students: cls.students,
                isSupervised: true,
            }));

        return NextResponse.json({
            teacher,
            taughtClasses: Array.from(taughtMap.values()).sort(
                (a, b) =>
                    a.levelName.localeCompare(b.levelName) || a.name.localeCompare(b.name)
            ),
            supervisedOnlyClasses,
        });
    } catch (error) {
        console.error('Error fetching teacher my-classes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

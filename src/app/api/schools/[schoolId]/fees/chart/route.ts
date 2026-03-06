import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 30;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const { searchParams } = new URL(request.url);
        const levelId = searchParams.get('levelId') ?? undefined;
        const classId = searchParams.get('classId') ?? undefined;
        const sessionIdParam = searchParams.get('sessionId') ?? undefined;
        const limitParam = Math.min(
            parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
            MAX_LIMIT
        );

        const school = await prisma.school.findFirst({
            where: {
                OR: [{ id: schoolId }, { subdomain: schoolId }]
            },
            select: { id: true }
        });
        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const sessions = await prisma.academicSession.findMany({
            where: { schoolId: school.id },
            select: { id: true, name: true },
            orderBy: { startDate: 'desc' }
        });

        const activeSession = await prisma.academicSession.findFirst({
            where: { schoolId: school.id, isActive: true },
            select: { id: true, name: true }
        });

        const session = sessionIdParam
            ? sessions.find((s) => s.id === sessionIdParam) ?? activeSession
            : activeSession;

        if (!session) {
            return NextResponse.json({
                sessionName: null,
                sessionId: null,
                data: [],
                levels: [],
                sessions: sessions.map((s) => ({ id: s.id, name: s.name })),
                classes: []
            });
        }

        const levels = await prisma.level.findMany({
            where: { schoolId: school.id },
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        });

        const classWhere: { schoolId: string; levelId?: string; id?: string } = {
            schoolId: school.id
        };
        if (levelId) {
            const levelExists = levels.some((l) => l.id === levelId);
            if (!levelExists) {
                return NextResponse.json({
                    sessionName: session.name,
                    sessionId: session.id,
                    data: [],
                    levels: levels.map((l) => ({ id: l.id, name: l.name })),
                    sessions: sessions.map((s) => ({ id: s.id, name: s.name })),
                    classes: []
                });
            }
            classWhere.levelId = levelId;
        }
        if (classId) classWhere.id = classId;

        const allClasses = await prisma.class.findMany({
            where: classWhere,
            select: {
                id: true,
                name: true,
                levelId: true,
                level: { select: { name: true } }
            },
            orderBy: [{ level: { name: 'asc' } }, { name: 'asc' }]
        });

        const classes = allClasses.slice(0, limitParam);

        const classesInLevelForDropdown = levelId
            ? await prisma.class.findMany({
                  where: { schoolId: school.id, levelId },
                  select: { id: true, name: true },
                  orderBy: { name: 'asc' }
              })
            : [];

        const data: {
            class: string;
            levelName: string;
            classId: string;
            First: number;
            Second: number;
            Third: number;
        }[] = [];

        for (const cls of classes) {
            const totalStudents = await prisma.student.count({
                where: { schoolId: school.id, classId: cls.id }
            });

            if (totalStudents === 0) {
                data.push({
                    class: cls.name,
                    levelName: cls.level.name,
                    classId: cls.id,
                    First: 0,
                    Second: 0,
                    Third: 0
                });
                continue;
            }

            const paidFees = await prisma.studentFee.findMany({
                where: {
                    sessionId: session.id,
                    status: 'PAID',
                    student: { classId: cls.id }
                },
                select: { term: true, studentId: true }
            });

            const firstPaidIds = new Set<string>();
            const secondPaidIds = new Set<string>();
            const thirdPaidIds = new Set<string>();
            for (const f of paidFees) {
                if (f.term === 'FIRST' || f.term === 'FULL_SESSION') firstPaidIds.add(f.studentId);
                if (f.term === 'SECOND' || f.term === 'FULL_SESSION') secondPaidIds.add(f.studentId);
                if (f.term === 'THIRD' || f.term === 'FULL_SESSION') thirdPaidIds.add(f.studentId);
            }

            const first = Math.round((firstPaidIds.size / totalStudents) * 100);
            const second = Math.round((secondPaidIds.size / totalStudents) * 100);
            const third = Math.round((thirdPaidIds.size / totalStudents) * 100);

            data.push({
                class: cls.name,
                levelName: cls.level.name,
                classId: cls.id,
                First: Math.min(100, first),
                Second: Math.min(100, second),
                Third: Math.min(100, third)
            });
        }

        return NextResponse.json({
            sessionName: session.name,
            sessionId: session.id,
            data,
            levels: levels.map((l) => ({ id: l.id, name: l.name })),
            sessions: sessions.map((s) => ({ id: s.id, name: s.name })),
            classes: levelId ? classesInLevelForDropdown : []
        });
    } catch (error) {
        console.error('Error fetching fee chart data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

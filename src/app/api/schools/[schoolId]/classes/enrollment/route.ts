import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const MAX_CLASSES = 10;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const limit = Math.min(
            parseInt(request.nextUrl.searchParams.get('limit') || String(MAX_CLASSES), 10) || MAX_CLASSES,
            MAX_CLASSES
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

        const byClass = await prisma.student.groupBy({
            by: ['classId'],
            where: { schoolId: school.id },
            _count: { id: true }
        });

        if (byClass.length === 0) {
            return NextResponse.json({ data: [] });
        }

        const classIds = byClass.map((c) => c.classId);
        const classes = await prisma.class.findMany({
            where: { id: { in: classIds } },
            select: {
                id: true,
                name: true,
                level: { select: { name: true } }
            }
        });

        const classMap = new Map(classes.map((c) => [c.id, c]));
        const data = byClass
            .map((row) => {
                const cls = classMap.get(row.classId);
                const displayName = cls ? `${cls.level.name} ${cls.name}`.trim() || cls.name : row.classId;
                return {
                    name: displayName,
                    count: row._count.id,
                    levelName: cls?.level.name ?? ''
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
            .map(({ name, count }) => ({ name, count }));

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error fetching class enrollment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

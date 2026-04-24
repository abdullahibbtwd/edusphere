import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const user = requireAuth(request);
        if (user instanceof NextResponse) return user;

        const school = await getSchool(schoolId);
        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        if (user.schoolId && user.schoolId !== school.id && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - You can only view applications for your school' },
                { status: 403 }
            );
        }

        const application = await prisma.studentApplication.findFirst({
            where: {
                userId: user.userId,
                schoolId: school.id
            },
            include: {
                class: {
                    select: { name: true, level: { select: { name: true } } }
                }
            }
        });

        if (!application) {
            return NextResponse.json({ application: null, schoolName: school.name });
        }

        return NextResponse.json({
            application: {
                ...application,
                className: application.class.name,
                levelName: application.class.level.name
            },
            schoolName: school.name
        });

    } catch (error) {
        console.error('Error fetching my application:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

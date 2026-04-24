import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

/**
 * GET - Fetch all timetables for a school
 * Used for verification and debugging
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const sessionUser = requireRole(request, ['ADMIN', 'TEACHER', 'SUPER_ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const { schoolId: schoolIdentifier } = await params;

        // Resolve school ID (handle both subdomain and UUID)
        const resolvedSchool = await getSchool(schoolIdentifier);
        const schoolId = resolvedSchool?.id;

        if (!schoolId) {
            return NextResponse.json(
                { error: 'School not found' },
                { status: 404 }
            );
        }
        if (sessionUser.schoolId && sessionUser.schoolId !== schoolId && sessionUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - You can only view timetables for your school' },
                { status: 403 }
            );
        }

        // Fetch all timetables for this school
        const timetables = await prisma.timetable.findMany({
            where: { schoolId },
            include: {
                class: {
                    include: {
                        level: true
                    }
                }
            },
            orderBy: [
                { class: { level: { name: 'asc' } } },
                { class: { name: 'asc' } },
                { term: 'asc' }
            ]
        });


        // Format the response
        const formattedTimetables = timetables.map(tt => ({
            id: tt.id,
            classId: tt.classId,
            className: `${tt.class.level.name} ${tt.class.name}`,
            levelName: tt.class.level.name,
            term: tt.term,
            schedule: tt.schedule,
            createdAt: tt.createdAt,
            updatedAt: tt.updatedAt
        }));

        return NextResponse.json({
            success: true,
            count: formattedTimetables.length,
            timetables: formattedTimetables
        });

    } catch (error: any) {
        console.error('Error fetching timetables:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch timetables' },
            { status: 500 }
        );
    }
}

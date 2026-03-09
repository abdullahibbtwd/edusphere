import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

        console.log(`📋 Fetching timetables for school ID: ${schoolId}`);

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

        console.log(`✅ Found ${timetables.length} timetable(s)`);

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

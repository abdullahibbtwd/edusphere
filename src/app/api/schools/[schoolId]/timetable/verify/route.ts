import { NextRequest, NextResponse } from 'next/server';
import { verifyAllTimetables } from '@/lib/timetable/verify-conflicts';

/**
 * Resolve school ID from subdomain or UUID
 */
async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
    const { prisma } = await import('@/lib/db');

    let school = await prisma.school.findUnique({
        where: { id: schoolIdentifier },
        select: { id: true }
    });

    if (!school) {
        school = await prisma.school.findUnique({
            where: {
                subdomain: schoolIdentifier,
                isActive: true
            },
            select: { id: true }
        });
    }

    return school?.id || null;
}

/**
 * GET - Verify all timetables for conflicts
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: schoolIdentifier } = await params;
        const { searchParams } = new URL(request.url);
        const term = searchParams.get('term');

        if (!term) {
            return NextResponse.json(
                { error: 'Missing term parameter' },
                { status: 400 }
            );
        }

        const schoolId = await resolveSchoolId(schoolIdentifier);
        if (!schoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        // Run verification
        const result = await verifyAllTimetables(schoolId, term);

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error: any) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify timetables' },
            { status: 500 }
        );
    }
}

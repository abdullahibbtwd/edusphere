import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { verifyAllTimetables } from '@/lib/timetable/verify-conflicts';
import { getSchool } from '@/lib/school';

/**
 * GET - Verify all timetables for conflicts
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const sessionUser = requireRole(request, ['ADMIN', 'TEACHER', 'SUPER_ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const { schoolId: schoolIdentifier } = await params;
        const { searchParams } = new URL(request.url);
        const term = searchParams.get('term');

        if (!term) {
            return NextResponse.json(
                { error: 'Missing term parameter' },
                { status: 400 }
            );
        }

        const resolvedSchool = await getSchool(schoolIdentifier);
        const schoolId = resolvedSchool?.id;
        if (!schoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        if (sessionUser.schoolId && sessionUser.schoolId !== schoolId && sessionUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const sessionUser = requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const { schoolId } = await params;
        const body = await request.json();
        const { updates } = body; // Array of { id: string, requiresDoublePeriod: boolean }

        if (!Array.isArray(updates)) {
            return NextResponse.json({ error: 'Invalid updates format' }, { status: 400 });
        }

        const school = await getSchool(schoolId);
        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        if (sessionUser.schoolId && sessionUser.schoolId !== school.id && sessionUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Process updates
        // Using transaction for atomicity
        const results = await prisma.$transaction(
            updates.map((update: { id: string; requiresDoublePeriod: boolean }) =>
                prisma.teacherSubjectClass.updateMany({
                    where: { id: update.id, schoolId: school.id },
                    data: { requiresDoublePeriod: update.requiresDoublePeriod }
                })
            )
        );

        return NextResponse.json({
            message: 'Updated successfully',
            updatedCount: results.reduce((sum, r) => sum + r.count, 0)
        });

    } catch (error) {
        console.error('Error updating double periods:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';
import { requireRole } from '@/lib/auth-middleware';

// PUT - Update a term
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; sessionId: string; termId: string }> }
) {
    const sessionUser = requireRole(request, ['ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    try {
        const { schoolId, sessionId, termId } = await params;
        const resolvedSchool = await getSchool(schoolId);
        const actualSchoolId = resolvedSchool?.id;
        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        if (sessionUser.schoolId && sessionUser.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Forbidden - You can only manage your school calendar' }, { status: 403 });
        }

        const body = await request.json();
        const { startDate, endDate, isActive } = body;

        // Validation
        if (!startDate || !endDate) {
            return NextResponse.json({ error: 'Missing dates' }, { status: 400 });
        }

        // Verify session dates first?
        const session = await prisma.academicSession.findUnique({
            where: { id: sessionId }
        });

        if (!session || session.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
        }

        if (new Date(startDate) < session.startDate || new Date(endDate) > session.endDate) {
            return NextResponse.json({ error: 'Term dates must be within Session dates' }, { status: 400 });
        }

        const existingTerm = await prisma.academicTerm.findUnique({
            where: { id: termId },
            select: { id: true, schoolId: true, sessionId: true }
        });
        if (!existingTerm || existingTerm.schoolId !== actualSchoolId || existingTerm.sessionId !== sessionId) {
            return NextResponse.json({ error: 'Term not found' }, { status: 404 });
        }

        const term = await prisma.$transaction(async (tx) => {
            if (isActive) {
                // Deactivate other terms in this session
                await tx.academicTerm.updateMany({
                    where: {
                        sessionId: sessionId,
                        id: { not: termId }
                    },
                    data: { isActive: false }
                });
            }

            return await tx.academicTerm.update({
                where: { id: termId },
                data: {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    isActive: isActive !== undefined ? isActive : undefined
                }
            });
        });

        return NextResponse.json({
            success: true,
            term
        });

    } catch (error) {
        console.error('Error updating term:', error);
        return NextResponse.json({ error: 'Failed to update term' }, { status: 500 });
    }
}

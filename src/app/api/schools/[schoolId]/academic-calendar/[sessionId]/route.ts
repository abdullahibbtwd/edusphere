import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';
import { requireRole } from '@/lib/auth-middleware';

// PUT - Update a specific Academic Session
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; sessionId: string }> }
) {
    const sessionUser = requireRole(request, ['ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    try {
        const { schoolId, sessionId } = await params;
        const resolvedSchool = await getSchool(schoolId);
        const actualSchoolId = resolvedSchool?.id;
        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        if (sessionUser.schoolId && sessionUser.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Forbidden - You can only manage your school calendar' }, { status: 403 });
        }

        const body = await request.json();
        const { name, startDate, endDate, isActive } = body;

        // Validation
        if (!name || !startDate || !endDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingSession = await prisma.academicSession.findUnique({
            where: { id: sessionId },
            select: { id: true, schoolId: true }
        });
        if (!existingSession || existingSession.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const session = await prisma.$transaction(async (tx) => {
            // If setting this session as active, deactivate others
            if (isActive) {
                await tx.academicSession.updateMany({
                    where: {
                        schoolId: actualSchoolId,
                        id: { not: sessionId }
                    },
                    data: { isActive: false }
                });
            }

            return await tx.academicSession.update({
                where: { id: sessionId },
                data: {
                    name,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    isActive: isActive !== undefined ? isActive : undefined,
                }
            });
        });

        return NextResponse.json({
            success: true,
            session
        });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Error updating session:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Session name already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }
}

// DELETE - Delete a session
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; sessionId: string }> }
) {
    const sessionUser = requireRole(request, ['ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    try {
        const { schoolId, sessionId } = await params;
        const resolvedSchool = await getSchool(schoolId);
        const actualSchoolId = resolvedSchool?.id;
        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        if (sessionUser.schoolId && sessionUser.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Forbidden - You can only manage your school calendar' }, { status: 403 });
        }

        const existingSession = await prisma.academicSession.findUnique({
            where: { id: sessionId },
            select: { id: true, schoolId: true }
        });
        if (!existingSession || existingSession.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        await prisma.academicSession.delete({
            where: { id: sessionId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }
}

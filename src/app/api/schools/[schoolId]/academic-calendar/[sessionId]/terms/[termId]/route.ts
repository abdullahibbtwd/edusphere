import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Term } from '@prisma/client';
import { getSchool } from '@/lib/school';

// PUT - Update a term
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; sessionId: string; termId: string }> }
) {
    try {
        const { schoolId, sessionId, termId } = await params;
        const school = await getSchool(schoolId);
        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
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

        if (session) {
            if (new Date(startDate) < session.startDate || new Date(endDate) > session.endDate) {
                return NextResponse.json({ error: 'Term dates must be within Session dates' }, { status: 400 });
            }
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

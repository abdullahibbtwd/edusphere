import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';

/**
 * GET - For admin: which terms (and full session) are already PAID for a student in a session.
 * Query: studentId, sessionId
 * Returns: { paidTerms: string[], fullSessionPaid: boolean }
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const sessionUser = requireRole(request, ['ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');
        const sessionId = searchParams.get('sessionId');

        if (!studentId || !sessionId) {
            return NextResponse.json(
                { error: 'studentId and sessionId are required' },
                { status: 400 }
            );
        }

        const actualSchool = await prisma.school.findFirst({
            where: {
                OR: [{ id: schoolId }, { subdomain: schoolId }]
            },
            select: { id: true }
        });
        if (!actualSchool) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const fees = await prisma.studentFee.findMany({
            where: {
                studentId,
                sessionId,
                status: 'PAID'
            },
            select: { term: true }
        });

        const fullSessionPaid = fees.some(f => f.term === 'FULL_SESSION');
        const paidTerms = fees
            .filter(f => ['FIRST', 'SECOND', 'THIRD'].includes(f.term))
            .map(f => f.term);

        return NextResponse.json({
            paidTerms,
            fullSessionPaid
        });
    } catch (error) {
        console.error('Error fetching student session fee status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

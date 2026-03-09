import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

/**
 * GET - Get receipt data for the current student for a given session and term.
 * Used for download/print receipt (payments made by student or recorded by admin).
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const sessionUser = requireRole(request, ['STUDENT']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const resolvedSchool = await getSchool(schoolId);
        if (!resolvedSchool) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        const actualSchoolId = resolvedSchool.id;

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const term = searchParams.get('term');

        if (!sessionId || !term) {
            return NextResponse.json({ error: 'sessionId and term are required' }, { status: 400 });
        }

        const userId = (sessionUser as any).userId;
        const student = await prisma.student.findFirst({
            where: { userId, schoolId: actualSchoolId },
            include: {
                school: { select: { name: true } },
                class: {
                    include: {
                        level: { select: { name: true } }
                    }
                }
            }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
        }

        const studentFee = await prisma.studentFee.findUnique({
            where: {
                studentId_sessionId_term: {
                    studentId: student.id,
                    sessionId,
                    term: term as any
                }
            },
            include: {
                session: { select: { name: true } },
                payments: { orderBy: { paymentDate: 'desc' } }
            }
        });

        if (!studentFee || studentFee.amountPaid <= 0) {
            return NextResponse.json(
                { error: 'No payment found for this session and term' },
                { status: 404 }
            );
        }

        const studentName = `${student.firstName} ${student.lastName}`;
        const schoolName = student.school?.name || '';

        return NextResponse.json({
            success: true,
            receipt: {
                schoolName,
                studentName,
                sessionName: studentFee.session.name,
                term: studentFee.term,
                totalDue: studentFee.totalAmount,
                totalPaid: studentFee.amountPaid,
                balance: studentFee.totalAmount - studentFee.amountPaid,
                status: studentFee.status,
                payments: studentFee.payments.map(p => ({
                    amount: p.amount,
                    paymentDate: p.paymentDate,
                    method: p.method || 'N/A',
                    reference: p.reference || 'N/A'
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching receipt:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

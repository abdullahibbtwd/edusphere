import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

/**
 * GET - Fetch current student's fee records and payment status (by session/term).
 * Student can see all their fees whether paid here or recorded by admin.
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

        const userId = (sessionUser as any).userId;
        const student = await prisma.student.findFirst({
            where: { userId, schoolId: actualSchoolId },
            include: {
                class: { include: { level: { select: { name: true } } } }
            }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student record not found for this school' }, { status: 404 });
        }

        const studentFeesRaw = await prisma.studentFee.findMany({
            where: { studentId: student.id },
            include: {
                session: { select: { id: true, name: true, isActive: true, startDate: true } },
                payments: { orderBy: { paymentDate: 'desc' } }
            }
        });
        const studentFees = studentFeesRaw.sort((a, b) => {
            const dateA = a.session.startDate.getTime();
            const dateB = b.session.startDate.getTime();
            if (dateB !== dateA) return dateB - dateA;
            const termOrder = { FIRST: 1, SECOND: 2, THIRD: 3, FULL_SESSION: 4 };
            return (termOrder[a.term] ?? 0) - (termOrder[b.term] ?? 0);
        });

        // Current session & term: use student's current session and school's active term for that session
        let currentSessionSummary: {
            sessionId: string | null;
            sessionName: string | null;
            currentTerm: string | null;
            totalDue: number;
            amountPaidForSession: number;
            balance: number;
            isSessionPaid: boolean;
            feeForCurrentTerm: number;
        } = {
            sessionId: null,
            sessionName: null,
            currentTerm: null,
            totalDue: 0,
            amountPaidForSession: 0,
            balance: 0,
            isSessionPaid: false,
            feeForCurrentTerm: 0
        };

        const currentSessionId = student.currentSessionId;
        if (currentSessionId && student.classId) {
            const [session, activeTerm, feeStructures] = await Promise.all([
                prisma.academicSession.findUnique({
                    where: { id: currentSessionId },
                    select: { id: true, name: true }
                }),
                prisma.academicTerm.findFirst({
                    where: { sessionId: currentSessionId, schoolId: actualSchoolId, isActive: true },
                    select: { name: true }
                }),
                prisma.feeStructure.findMany({
                    where: { sessionId: currentSessionId, classId: student.classId },
                    select: { term: true, amount: true }
                })
            ]);

            const feeMap: Record<string, number> = {};
            feeStructures.forEach(fs => { feeMap[fs.term] = fs.amount; });
            const currentTerm = activeTerm?.name ?? null;
            const feeForCurrentTerm = (currentTerm && feeMap[currentTerm]) ? feeMap[currentTerm] : 0;
            const fullSessionFee = feeMap['FULL_SESSION'] ?? 0;

            const feesForCurrentSession = studentFeesRaw.filter(sf => sf.sessionId === currentSessionId);
            const amountPaidForSession = feesForCurrentSession.reduce((sum, sf) => sum + sf.amountPaid, 0);
            const fullSessionRecord = feesForCurrentSession.find(sf => sf.term === 'FULL_SESSION');
            const isSessionPaid = !!(fullSessionRecord && fullSessionRecord.status === 'PAID');

            let totalDue: number;
            if (isSessionPaid) {
                totalDue = 0;
            } else if (currentTerm && feeForCurrentTerm > 0) {
                totalDue = feeForCurrentTerm;
            } else if (fullSessionFee > 0) {
                totalDue = fullSessionFee;
            } else {
                totalDue = (feeMap['FIRST'] ?? 0) + (feeMap['SECOND'] ?? 0) + (feeMap['THIRD'] ?? 0);
            }
            const balance = totalDue - amountPaidForSession;

            currentSessionSummary = {
                sessionId: currentSessionId,
                sessionName: session?.name ?? null,
                currentTerm,
                totalDue,
                amountPaidForSession,
                balance: balance > 0 ? balance : 0,
                isSessionPaid,
                feeForCurrentTerm
            };
        }

        return NextResponse.json({
            success: true,
            student: {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                className: student.class?.name,
                levelName: student.class?.level?.name
            },
            currentSessionSummary,
            fees: studentFees.map(sf => ({
                id: sf.id,
                sessionId: sf.sessionId,
                sessionName: sf.session.name,
                sessionActive: sf.session.isActive,
                term: sf.term,
                totalAmount: sf.totalAmount,
                amountPaid: sf.amountPaid,
                balance: sf.totalAmount - sf.amountPaid,
                status: sf.status,
                payments: sf.payments.map(p => ({
                    id: p.id,
                    amount: p.amount,
                    paymentDate: p.paymentDate,
                    method: p.method,
                    reference: p.reference
                }))
            }))
        });
    } catch (error) {
        console.error('Error fetching my payments:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

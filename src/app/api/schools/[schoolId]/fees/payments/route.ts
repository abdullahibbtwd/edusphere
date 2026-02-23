import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';

// POST - Record a student fee payment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;

        // Security Check
        const sessionUser = requireRole(request, ['ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const body = await request.json();
        const { studentId, sessionId, term, amount, method, reference } = body;

        if (!studentId || !sessionId || !term || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Find or create the StudentFee record for this term/session
        // We first check if a fee structure exists to know the totalAmount
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { classId: true, schoolId: true }
        });

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        const structure = await prisma.feeStructure.findFirst({
            where: {
                schoolId: student.schoolId,
                sessionId,
                classId: student.classId,
                term
            }
        });

        const totalAmount = structure?.amount || 0;

        // Use a transaction to ensure Payment and StudentFee update are atomic
        const result = await prisma.$transaction(async (tx) => {
            const studentFee = await tx.studentFee.upsert({
                where: {
                    studentId_sessionId_term: {
                        studentId,
                        sessionId,
                        term: term as any
                    }
                },
                update: {
                    amountPaid: { increment: amount }
                },
                create: {
                    studentId,
                    sessionId,
                    term: term as any,
                    totalAmount,
                    amountPaid: amount
                }
            });

            // Update status based on payment
            const newStatus = studentFee.amountPaid >= studentFee.totalAmount ? 'PAID' : (studentFee.amountPaid > 0 ? 'PARTIAL' : 'UNPAID');

            const updatedStudentFee = await tx.studentFee.update({
                where: { id: studentFee.id },
                data: { status: newStatus },
                include: {
                    student: {
                        include: { school: true }
                    },
                    session: true
                }
            });

            const payment = await tx.feePayment.create({
                data: {
                    studentFeeId: studentFee.id,
                    amount,
                    method,
                    reference,
                    recordedBy: (sessionUser as any).id
                }
            });

            // If term is FULL_SESSION, update student paymentPlan to SESSION
            if (term === 'FULL_SESSION') {
                await tx.student.update({
                    where: { id: studentId },
                    data: { paymentPlan: 'SESSION' }
                });
            }

            return { studentFee: updatedStudentFee, payment };
        });

        // Send Payment Confirmation Email
        try {
            const { sendFeePaymentEmail } = await import('@/lib/email-service');
            await sendFeePaymentEmail({
                to: result.studentFee.student.email || "",
                studentName: `${result.studentFee.student.firstName} ${result.studentFee.student.lastName}`,
                schoolName: result.studentFee.student.school.name,
                sessionName: result.studentFee.session.name,
                term: term as string,
                amountPaid: amount,
                totalPaid: result.studentFee.amountPaid,
                totalDue: result.studentFee.totalAmount,
                method: method || "CASH",
                reference: reference || "N/A"
            });
        } catch (emailError) {
            console.error('Failed to send payment email:', emailError);
        }

        return NextResponse.json({ success: true, ...result });

        return NextResponse.json({ success: true, ...result });

    } catch (error) {
        console.error('Error recording payment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

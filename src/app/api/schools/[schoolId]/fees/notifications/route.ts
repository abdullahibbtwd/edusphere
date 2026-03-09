import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { sendFeeReminderEmail } from '@/lib/email-service';
import { getSchool } from '@/lib/school';

// POST - Send notifications to students/parents for unpaid fees
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const sessionUser = requireRole(request, ['ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const body = await request.json();
        const { sessionId, term, classId } = body;

        if (!sessionId || !term) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const actualSchool = await getSchool(schoolId);
        if (!actualSchool) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        // Find students with outstanding fees for this session and term
        // If classId is provided, filter by class
        const unpaidFees = await prisma.studentFee.findMany({
            where: {
                sessionId,
                term,
                status: { in: ['UNPAID', 'PARTIAL'] },
                student: {
                    schoolId: actualSchool.id,
                    isRegistered: true,
                    isActive: true,
                    ...(classId && { classId })
                }
            },
            include: {
                student: true,
                session: true
            }
        });

        if (unpaidFees.length === 0) {
            return NextResponse.json({ message: 'No students with outstanding fees found.' });
        }

        // Send emails
        let sentCount = 0;
        let failedCount = 0;

        for (const record of unpaidFees) {
            try {
                const recipients: string[] = [];
                if (record.student.email) recipients.push(record.student.email);
                if (record.student.parentEmail) recipients.push(record.student.parentEmail);

                if (recipients.length > 0) {
                    await sendFeeReminderEmail({
                        to: recipients,
                        studentName: `${record.student.firstName} ${record.student.lastName}`,
                        schoolName: actualSchool.name,
                        sessionName: record.session.name,
                        term: record.term,
                        amountDue: record.totalAmount,
                        amountPaid: record.amountPaid
                    });
                    sentCount++;
                }
            } catch (err) {
                console.error(`Failed to send email to student ${record.student.id}:`, err);
                failedCount++;
            }
        }

        return NextResponse.json({
            message: `Notifications process complete. Sent: ${sentCount}, Failed: ${failedCount}`,
            sentCount,
            failedCount
        });

    } catch (error) {
        console.error('Error sending fee notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

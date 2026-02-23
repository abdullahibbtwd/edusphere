import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';

// PATCH - Update student details (Registration status, etc.)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string, studentId: string }> }
) {
    try {
        const { schoolId, studentId } = await params;

        // Security Check
        const sessionUser = requireRole(request, ['ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const body = await request.json();
        const { isRegistered, registrationNumber, classId, status, isActive, exitReason, graduationDate } = body;

        // Resolve School
        let school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: { id: true, subdomain: true }
        });

        if (!school) {
            school = await prisma.school.findUnique({
                where: { subdomain: schoolId, isActive: true },
                select: { id: true, subdomain: true }
            });
        }

        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        // Verify student belongs to school
        const student = await prisma.student.findUnique({
            where: { id: studentId, schoolId: school.id }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Handle initial registration logic if being registered for the first time
        let finalRegNumber = registrationNumber;
        if (isRegistered === true && !student.isRegistered && !finalRegNumber) {
            // Updated registration number generation: [SchoolChar][Year]/[SequentialNumber]
            const year = new Date().getFullYear();
            const count = await prisma.student.count({
                where: { schoolId: school.id, isRegistered: true }
            });

            // Get first character of school name
            const schoolName = school.name || school.subdomain;
            const prefix = schoolName.charAt(0).toUpperCase();

            finalRegNumber = `${prefix}${year}/${(count + 1).toString().padStart(4, '0')}`;
        }

        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: {
                isRegistered: isRegistered !== undefined ? isRegistered : undefined,
                registrationNumber: finalRegNumber,
                classId: classId || undefined,
                status: status || undefined,
                isActive: isActive !== undefined ? isActive : undefined,
                exitReason: exitReason || undefined,
                graduationDate: graduationDate ? new Date(graduationDate) : undefined,
                registrationDate: isRegistered === true && !student.isRegistered ? new Date() : undefined
            }
        });

        // Send Registration Email if newly registered
        if (isRegistered === true && !student.isRegistered) {
            try {
                // I will update email-service.ts next to include this function
                const { sendStudentRegistrationEmail } = await import('@/lib/email-service');
                await sendStudentRegistrationEmail(
                    updatedStudent.email || student.email,
                    `${updatedStudent.firstName} ${updatedStudent.lastName}`,
                    schoolName,
                    updatedStudent.registrationNumber!
                );
            } catch (emailError) {
                console.error('Failed to send registration email:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            student: updatedStudent
        });

    } catch (error) {
        console.error('Error updating student:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET - Get single student details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string, studentId: string }> }
) {
    try {
        const { schoolId, studentId } = await params;

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                class: {
                    include: { level: true }
                },
                admissionSession: true,
                currentSession: true,
                feeRecords: {
                    include: { payments: true }
                }
            }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json({ student });

    } catch (error) {
        console.error('Error fetching student:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

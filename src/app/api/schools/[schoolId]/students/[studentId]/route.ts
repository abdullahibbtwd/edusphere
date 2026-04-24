import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

// PATCH - Update student details (Registration status, etc.)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string, studentId: string }> }
) {
    try {
        const { schoolId, studentId } = await params;

        // Security Check
        const sessionUser = requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const body = await request.json();
        const { isRegistered, registrationNumber, classId, status, isActive, exitReason, graduationDate } = body;

        const school = await getSchool(schoolId);
        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        if (sessionUser.schoolId && sessionUser.schoolId !== school.id && sessionUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - You can only manage students for your school' },
                { status: 403 }
            );
        }

        // Verify student belongs to school
        const student = await prisma.student.findFirst({
            where: { id: studentId, schoolId: school.id }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }
        if (classId) {
            const cls = await prisma.class.findFirst({
                where: { id: classId, schoolId: school.id },
                select: { id: true }
            });
            if (!cls) {
                return NextResponse.json({ error: 'Class not found for this school' }, { status: 404 });
            }
        }

        // Handle initial registration logic if being registered for the first time
        let finalRegNumber = registrationNumber;
        if (isRegistered === true && !student.isRegistered && !finalRegNumber) {
            // Student ID format: {SubdomainFirstLetter}STU-{5-digit number} e.g. ESTU-00001
            const count = await prisma.student.count({
                where: { schoolId: school.id, isRegistered: true }
            });
            const subdomain = (school.subdomain || school.id).trim();
            const prefix = subdomain.charAt(0).toUpperCase() || 'S';
            finalRegNumber = `${prefix}STU-${(count + 1).toString().padStart(5, '0')}`;
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
                const schoolName = school.name || school.subdomain || 'School';
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
        const sessionUser = requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const school = await getSchool(schoolId);
        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        if (sessionUser.schoolId && sessionUser.schoolId !== school.id && sessionUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - You can only view students for your school' },
                { status: 403 }
            );
        }

        const student = await prisma.student.findFirst({
            where: { id: studentId, schoolId: school.id },
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

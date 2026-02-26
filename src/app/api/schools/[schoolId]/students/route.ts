import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// GET - Fetch students for a school
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const query = searchParams.get('query');
        const classId = searchParams.get('classId');
        const levelId = searchParams.get('levelId');
        const isRegistered = searchParams.get('isRegistered');
        const paymentPlan = searchParams.get('paymentPlan');

        const skip = (page - 1) * limit;

        const actualSchoolId = await prisma.school.findFirst({
            where: {
                OR: [
                    { id: schoolId },
                    { subdomain: schoolId }
                ]
            },
            select: { id: true, name: true }
        });

        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const where: any = { schoolId: actualSchoolId.id };

        if (query) {
            where.OR = [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { registrationNumber: { contains: query, mode: 'insensitive' } }
            ];
        }

        if (classId) {
            where.classId = classId;
        }

        if (levelId) {
            where.class = {
                levelId: levelId
            };
        }

        if (isRegistered !== null && isRegistered !== undefined) {
            where.isRegistered = isRegistered === 'true';
        }

        if (paymentPlan) {
            where.paymentPlan = paymentPlan as 'TERM' | 'SESSION';
        }

        const students = await prisma.student.findMany({
            where,
            include: {
                class: {
                    include: {
                        level: { select: { name: true } }
                    }
                },
                admissionSession: { select: { name: true } },
                currentSession: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        const totalCount = await prisma.student.count({ where });

        // Fee status for current/active session
        const activeSession = await prisma.academicSession.findFirst({
            where: { schoolId: actualSchoolId.id, isActive: true },
            select: { id: true }
        });
        let feeStatusByStudentId: Record<string, { label: string; termsPaid: string[]; isFullSessionPaid: boolean }> = {};
        if (activeSession && students.length > 0) {
            const studentIds = students.map(s => s.id);
            const fees = await prisma.studentFee.findMany({
                where: { studentId: { in: studentIds }, sessionId: activeSession.id },
                select: { studentId: true, term: true, status: true }
            });
            const termOrder = ['FIRST', 'SECOND', 'THIRD'];
            studentIds.forEach(id => {
                const studentFees = fees.filter(f => f.studentId === id);
                const fullSession = studentFees.find(f => f.term === 'FULL_SESSION');
                const isFullSessionPaid = !!(fullSession && fullSession.status === 'PAID');
                const termsPaid = termOrder.filter(t => {
                    const rec = studentFees.find(f => f.term === t);
                    return rec && rec.status === 'PAID';
                });
                let label: string;
                if (isFullSessionPaid) label = 'Full session paid';
                else if (termsPaid.length === 0) label = 'Unpaid';
                else if (termsPaid.length === 1) label = '1 term paid';
                else if (termsPaid.length === 2) label = '2 terms paid';
                else label = 'Full session paid';
                feeStatusByStudentId[id] = { label, termsPaid, isFullSessionPaid };
            });
        }

        const isPlaceholderEmail = (e: string) => e.endsWith('@student.local');

        return NextResponse.json({
            students: students.map(s => ({
                id: s.id,
                firstName: s.firstName,
                lastName: s.lastName,
                email: isPlaceholderEmail(s.email) ? null : s.email,
                phone: s.phone,
                registrationNumber: s.registrationNumber,
                isRegistered: s.isRegistered,
                status: s.status,
                photo: s.profileImagePath || '/avatar.png',
                levelName: s.class?.level?.name || "",
                className: s.class?.name || "",
                classId: s.classId,
                levelId: s.class?.levelId,
                paymentPlan: s.paymentPlan,
                admissionSession: s.admissionSession?.name,
                currentSession: s.currentSession?.name,
                createdAt: s.createdAt.toISOString(),
                feeStatus: feeStatusByStudentId[s.id] ?? { label: 'Unpaid', termsPaid: [], isFullSessionPaid: false }
            })),
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            },
            schoolName: actualSchoolId.name
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new student and optionally a user account (so they can login with email or phone)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;

        const sessionUser = requireRole(request, ['ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const body = await request.json();
        const {
            firstName,
            lastName,
            email: rawEmail,
            phone,
            classId,
            gender,
            dob,
            address,
            paymentPlan,
            password
        } = body;

        const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';
        const phoneTrimmed = typeof phone === 'string' ? phone.trim() : '';

        if (!firstName?.trim() || !lastName?.trim()) {
            return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
        }
        if (!phoneTrimmed && !email) {
            return NextResponse.json({ error: 'At least email or phone is required' }, { status: 400 });
        }
        if (!password || String(password).length < 6) {
            return NextResponse.json({ error: 'Password is required and must be at least 6 characters' }, { status: 400 });
        }
        if (!classId) {
            return NextResponse.json({ error: 'Class is required' }, { status: 400 });
        }

        const actualSchool = await prisma.school.findFirst({
            where: {
                OR: [{ id: schoolId }, { subdomain: schoolId }]
            }
        });

        if (!actualSchool) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const activeSession = await prisma.academicSession.findFirst({
            where: { schoolId: actualSchool.id, isActive: true }
        });

        const studentClass = await prisma.class.findUnique({
            where: { id: classId },
            include: { level: true }
        });

        const hasRealEmail = email.length > 0 && email.includes('@');

        if (hasRealEmail) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
            }
        } else if (phoneTrimmed) {
            const existingByPhone = await prisma.user.findFirst({
                where: { phone: phoneTrimmed, schoolId: actualSchool.id }
            });
            if (existingByPhone) {
                return NextResponse.json({ error: 'A user with this phone number already exists in this school' }, { status: 409 });
            }
        }

        const hashedPassword = await bcrypt.hash(String(password), 12);
        const studentName = `${firstName.trim()} ${lastName.trim()}`;

        let userId: string | null = null;
        let requireOtp = false;
        let userEmail = email;
        let userPhone: string | null = phoneTrimmed || null;

        if (hasRealEmail) {
            const verificationCode = crypto.randomInt(100000, 999999).toString();
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            const newUser = await prisma.user.create({
                data: {
                    email: userEmail,
                    name: studentName,
                    password: hashedPassword,
                    isEmailVerified: false,
                    emailVerificationCode: verificationCode,
                    emailVerificationExpires: verificationExpires,
                    role: 'STUDENT',
                    schoolId: actualSchool.id
                }
            });
            userId = newUser.id;

            try {
                const { sendVerificationEmail } = await import('@/lib/email-service');
                await sendVerificationEmail(userEmail, studentName, verificationCode);
            } catch (emailErr) {
                console.error('Failed to send verification email:', emailErr);
            }
            requireOtp = true;
        } else {
            const placeholderEmail = `s-${actualSchool.id}-${crypto.randomBytes(6).toString('hex')}@student.local`;
            userEmail = placeholderEmail;

            const newUser = await prisma.user.create({
                data: {
                    email: placeholderEmail,
                    name: studentName,
                    phone: userPhone,
                    password: hashedPassword,
                    isEmailVerified: true,
                    role: 'STUDENT',
                    schoolId: actualSchool.id
                }
            });
            userId = newUser.id;
        }

        const student = await prisma.student.create({
            data: {
                schoolId: actualSchool.id,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: userEmail,
                phone: phoneTrimmed || 'N/A',
                classId,
                gender: (gender && String(gender).toUpperCase()) || 'MALE',
                dob: dob ? new Date(dob) : new Date(),
                address: address?.trim() || 'N/A',
                state: 'N/A',
                lga: 'N/A',
                religion: 'N/A',
                parentName: `${lastName} Family`,
                parentRelationship: 'PARENT',
                parentEmail: hasRealEmail ? email : '',
                parentPhone: phoneTrimmed || '',
                paymentPlan: paymentPlan || 'TERM',
                isRegistered: false,
                status: 'ADMITTED',
                admissionSessionId: activeSession?.id ?? undefined,
                currentSessionId: activeSession?.id ?? undefined,
                isActive: true,
                userId
            }
        });

        return NextResponse.json({
            success: true,
            requireOtp,
            student: {
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phone: student.phone,
                userId: student.userId
            }
        });
    } catch (error) {
        console.error('Error creating student:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

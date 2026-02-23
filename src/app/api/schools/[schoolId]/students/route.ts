import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';

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

        return NextResponse.json({
            students: students.map(s => ({
                id: s.id,
                firstName: s.firstName,
                lastName: s.lastName,
                email: s.email,
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
                createdAt: s.createdAt.toISOString()
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

// POST - Create a new student directly
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
        const {
            firstName,
            lastName,
            email,
            phone,
            classId,
            gender,
            dob,
            address,
            paymentPlan
        } = body;

        // Resolve School
        const actualSchool = await prisma.school.findFirst({
            where: {
                OR: [
                    { id: schoolId },
                    { subdomain: schoolId }
                ]
            }
        });

        if (!actualSchool) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        // Get active session
        const activeSession = await prisma.academicSession.findFirst({
            where: { schoolId: actualSchool.id, isActive: true }
        });

        // Get class info
        const studentClass = await prisma.class.findUnique({
            where: { id: classId },
            include: { level: true }
        });

        const className = studentClass ? `${studentClass.level.name}${studentClass.name}` : "";

        const student = await prisma.student.create({
            data: {
                schoolId: actualSchool.id,
                firstName,
                lastName,
                email,
                phone,
                classId,
                gender: gender?.toUpperCase() || "MALE",
                dob: dob ? new Date(dob) : new Date(),
                address: address || "N/A",
                state: "N/A",
                lga: "N/A",
                religion: "N/A",
                parentName: `${lastName} Family`,
                parentRelationship: "PARENT",
                parentEmail: email || "",
                parentPhone: phone || "",
                paymentPlan: paymentPlan || 'TERM',
                isRegistered: false,
                status: 'ADMITTED',
                admissionSessionId: activeSession?.id,
                currentSessionId: activeSession?.id,
                isActive: true
            }
        });

        return NextResponse.json({
            success: true,
            student
        });

    } catch (error) {
        console.error('Error creating student:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

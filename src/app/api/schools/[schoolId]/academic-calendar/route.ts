import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';
import { requireAuth, requireRole } from '@/lib/auth-middleware';

// GET - Fetch all sessions, ensuring one is active
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    const sessionUser = requireAuth(request);
    if (sessionUser instanceof NextResponse) return sessionUser;

    try {
        const { schoolId } = await params;
        const resolvedSchool = await getSchool(schoolId);
        const actualSchoolId = resolvedSchool?.id;
        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        if (sessionUser.schoolId && sessionUser.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Forbidden - You can only access your school calendar' }, { status: 403 });
        }

        const sessions = await prisma.academicSession.findMany({
            where: { schoolId: actualSchoolId },
            include: {
                terms: {
                    orderBy: { startDate: 'asc' },
                    include: {
                        events: true
                    }
                }
            },
            orderBy: { startDate: 'desc' }
        });

        return NextResponse.json({
            success: true,
            sessions
        });

    } catch (error) {
        console.error('Error fetching academic sessions:', error);
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
}

// POST - Create a new Academic Session
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    const sessionUser = requireRole(request, ['ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    try {
        const { schoolId } = await params;
        const resolvedSchool = await getSchool(schoolId);
        const actualSchoolId = resolvedSchool?.id;
        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        if (sessionUser.schoolId && sessionUser.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Forbidden - You can only manage your school calendar' }, { status: 403 });
        }

        const body = await request.json();
        const { name, startDate, endDate, isActive } = body;

        // Validation
        if (!name || !startDate || !endDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Use transaction to handle "isActive" logic (disable others if this one is active)
        const session = await prisma.$transaction(async (tx) => {
            if (isActive) {
                // Deactivate all other sessions
                await tx.academicSession.updateMany({
                    where: { schoolId: actualSchoolId },
                    data: { isActive: false }
                });
            }

            return await tx.academicSession.create({
                data: {
                    name,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    isActive: isActive || false,
                    schoolId: actualSchoolId
                }
            });
        });

        return NextResponse.json({
            success: true,
            session
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating academic session:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Session name already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}

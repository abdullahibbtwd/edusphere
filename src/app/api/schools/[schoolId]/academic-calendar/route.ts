import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
    // Try as UUID first
    let school = await prisma.school.findUnique({
        where: { id: schoolIdentifier },
        select: { id: true }
    });

    // If not found by ID, try as subdomain
    if (!school) {
        school = await prisma.school.findUnique({
            where: {
                subdomain: schoolIdentifier,
                isActive: true
            },
            select: { id: true }
        });
    }

    return school?.id || null;
}

// GET - Fetch all sessions, ensuring one is active
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const actualSchoolId = await resolveSchoolId(schoolId);

        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
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
    try {
        const { schoolId } = await params;
        const actualSchoolId = await resolveSchoolId(schoolId);

        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
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

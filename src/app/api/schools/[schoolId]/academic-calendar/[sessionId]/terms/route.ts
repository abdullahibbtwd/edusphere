import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Term } from '@prisma/client';

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

// GET - Fetch terms for a specific session
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; sessionId: string }> }
) {
    try {
        const { schoolId, sessionId } = await params;
        const actualSchoolId = await resolveSchoolId(schoolId);

        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const terms = await prisma.academicTerm.findMany({
            where: {
                schoolId: actualSchoolId,
                sessionId: sessionId
            },
            include: {
                events: {
                    orderBy: { startDate: 'asc' }
                }
            },
            orderBy: { startDate: 'asc' }
        });

        return NextResponse.json({
            success: true,
            terms
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 });
    }
}


// POST - Create a new Term in a Session
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; sessionId: string }> }
) {
    try {
        const { schoolId, sessionId } = await params;
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

        // Verify session belongs to school
        const session = await prisma.academicSession.findUnique({
            where: { id: sessionId }
        });

        if (!session || session.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
        }

        // Validate dates within session?
        if (new Date(startDate) < session.startDate || new Date(endDate) > session.endDate) {
            return NextResponse.json({ error: 'Term dates must be within Session dates' }, { status: 400 });
        }

        const term = await prisma.$transaction(async (tx) => {
            if (isActive) {
                // Deactivate all other terms in this session (and maybe school?)
                await tx.academicTerm.updateMany({
                    where: { schoolId: actualSchoolId },
                    data: { isActive: false }
                });
            }

            return await tx.academicTerm.create({
                data: {
                    name: name as Term,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    isActive: isActive || false,
                    sessionId,
                    schoolId: actualSchoolId
                }
            });
        });

        return NextResponse.json({
            success: true,
            term
        }, { status: 201 });

    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Term already exists for this session' }, { status: 409 });
        }
        console.error('Error creating term:', error);
        return NextResponse.json({ error: 'Failed to create term' }, { status: 500 });
    }
}

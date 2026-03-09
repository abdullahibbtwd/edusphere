import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { EventType } from '@prisma/client';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

// GET - Fetch events for a specific term
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; termId: string }> }
) {
    try {
        const { schoolId, termId } = await params;
        const resolvedSchool = await getSchool(schoolId);
        const actualSchoolId = resolvedSchool?.id;

        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const events = await prisma.academicEvent.findMany({
            where: {
                schoolId: actualSchoolId,
                termId: termId
            },
            orderBy: { startDate: 'asc' }
        });

        return NextResponse.json({
            success: true,
            events
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}


// POST - Create a new Event in a Term (admin only)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; termId: string }> }
) {
    const sessionUser = requireRole(request, ['ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    try {
        const { schoolId, termId } = await params;
        const resolvedSchool = await getSchool(schoolId);
        const actualSchoolId = resolvedSchool?.id;

        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        if (sessionUser.schoolId && sessionUser.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Forbidden - You can only manage events for your school' }, { status: 403 });
        }

        const body = await request.json();
        const { title, type, startDate, endDate, description } = body;

        // Validation
        if (!title || !startDate || !endDate || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify term belongs to school
        const term = await prisma.academicTerm.findUnique({
            where: { id: termId }
        });

        if (!term || term.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Invalid term' }, { status: 400 });
        }

        // Validate dates within term?
        if (new Date(startDate) < term.startDate || new Date(endDate) > term.endDate) {
            return NextResponse.json({ error: 'Event dates must be within Term dates' }, { status: 400 });
        }

        const event = await prisma.academicEvent.create({
            data: {
                title,
                type: type as EventType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                description,
                termId,
                schoolId: actualSchoolId
            }
        });

        return NextResponse.json({
            success: true,
            event
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}

// DELETE - Delete all events for a specific term (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; termId: string }> }
) {
    const sessionUser = requireRole(request, ['ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    try {
        const { schoolId, termId } = await params;
        const resolvedSchool = await getSchool(schoolId);
        const actualSchoolId = resolvedSchool?.id;

        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        if (sessionUser.schoolId && sessionUser.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Forbidden - You can only manage events for your school' }, { status: 403 });
        }

        // Verify term belongs to school
        const term = await prisma.academicTerm.findUnique({
            where: { id: termId }
        });

        if (!term || term.schoolId !== actualSchoolId) {
            return NextResponse.json({ error: 'Invalid term' }, { status: 400 });
        }

        await prisma.academicEvent.deleteMany({
            where: {
                schoolId: actualSchoolId,
                termId: termId
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting events:', error);
        return NextResponse.json({ error: 'Failed to delete events' }, { status: 500 });
    }
}

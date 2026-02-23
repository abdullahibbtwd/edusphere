import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function resolveSchoolId(identifier: string): Promise<string | null> {
    let school = await prisma.school.findUnique({ where: { id: identifier }, select: { id: true } });
    if (!school) {
        school = await prisma.school.findUnique({ where: { subdomain: identifier, isActive: true }, select: { id: true } });
    }
    return school?.id || null;
}

// GET - list all screening slots for a school
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: identifier } = await params;
        const actualId = await resolveSchoolId(identifier);
        if (!actualId) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const slots = await prisma.screeningSlot.findMany({
            where: { schoolId: actualId },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
            include: {
                _count: { select: { bookings: true } },
            },
        });

        return NextResponse.json({ slots });
    } catch (err) {
        console.error('[Slots GET]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - create a single slot OR generate slots for a date range
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: identifier } = await params;
        const actualId = await resolveSchoolId(identifier);
        if (!actualId) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const body = await req.json();
        const { date, startTime, endTime, venue, maxCapacity, generateRange } = body;

        // Bulk generation mode: generateRange = { fromDate, toDate }
        if (generateRange) {
            const { fromDate, toDate } = generateRange;

            // Fetch school settings for defaults
            const school = await prisma.school.findUnique({
                where: { id: actualId },
                select: { screeningStartTime: true, screeningEndTime: true, screeningVenue: true, screeningSlotsPerDay: true },
            });

            const slotStartTime = startTime || school?.screeningStartTime || '09:00';
            const slotEndTime = endTime || school?.screeningEndTime || '17:00';
            const slotVenue = venue || school?.screeningVenue || '';
            const slotsPerDay = Number(maxCapacity || school?.screeningSlotsPerDay || 50);

            const dates: string[] = [];
            const current = new Date(fromDate);
            const end = new Date(toDate);
            while (current <= end) {
                const day = current.getDay();
                if (day !== 0 && day !== 6) { // Skip weekends
                    dates.push(current.toISOString().split('T')[0]);
                }
                current.setDate(current.getDate() + 1);
            }

            const createdSlots = await prisma.$transaction(
                dates.map((d) =>
                    prisma.screeningSlot.create({
                        data: {
                            date: d,
                            startTime: slotStartTime,
                            endTime: slotEndTime,
                            venue: slotVenue,
                            maxCapacity: slotsPerDay,
                            schoolId: actualId,
                        },
                    })
                )
            );

            return NextResponse.json({ message: `${createdSlots.length} slots generated`, slots: createdSlots });
        }

        // Single slot creation
        if (!date || !startTime || !maxCapacity) {
            return NextResponse.json({ error: 'date, startTime, and maxCapacity are required' }, { status: 400 });
        }

        const slot = await prisma.screeningSlot.create({
            data: {
                date,
                startTime,
                endTime: endTime || null,
                venue: venue || null,
                maxCapacity: Number(maxCapacity),
                schoolId: actualId,
            },
        });

        return NextResponse.json({ message: 'Slot created', slot }, { status: 201 });
    } catch (err) {
        console.error('[Slots POST]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - remove a slot by id (query param ?slotId=)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { searchParams } = new URL(req.url);
        const slotId = searchParams.get('slotId');
        if (!slotId) return NextResponse.json({ error: 'slotId is required' }, { status: 400 });

        await prisma.screeningSlot.delete({ where: { id: slotId } });
        return NextResponse.json({ message: 'Slot deleted' });
    } catch (err) {
        console.error('[Slots DELETE]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

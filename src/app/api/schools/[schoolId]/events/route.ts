import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

/**
 * GET - List school events (for students and teachers to view)
 */
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
    if (sessionUser.schoolId && sessionUser.schoolId !== actualSchoolId && sessionUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - You can only view events for your school' },
        { status: 403 }
      );
    }

    const events = await prisma.event.findMany({
      where: { schoolId: actualSchoolId },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        startTime: true,
        endTime: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date.toISOString().slice(0, 10),
        startTime: e.startTime.toISOString().slice(11, 16),
        endTime: e.endTime.toISOString().slice(11, 16),
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching school events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

/**
 * POST - Create a school event (admin only)
 */
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
      return NextResponse.json(
        { error: 'Forbidden - You can only add events for your school' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, date, startTime, endTime } = body;

    if (!title || !description || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, date, startTime, endTime' },
        { status: 400 }
      );
    }

    const dateOnly = new Date(date);
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    if (
      Number.isNaN(dateOnly.getTime()) ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      );
    }
    if (end <= start) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        date: dateOnly,
        startTime: start,
        endTime: end,
        schoolId: actualSchoolId,
        createdBy: sessionUser.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date.toISOString().slice(0, 10),
          startTime: event.startTime.toISOString().slice(11, 16),
          endTime: event.endTime.toISOString().slice(11, 16),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating school event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

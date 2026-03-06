import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
  const school = await prisma.school.findFirst({
    where: {
      OR: [{ id: schoolIdentifier }, { subdomain: schoolIdentifier, isActive: true }],
    },
    select: { id: true },
  });
  return school?.id ?? null;
}

/**
 * GET - List school announcements (optionally filter by viewer role)
 * Query: viewerRole=student|teacher|admin - if provided, only returns announcements targeting that role (or "both")
 */
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

    const { searchParams } = new URL(request.url);
    const viewerRole = searchParams.get('viewerRole')?.toLowerCase();

    const announcements = await prisma.announcement.findMany({
      where: { schoolId: actualSchoolId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { name: true } },
      },
    });

    let filtered = announcements;
    if (viewerRole === 'student') {
      filtered = announcements.filter((a) => a.targetRoles.includes('STUDENT'));
    } else if (viewerRole === 'teacher') {
      filtered = announcements.filter((a) => a.targetRoles.includes('TEACHER'));
    }
    // admin or no filter: show all

    return NextResponse.json({
      success: true,
      announcements: filtered.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        targetRoles: a.targetRoles,
        createdBy: a.creator?.name ?? null,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

/**
 * POST - Create announcement (admin only)
 * Body: title, content, targetRoles = "both" | "student" | "teacher"
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const sessionUser = requireRole(request, ['ADMIN']);
  if (sessionUser instanceof NextResponse) return sessionUser;

  try {
    const { schoolId } = await params;
    const actualSchoolId = await resolveSchoolId(schoolId);

    if (!actualSchoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    if (sessionUser.schoolId && sessionUser.schoolId !== actualSchoolId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only add announcements for your school' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, targetRoles } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    const rolesMap: Record<string, Role[]> = {
      both: [Role.STUDENT, Role.TEACHER],
      student: [Role.STUDENT],
      teacher: [Role.TEACHER],
    };
    const roles = rolesMap[targetRoles === 'both' ? 'both' : targetRoles === 'teacher' ? 'teacher' : 'student'] ?? [Role.STUDENT, Role.TEACHER];

    const announcement = await prisma.announcement.create({
      data: {
        title: String(title).trim(),
        content: String(content).trim(),
        targetRoles: roles,
        schoolId: actualSchoolId,
        createdBy: sessionUser.userId,
      },
      include: {
        creator: { select: { name: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        announcement: {
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          targetRoles: announcement.targetRoles,
          createdBy: announcement.creator?.name ?? null,
          createdAt: announcement.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}

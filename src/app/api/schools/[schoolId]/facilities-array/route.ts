import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

// PUT - Update school facilities array
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const sessionUser = requireRole(request, ['ADMIN']);
  if (sessionUser instanceof NextResponse) return sessionUser;

  try {
    const { schoolId: schoolIdentifier } = await params;
    const body = await request.json();
    const { facilities } = body;

    const resolvedSchool = await getSchool(schoolIdentifier);
    const schoolId = resolvedSchool?.id;
    if (!schoolId) return NextResponse.json({ error: 'School not found' }, { status: 404 });
    if (sessionUser.schoolId && sessionUser.schoolId !== schoolId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only manage facilities for your school' },
        { status: 403 }
      );
    }

    if (!Array.isArray(facilities)) {
      return NextResponse.json({ error: 'Facilities must be an array' }, { status: 400 });
    }

    // Update the school's facilities array
    const updatedSchool = await db.school.update({
      where: { id: schoolId },
      data: {
        facilitiesList: facilities
      },
      select: {
        id: true,
        name: true,
        facilitiesList: true
      }
    });

    return NextResponse.json(updatedSchool);
  } catch (error) {
    console.error('Error updating school facilities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

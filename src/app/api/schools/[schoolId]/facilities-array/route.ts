import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';

// PUT - Update school facilities array
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  let sId = '';
  let fData: any = null;

  try {
    const { schoolId } = await params;
    sId = schoolId;
    const body = await request.json();
    const { facilities } = body;
    fData = facilities;

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    if (!Array.isArray(facilities)) {
      return NextResponse.json({ error: 'Facilities must be an array' }, { status: 400 });
    }

    // Check if school exists
    const schoolExists = await db.school.findUnique({
      where: { id: schoolId },
      select: { id: true }
    });

    if (!schoolExists) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
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
    console.error('SchoolId:', sId);
    console.error('Facilities data:', fData);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

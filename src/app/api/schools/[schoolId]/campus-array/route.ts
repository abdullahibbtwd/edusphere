import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';

// PUT - Update school campus array
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  let sId = '';
  let cData: any = null;

  try {
    const { schoolId } = await params;
    sId = schoolId;
    const body = await request.json();
    const { campus } = body;
    cData = campus;

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    if (!Array.isArray(campus)) {
      return NextResponse.json({ error: 'Campus must be an array' }, { status: 400 });
    }

    // Check if school exists
    const schoolExists = await db.school.findUnique({
      where: { id: schoolId },
      select: { id: true }
    });

    if (!schoolExists) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Update the school's campus array in the content
    const updatedContent = await db.schoolContent.upsert({
      where: { schoolId },
      update: {
        campusImages: campus
      },
      create: {
        schoolId,
        campusImages: campus
      }
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating school campus:', error);
    console.error('SchoolId:', sId);
    console.error('Campus data:', cData);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

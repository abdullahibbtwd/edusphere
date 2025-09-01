import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be PENDING, APPROVED, or REJECTED' },
        { status: 400 }
      );
    }

    // Update school application status
    const updatedApplication = await db.schoolApplication.update({
      where: { id },
      data: {
        status: body.status,
        reviewedAt: new Date(),
        reviewedBy: body.reviewedBy || null
      }
    });

    return NextResponse.json({
      message: 'School application status updated successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error updating school application:', error);
    return NextResponse.json(
      { error: 'Failed to update school application status' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const application = await db.schoolApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'School application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });

  } catch (error) {
    console.error('Error fetching school application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school application' },
      { status: 500 }
    );
  }
}

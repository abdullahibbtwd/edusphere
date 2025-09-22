import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status, reviewedBy } = await request.json();

    // Find the school application
    const application = await db.schoolApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'School application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      );
    }

    // If approving, create school record
    if (status === 'APPROVED') {
      // Check if subdomain is still available
      const existingSchool = await db.school.findUnique({
        where: { subdomain: application.subdomain }
      });

      if (existingSchool) {
        return NextResponse.json(
          { error: 'Subdomain is no longer available' },
          { status: 400 }
        );
      }

      // Create the school record
      const school = await db.school.create({
        data: {
          name: application.schoolName,
          subdomain: application.subdomain,
          address: application.address,
          pmbNumber: application.pmbNumber,
          rcNumber: application.rcNumber,
          schoolType: application.schoolType,
          principalName: application.principalName,
          phoneNumber: application.phoneNumber,
          email: application.email,
          website: application.website,
          establishmentYear: application.establishmentYear,
          ownershipType: application.ownershipType,
          curriculum: application.curriculum,
          totalStudents: application.totalStudents,
          totalTeachers: application.totalTeachers,
          facilitiesList: application.facilities,
          accreditation: application.accreditation,
          isActive: true
        }
      });

      // Update the application status
      const updatedApplication = await db.schoolApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: reviewedBy || 'system'
        }
      });

      return NextResponse.json({
        message: 'School application approved and school created successfully',
        school: school,
        application: updatedApplication
      });
    }

    // If rejecting, just update the application status
    if (status === 'REJECTED') {
      const updatedApplication = await db.schoolApplication.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: reviewedBy || 'system'
        }
      });

      return NextResponse.json({
        message: 'School application rejected',
        application: updatedApplication
      });
    }

    return NextResponse.json(
      { error: 'Invalid status. Must be APPROVED or REJECTED' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating school application:', error);
    return NextResponse.json(
      { error: 'Failed to update school application' },
      { status: 500 }
    );
  }
}
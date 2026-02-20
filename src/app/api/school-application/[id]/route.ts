import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status, reviewedBy } = await request.json();

    // Find the school application
    const application = await prisma.schoolApplication.findUnique({
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
      const existingSchool = await prisma.school.findUnique({
        where: { subdomain: application.subdomain }
      });

      if (existingSchool) {
        return NextResponse.json(
          { error: 'Subdomain is no longer available' },
          { status: 400 }
        );
      }

      // Create the school record
      const school = await prisma.school.create({
        data: {
          name: application.schoolName,
          subdomain: application.subdomain,
          address: `${application.address}, ${application.lga}, ${application.state}`,
          rcNumber: application.rcNumber,
          schoolType: application.schoolType as any, // Convert string to enum
          principalName: application.principalName,
          phoneNumber: application.officialPhone,
          email: application.schoolEmail,
          establishmentYear: application.establishmentYear,
          ownershipType: application.schoolType === 'PUBLIC' ? 'GOVERNMENT' : 'PRIVATE', // Map from schoolType
          curriculum: 'NATIONAL', // Default curriculum
          totalStudents: application.totalStudents,
          totalTeachers: application.totalTeachers,
          facilitiesList: application.facilities,
          accreditation: application.accreditation,
          isActive: true
        }
      });

      // Update the submitter to be the school admin
      await prisma.user.update({
        where: { id: application.submittedBy },
        data: {
          role: 'ADMIN', // Make them the school admin
          schoolId: school.id // Associate them with the newly created school
        }
      });

      console.log(`✅ User ${application.submittedBy} assigned as admin of school ${school.id}`);

      // Update the application status
      const updatedApplication = await prisma.schoolApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: reviewedBy || 'system'
        },
        include: {
          submittedByUser: true // Get the user who submitted
        }
      });

      // Send approval emails
      try {
        const { sendSchoolApprovalEmail } = await import('@/lib/email-service');

        // Send to the user who submitted the application
        if (updatedApplication.submittedByUser?.email) {
          await sendSchoolApprovalEmail(
            updatedApplication.submittedByUser.email,
            application.schoolName,
            application.subdomain,
            application.principalName
          );
          console.log(`✅ Approval email sent to applicant: ${updatedApplication.submittedByUser.email}`);
        }

        // Send to the school's official email
        if (application.schoolEmail && application.schoolEmail !== updatedApplication.submittedByUser?.email) {
          await sendSchoolApprovalEmail(
            application.schoolEmail,
            application.schoolName,
            application.subdomain,
            application.principalName
          );
          console.log(`✅ Approval email sent to school: ${application.schoolEmail}`);
        }
      } catch (emailError) {
        console.error('Error sending approval emails:', emailError);
        // Don't fail the approval if email fails
      }

      return NextResponse.json({
        message: 'School application approved and school created successfully',
        school: school,
        application: updatedApplication
      });
    }

    // If rejecting, just update the application status
    if (status === 'REJECTED') {
      const updatedApplication = await prisma.schoolApplication.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: reviewedBy || 'system'
        },
        include: {
          submittedByUser: true // Get the user who submitted
        }
      });

      // Send rejection emails
      try {
        const { sendSchoolRejectionEmail } = await import('@/lib/email-service');

        // Send to the user who submitted the application
        if (updatedApplication.submittedByUser?.email) {
          await sendSchoolRejectionEmail(
            updatedApplication.submittedByUser.email,
            application.schoolName,
            application.principalName
          );
          console.log(`✅ Rejection email sent to applicant: ${updatedApplication.submittedByUser.email}`);
        }

        // Send to the school's official email if different
        if (application.schoolEmail && application.schoolEmail !== updatedApplication.submittedByUser?.email) {
          await sendSchoolRejectionEmail(
            application.schoolEmail,
            application.schoolName,
            application.principalName
          );
          console.log(`✅ Rejection email sent to school: ${application.schoolEmail}`);
        }
      } catch (emailError) {
        console.error('Error sending rejection emails:', emailError);
        // Don't fail the rejection if email fails
      }

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
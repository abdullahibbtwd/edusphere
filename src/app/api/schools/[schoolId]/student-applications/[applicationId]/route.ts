import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Get single application details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; applicationId: string }> }
) {
  try {
    const { schoolId, applicationId } = await params;

    let school;
    // Try as UUID first (actual school ID)
    school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true }
    });

    // If not found by ID, try as subdomain
    if (!school) {
      school = await prisma.school.findUnique({
        where: {
          subdomain: schoolId,
          isActive: true
        },
        select: { id: true }
      });
    }

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const actualSchoolId = school.id;

    const application = await prisma.studentApplication.findUnique({
      where: { 
        id: applicationId,
        schoolId: actualSchoolId 
      },
      include: {
        class: {
          include: {
            level: {
              select: { name: true }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      application: {
        id: application.id,
        firstName: application.firstName,
        lastName: application.lastName,
        middleName: application.middleName,
        dob: application.dob,
        gender: application.gender,
        email: application.email,
        phone: application.phone,
        address: application.address,
        city: application.city,
        state: application.state,
        zipCode: application.zipCode,
        lga: application.lga,
        religion: application.religion,
        applicationNumber: application.applicationNumber,
        applicationDate: application.applicationDate.toISOString(),
        status: application.status,
        class: {
          id: application.class.id,
          name: application.class.name,
          levelName: application.class.level.name,
          fullName: `${application.class.level.name}${application.class.name}`
        },
        // Previous Education
        primarySchoolName: application.primarySchoolName,
        primarySchoolStartDate: application.primarySchoolStartDate,
        primarySchoolEndDate: application.primarySchoolEndDate,
        primarySchoolGrade: application.primarySchoolGrade,
        juniorSecondarySchoolName: application.juniorSecondarySchoolName,
        juniorSecondarySchoolStartDate: application.juniorSecondarySchoolStartDate,
        juniorSecondarySchoolEndDate: application.juniorSecondarySchoolEndDate,
        juniorSecondarySchoolGrade: application.juniorSecondarySchoolGrade,
        // Parent Information
        parentName: application.parentName,
        parentRelationship: application.parentRelationship,
        parentEmail: application.parentEmail,
        parentPhone: application.parentPhone,
        parentOccupation: application.parentOccupation,
        parentAddress: application.parentAddress,
        // File paths
        profileImagePath: application.profileImagePath,
        primarySchoolCertificatePath: application.primarySchoolCertificatePath,
        primarySchoolTestimonialPath: application.primarySchoolTestimonialPath,
        juniorSecondarySchoolCertificatePath: application.juniorSecondarySchoolCertificatePath,
        juniorSecondarySchoolTestimonialPath: application.juniorSecondarySchoolTestimonialPath,
        parentIdCardPath: application.parentIdCardPath,
        indigeneCertificatePath: application.indigeneCertificatePath,
        nationalIdCardPath: application.nationalIdCardPath,
        user: application.user,
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update application status (admit/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; applicationId: string }> }
) {
  try {
    const { schoolId, applicationId } = await params;
    const body = await request.json();
    const { status, notes } = body; // status: 'ADMITTED' | 'REJECTED'

    if (!status || !['ADMITTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be ADMITTED or REJECTED' 
      }, { status: 400 });
    }

    // Find school
    let school;
    school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      school = await prisma.school.findUnique({
        where: {
          subdomain: schoolId,
          isActive: true
        }
      });
    }

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Find application
    const application = await prisma.studentApplication.findUnique({
      where: { 
        id: applicationId,
        schoolId: school.id 
      },
      include: {
        class: {
          include: {
            level: {
              select: { name: true }
            }
          }
        },
        user: true
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status !== 'PROGRESS') {
      return NextResponse.json({ 
        error: 'Application has already been processed' 
      }, { status: 409 });
    }

    // Update application status
    const updatedApplication = await prisma.studentApplication.update({
      where: { id: applicationId },
      data: {
        status: status as 'ADMITTED' | 'REJECTED'
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = {
      success: true,
      message: `Application ${status.toLowerCase()} successfully`,
      application: {
        id: updatedApplication.id,
        applicationNumber: updatedApplication.applicationNumber,
        status: updatedApplication.status
      }
    };

    // If admitted, create student record
    if (status === 'ADMITTED') {
      try {
        // Check if student already exists
        const existingStudent = await prisma.student.findFirst({
          where: {
            email: application.email,
            schoolId: school.id
          }
        });

        if (existingStudent) {
          return NextResponse.json({ 
            error: 'Student with this email already exists' 
          }, { status: 409 });
        }

        // Create student record
        const student = await prisma.student.create({
          data: {
            // Personal Information
            firstName: application.firstName,
            lastName: application.lastName,
            middleName: application.middleName,
            dob: application.dob,
            gender: application.gender,
            email: application.email,
            phone: application.phone,
            address: application.address,
            city: application.city,
            state: application.state,
            zipCode: application.zipCode,
            lga: application.lga,
            religion: application.religion,
            
            // Academic Information
            classId: application.classId,
            schoolId: school.id,
            className: application.className,
            
            // Previous Education
            primarySchoolName: application.primarySchoolName,
            primarySchoolStartDate: application.primarySchoolStartDate,
            primarySchoolEndDate: application.primarySchoolEndDate,
            primarySchoolGrade: application.primarySchoolGrade,
            
            juniorSecondarySchoolName: application.juniorSecondarySchoolName,
            juniorSecondarySchoolStartDate: application.juniorSecondarySchoolStartDate,
            juniorSecondarySchoolEndDate: application.juniorSecondarySchoolEndDate,
            juniorSecondarySchoolGrade: application.juniorSecondarySchoolGrade,
            
            // Parent/Guardian Information
            parentName: application.parentName,
            parentRelationship: application.parentRelationship,
            parentEmail: application.parentEmail,
            parentPhone: application.parentPhone,
            parentOccupation: application.parentOccupation,
            parentAddress: application.parentAddress,
            
            // File Storage References
            profileImagePath: application.profileImagePath,
            primarySchoolCertificatePath: application.primarySchoolCertificatePath,
            primarySchoolTestimonialPath: application.primarySchoolTestimonialPath,
            juniorSecondarySchoolCertificatePath: application.juniorSecondarySchoolCertificatePath,
            juniorSecondarySchoolTestimonialPath: application.juniorSecondarySchoolTestimonialPath,
            parentIdCardPath: application.parentIdCardPath,
            indigeneCertificatePath: application.indigeneCertificatePath,
            nationalIdCardPath: application.nationalIdCardPath,
            
            agreeTerms: application.agreeTerms,
            userId: application.userId,
            status: 'ADMITTED'
          }
        });

        result = {
          ...result,
          message: 'Application admitted and student record created successfully',
          student: {
            id: student.id,
            applicationNumber: student.applicationNumber,
            name: `${student.firstName} ${student.lastName}`,
            class: application.class.name,
            level: application.class.level?.name
          }
        };

      } catch (studentError) {
        console.error('Error creating student record:', studentError);
        // Rollback application status
        await prisma.studentApplication.update({
          where: { id: applicationId },
          data: { status: 'PROGRESS' }
        });
        
        return NextResponse.json({ 
          error: 'Failed to create student record' 
        }, { status: 500 });
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; applicationId: string }> }
) {
  try {
    const { schoolId, applicationId } = await params;

    // Find school
    let school;
    school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      school = await prisma.school.findUnique({
        where: {
          subdomain: schoolId,
          isActive: true
        }
      });
    }

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Check if application exists
    const application = await prisma.studentApplication.findUnique({
      where: { 
        id: applicationId,
        schoolId: school.id 
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Delete application
    await prisma.studentApplication.delete({
      where: { id: applicationId }
    });

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

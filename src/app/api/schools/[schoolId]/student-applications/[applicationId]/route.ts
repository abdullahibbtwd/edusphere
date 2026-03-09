import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { sendStudentAdmissionEmail, sendStudentRejectionEmail } from '@/lib/email-service';
import { getSchool } from '@/lib/school';

// GET - Get single application details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; applicationId: string }> }
) {
  try {
    const { schoolId, applicationId } = await params;

    const school = await getSchool(schoolId);
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
        dob: application.dob,
        gender: application.gender,
        email: application.email,
        phone: application.phone,
        address: application.address,
        state: application.state,
        lga: application.lga,
        religion: application.religion,
        applicationNumber: application.applicationNumber,
        applicationDate: application.applicationDate.toISOString(),
        lastSchoolAttended: application.lastSchoolAttended,
        status: application.status,
        class: {
          id: application.class.id,
          name: application.class.name,
          levelName: application.class.level.name,
          fullName: `${application.class.level.name}${application.class.name}`
        },
        // Parent Information
        parentName: application.parentName,
        parentRelationship: application.parentRelationship,
        parentEmail: application.parentEmail,
        parentPhone: application.parentPhone,
        parentOccupation: application.parentOccupation,
        parentAddress: application.parentAddress,
        // File paths
        profileImagePath: application.profileImagePath,
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

    // Security check - Admin role required
    const sessionUser = requireRole(request, ['ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    const body = await request.json();
    const { status, classId } = body; // status: 'ADMITTED' | 'REJECTED', optional classId for reassignment

    if (!status || !['ADMITTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({
        error: 'Invalid status. Must be ADMITTED or REJECTED'
      }, { status: 400 });
    }

    const school = await getSchool(schoolId);
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

    // Update class if provided (class reassignment)
    let finalClassId = application.classId;
    let finalClassName = `${application.class.level.name}${application.class.name}`;

    if (status === 'ADMITTED' && classId && classId !== application.classId) {
      const newClass = await prisma.class.findUnique({
        where: { id: classId, schoolId: school.id },
        include: {
          level: { select: { name: true } }
        }
      });

      if (!newClass) {
        return NextResponse.json({ error: 'Target class not found' }, { status: 400 });
      }

      finalClassId = classId;
      finalClassName = `${newClass.level.name}${newClass.name}`;

      // Update the application's classId record as well
      await prisma.studentApplication.update({
        where: { id: applicationId },
        data: { classId: finalClassId }
      });
    }

    // Update application status
    const updatedApplication = await prisma.studentApplication.update({
      where: { id: applicationId },
      data: {
        status: status as 'ADMITTED' | 'REJECTED'
      }
    });

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
          // Rollback application if student already exists
          await prisma.studentApplication.update({
            where: { id: applicationId },
            data: { status: 'PROGRESS' }
          });
          return NextResponse.json({
            error: 'Student with this email already exists'
          }, { status: 409 });
        }

        // Get current active session
        const activeSession = await prisma.academicSession.findFirst({
          where: { schoolId: school.id, isActive: true }
        });

        // Create student record
        const student = await prisma.student.create({
          data: {
            firstName: application.firstName,
            lastName: application.lastName,
            dob: application.dob,
            gender: application.gender,
            email: application.email,
            phone: application.phone || "",
            address: application.address || "",
            state: application.state || "",
            lga: application.lga || "",
            religion: application.religion || "",
            lastSchoolAttended: application.lastSchoolAttended,
            classId: finalClassId,
            schoolId: school.id,
            className: finalClassName,
            parentName: application.parentName,
            parentRelationship: application.parentRelationship,
            parentEmail: application.parentEmail,
            parentPhone: application.parentPhone,
            parentOccupation: application.parentOccupation,
            parentAddress: application.parentAddress,
            profileImagePath: application.profileImagePath,
            agreeTerms: application.agreeTerms,
            userId: application.userId,
            status: 'ADMITTED',

            // New Registration & Session Fields
            isRegistered: false,
            admissionSessionId: activeSession?.id,
            currentSessionId: activeSession?.id,
            isActive: true
          }
        });

        // Upgrade associated User role to STUDENT and link to school
        if (application.userId) {
          try {
            await prisma.user.update({
              where: { id: application.userId },
              data: {
                role: 'STUDENT',
                schoolId: school.id
              }
            });
          } catch (userUpdateError) {
            console.error('Failed to upgrade user role:', userUpdateError);
            // We don't rollback the student creation because the admission itself is successful
            // but we log it as a critical failure for manual intervention if needed.
          }
        }

        // Send Admission Email
        try {
          await sendStudentAdmissionEmail(
            application.email,
            `${application.firstName} ${application.lastName}`,
            school.name || "EduSphere School",
            finalClassName
          );
        } catch (emailError) {
          console.error("Failed to send admission email:", emailError);
        }

        return NextResponse.json({
          success: true,
          message: 'Application admitted and student record created successfully',
          application: {
            id: updatedApplication.id,
            status: updatedApplication.status
          },
          student: {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            class: finalClassName
          }
        });

      } catch (studentError) {
        console.error('Error creating student record:', studentError);
        // Rollback
        await prisma.studentApplication.update({
          where: { id: applicationId },
          data: { status: 'PROGRESS' }
        });

        return NextResponse.json({
          error: 'Failed to create student record'
        }, { status: 500 });
      }
    } else {
      // It's a REJECTION
      // Send Rejection Email
      try {
        await sendStudentRejectionEmail(
          application.email,
          `${application.firstName} ${application.lastName}`,
          school.name || "EduSphere School"
        );
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }

      return NextResponse.json({
        success: true,
        message: `Application rejected successfully`,
        application: {
          id: updatedApplication.id,
          status: updatedApplication.status
        }
      });
    }

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

    // Security check - Admin role required
    const sessionUser = requireRole(request, ['ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    const school = await getSchool(schoolId);
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

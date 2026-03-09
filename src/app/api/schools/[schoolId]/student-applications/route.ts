import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';

// GET - Fetch student applications for a school
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const actualSchoolId = school.id;
    const status = searchParams.get('status');

    // Get student applications
    const applications = await prisma.studentApplication.findMany({
      where: {
        schoolId: actualSchoolId,
        ...(status ? { status: status as any } : {})
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
      },
      orderBy: [
        { applicationDate: 'desc' }
      ],
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.studentApplication.count({
      where: {
        schoolId: actualSchoolId,
        ...(status ? { status: status as any } : {})
      }
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Format the response
    const formattedApplications = applications.map(application => ({
      id: application.id,
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      applicationNumber: application.applicationNumber,
      applicationDate: application.applicationDate.toISOString(),
      status: application.status,
      class: {
        id: application.class.id,
        name: application.class.name,
        levelName: application.class.level.name,
        fullName: `${application.class.level.name}${application.class.name}`
      },
      user: application.user,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString()
    }));

    return NextResponse.json({
      applications: formattedApplications,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching student applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new student application
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const body = await request.json();

    const {
      // Personal Information
      firstName,
      lastName,
      dob,
      gender,
      email,
      phone,
      address,
      state,
      lga,
      religion,

      // Academic Information
      classId,
      className,
      lastSchoolAttended,

      // Parent/Guardian Information
      parentName,
      parentRelationship,
      parentEmail,
      parentPhone,
      parentOccupation,
      parentAddress,

      // File Storage References
      image,

      agreeTerms,
      userId
    } = body;

    if (!firstName || !lastName || !email || !classId || !parentName || !parentEmail) {
      return NextResponse.json({
        error: 'Required fields missing: firstName, lastName, email, classId, parentName, parentEmail'
      }, { status: 400 });
    }

    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: {
        id: classId,
        schoolId: school.id
      }
    });

    if (!classExists) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check if user already has an application
    // Check if user already has an application
    if (userId) {
      const existingApplication = await prisma.studentApplication.findFirst({
        where: {
          userId,
          schoolId: school.id
        }
      });

      if (existingApplication) {
        if (existingApplication.status === 'REJECTED') {
          // If previously rejected, delete it so they can apply again
          await prisma.$transaction(async (tx) => {
            // If they had a screening slot, decrement the booking count
            if (existingApplication.screeningSlotId) {
              await tx.screeningSlot.update({
                where: { id: existingApplication.screeningSlotId },
                data: { bookingCount: { decrement: 1 } }
              });
            }

            // Delete the application
            await tx.studentApplication.delete({
              where: { id: existingApplication.id }
            });
          });
        } else {
          const statusMsg = existingApplication.status === 'ADMITTED'
            ? 'You have already been admitted to this school.'
            : 'You already have an active application in progress for this school.';

          return NextResponse.json({
            error: statusMsg,
            status: existingApplication.status
          }, { status: 409 });
        }
      }
    }

    // Create application
    // Generate custom application number: [SubdomainCode][Year]-[SequentialNumber]
    const currentYear = new Date().getFullYear();
    const subdomainCode = school.subdomain.charAt(0).toUpperCase();

    // Count applications for this school in this year to get sequence
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const yearAppsCount = await prisma.studentApplication.count({
      where: {
        schoolId: school.id,
        createdAt: {
          gte: yearStart,
          lte: yearEnd
        }
      }
    });

    const sequentialNumber = (yearAppsCount + 1).toString().padStart(3, '0');
    const applicationNumber = `${subdomainCode}${currentYear}-${sequentialNumber}`;

    // Auto-assign a screening slot if screening is enabled
    let screeningSlotId: string | null = null;
    const schoolSettings = await prisma.school.findUnique({
      where: { id: school.id },
      select: { isScreeningEnabled: true },
    });

    if (schoolSettings?.isScreeningEnabled) {
      const today = new Date().toISOString().split('T')[0];
      // Get the earliest upcoming slot and check capacity in code
      // (Prisma doesn't support field-to-field comparison directly)
      const availableSlot = await prisma.screeningSlot.findFirst({
        where: {
          schoolId: school.id,
          date: { gte: today },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      });

      if (availableSlot && availableSlot.bookingCount < availableSlot.maxCapacity) {
        screeningSlotId = availableSlot.id;
        await prisma.screeningSlot.update({
          where: { id: availableSlot.id },
          data: { bookingCount: { increment: 1 } },
        });
      }
    }

    const application = await prisma.studentApplication.create({
      data: {
        // Personal Information
        firstName,
        lastName,
        dob: dob ? new Date(dob) : new Date(),
        gender,
        email,
        phone,
        address,
        state,
        lga,
        religion,

        // Academic Information
        lastSchoolAttended: body.lastSchoolAttended,
        classId,
        className,
        schoolId: school.id,

        // Parent/Guardian Information
        parentName,
        parentRelationship,
        parentEmail,
        parentPhone,
        parentOccupation,
        parentAddress,

        // File Storage References
        profileImagePath: image,

        agreeTerms,
        userId,
        applicationNumber,
        status: 'PROGRESS',
        ...(screeningSlotId && { screeningSlotId }),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        applicationNumber: application.applicationNumber,
        status: application.status,
        applicationDate: application.applicationDate.toISOString(),
        ...(screeningSlotId && { screeningSlotId }),
      }
    });

  } catch (error) {
    console.error('Error creating student application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    // Get student applications
    const applications = await prisma.studentApplication.findMany({
      where: { schoolId: actualSchoolId },
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
      where: { schoolId: actualSchoolId }
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Format the response
    const formattedApplications = applications.map(application => ({
      id: application.id,
      firstName: application.firstName,
      lastName: application.lastName,
      middleName: application.middleName,
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
    
    // Updated: Destructure using the same field names as the client
    const {
      // Personal Information
      firstName,
      lastName,
      middleName,
      dob,
      gender,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      lga,
      religion,
      
      // Academic Information
      classId,
      className,
      
      // Previous Education
      primarySchoolName,
      primarySchoolStartDate,
      primarySchoolEndDate,
      primarySchoolGrade,
      
      juniorSecondarySchoolName,
      juniorSecondarySchoolStartDate,
      juniorSecondarySchoolEndDate,
      juniorSecondarySchoolGrade,
      
      // Parent/Guardian Information
      parentName,
      parentRelationship,
      parentEmail,
      parentPhone,
      parentOccupation,
      parentAddress,
      
      // File Storage References
      // Updated to match the client-side names
      image,
      primarySchoolCertificate,
      primarySchoolTestimonial,
      juniorSecondarySchoolCertificate,
      juniorSecondarySchoolTestimonial,
      parentIdCard,
      indigeneCertificate,
      nationalIdCard,
      
      agreeTerms,
      userId
    } = body;

    if (!firstName || !lastName || !email || !classId || !parentName || !parentEmail) {
      return NextResponse.json({ 
        error: 'Required fields missing: firstName, lastName, email, classId, parentName, parentEmail' 
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
    if (userId) {
      const existingApplication = await prisma.studentApplication.findFirst({
        where: {
          userId,
          schoolId: school.id
        }
      });

      if (existingApplication) {
        return NextResponse.json({ 
          error: 'User already has an application for this school' 
        }, { status: 409 });
      }
    }

    // Create application
    const application = await prisma.studentApplication.create({
      data: {
        // Personal Information
        firstName,
        lastName,
        middleName,
        dob,
        gender,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        lga,
        religion,
        
        // Academic Information
        classId,
        className,
        schoolId: school.id,
        
        // Previous Education
        primarySchoolName,
        primarySchoolStartDate,
        primarySchoolEndDate,
        primarySchoolGrade,
        
        juniorSecondarySchoolName,
        juniorSecondarySchoolStartDate,
        juniorSecondarySchoolEndDate,
        juniorSecondarySchoolGrade,
        
        // Parent/Guardian Information
        parentName,
        parentRelationship,
        parentEmail,
        parentPhone,
        parentOccupation,
        parentAddress,
        
        // File Storage References
        // Updated to use the correct field names
        profileImagePath: image,
        primarySchoolCertificatePath: primarySchoolCertificate,
        primarySchoolTestimonialPath: primarySchoolTestimonial,
        juniorSecondarySchoolCertificatePath: juniorSecondarySchoolCertificate,
        juniorSecondarySchoolTestimonialPath: juniorSecondarySchoolTestimonial,
        parentIdCardPath: parentIdCard,
        indigeneCertificatePath: indigeneCertificate,
        nationalIdCardPath: nationalIdCard,
        
        agreeTerms,
        userId,
        status: 'PROGRESS'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        applicationNumber: application.applicationNumber,
        status: application.status,
        applicationDate: application.applicationDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating student application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

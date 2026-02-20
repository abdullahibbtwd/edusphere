/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptSchoolIdentifiers } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get authenticated user from cookies
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user ID from session cookie
    let userId: string | null = null;
    try {
      const sessionCookie = request.cookies.get('user-session')?.value;
      if (sessionCookie) {
        const session = JSON.parse(decodeURIComponent(sessionCookie));
        userId = session.userId; // Changed from session.id to session.userId
      }
    } catch (error) {
      console.error('Error parsing user session:', error);
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User session not found' },
        { status: 401 }
      );
    }

    // Validate required fields
    const requiredFields = [
      'schoolName', 'subdomain', 'state', 'lga', 'address', 'schoolType',
      'educationLevel', 'principalName', 'officialPhone', 'schoolEmail',
      'establishmentYear'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate that at least one identification number is provided
    if (!body.nemisId && !body.stateApprovalNumber) {
      return NextResponse.json(
        { error: 'At least one identification number (NEMIS ID or State Approval Number) is required' },
        { status: 400 }
      );
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomainRegex.test(body.subdomain)) {
      return NextResponse.json(
        { error: 'Invalid subdomain format. Only lowercase letters, numbers, and hyphens are allowed.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingApplication = await prisma.schoolApplication.findFirst({
      where: { schoolEmail: body.schoolEmail }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 400 }
      );
    }

    // Check if subdomain already exists in applications or schools
    const existingSubdomain = await prisma.schoolApplication.findUnique({
      where: { subdomain: body.subdomain }
    });

    if (existingSubdomain) {
      return NextResponse.json(
        { error: 'This subdomain is already taken' },
        { status: 400 }
      );
    }

    // Check if subdomain exists in schools table
    const existingSchool = await prisma.school.findUnique({
      where: { subdomain: body.subdomain }
    });

    if (existingSchool) {
      return NextResponse.json(
        { error: 'This subdomain is already taken' },
        { status: 400 }
      );
    }

    // Encrypt sensitive identification numbers
    const encryptedIdentifiers = encryptSchoolIdentifiers({
      rcNumber: body.rcNumber,
      nemisId: body.nemisId,
      stateApprovalNumber: body.stateApprovalNumber,
      waecNecoNumber: body.waecNecoNumber,
    });

    // Create school application
    const schoolApplication = await prisma.schoolApplication.create({
      data: {
        schoolName: body.schoolName,
        subdomain: body.subdomain,
        state: body.state,
        lga: body.lga,
        address: body.address,
        schoolType: body.schoolType,
        educationLevel: body.educationLevel,
        rcNumber: encryptedIdentifiers.rcNumber,
        waecNecoNumber: encryptedIdentifiers.waecNecoNumber,
        nemisId: encryptedIdentifiers.nemisId,
        stateApprovalNumber: encryptedIdentifiers.stateApprovalNumber,
        principalName: body.principalName,
        officialPhone: body.officialPhone,
        schoolEmail: body.schoolEmail,
        establishmentYear: body.establishmentYear,
        totalStudents: body.totalStudents ? parseInt(body.totalStudents) : null,
        totalTeachers: body.totalTeachers ? parseInt(body.totalTeachers) : null,
        facilities: body.facilities || [],
        accreditation: body.accreditation || null,
        additionalInfo: body.additionalInfo || null,
        submittedBy: userId,
        status: 'PENDING' // Default status
      }
    });

    return NextResponse.json(
      {
        message: 'School application submitted successfully',
        applicationId: schoolApplication.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating school application:', error);
    return NextResponse.json(
      { error: 'Failed to submit school application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { schoolName: { contains: search, mode: 'insensitive' } },
        { principalName: { contains: search, mode: 'insensitive' } },
        { schoolEmail: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get applications with pagination
    const [applications, total] = await Promise.all([
      prisma.schoolApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' }
      }),
      prisma.schoolApplication.count({ where })
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching school applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school applications' },
      { status: 500 }
    );
  }
}

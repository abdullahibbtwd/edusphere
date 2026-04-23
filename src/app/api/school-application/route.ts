import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptSchoolIdentifiers } from '@/lib/encryption';
import { registerLimiter, getClientIp, createRateLimitResponse } from '@/lib/rate-limit';
import { normalizeEmail } from '@/lib/auth-security';
import { Prisma, SchoolApplicationStatus } from '@prisma/client';
import { requireAuth } from '@/lib/auth-middleware';

const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'admin',
  'app',
  'mail',
  'support',
  'help',
  'status',
  'dashboard',
  'auth',
  'cdn',
  'static',
  'assets',
  'docs',
  'blog',
  'ftp',
  'localhost',
  'root',
]);

export async function POST(request: NextRequest) {
  const authUser = requireAuth(request);
  if (authUser instanceof NextResponse) return authUser;

  try {
    const clientIp = getClientIp(request);
    const ipRateLimit = registerLimiter.check(`school-application-ip:${clientIp}`);
    if (!ipRateLimit.success) {
      return createRateLimitResponse(ipRateLimit.retryAfter!, 'Too many school application attempts. Please try again later.');
    }

    const body = await request.json();

    const userId = authUser.userId;

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
    const normalizedSubdomain = String(body.subdomain).trim().toLowerCase();
    if (!subdomainRegex.test(normalizedSubdomain)) {
      return NextResponse.json(
        { error: 'Invalid subdomain format. Only lowercase letters, numbers, and hyphens are allowed.' },
        { status: 400 }
      );
    }

    if (RESERVED_SUBDOMAINS.has(normalizedSubdomain)) {
      return NextResponse.json(
        { error: 'This subdomain is reserved. Please choose another one.' },
        { status: 400 }
      );
    }

    const normalizedSchoolEmail = normalizeEmail(String(body.schoolEmail));
    const accountRateLimit = registerLimiter.check(`school-application:${normalizedSchoolEmail}`);
    if (!accountRateLimit.success) {
      return createRateLimitResponse(accountRateLimit.retryAfter!, 'Too many school application attempts for this email. Please try again later.');
    }

    // Check if email already exists
    const existingApplication = await prisma.schoolApplication.findFirst({
      where: { schoolEmail: normalizedSchoolEmail }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 400 }
      );
    }

    // Check if subdomain already exists in applications or schools
    const existingSubdomain = await prisma.schoolApplication.findUnique({
      where: { subdomain: normalizedSubdomain }
    });

    if (existingSubdomain) {
      return NextResponse.json(
        { error: 'This subdomain is already taken' },
        { status: 400 }
      );
    }

    // Check if subdomain exists in schools table
    const existingSchool = await prisma.school.findUnique({
      where: { subdomain: normalizedSubdomain }
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
        subdomain: normalizedSubdomain,
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
        schoolEmail: normalizedSchoolEmail,
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
  const authUser = requireAuth(request);
  if (authUser instanceof NextResponse) return authUser;
  if (authUser.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const pageParam = Number.parseInt(searchParams.get('page') || '1', 10);
    const limitParam = Number.parseInt(searchParams.get('limit') || '10', 10);
    const page = Number.isFinite(pageParam) ? Math.max(pageParam, 1) : 1;
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10;
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.SchoolApplicationWhereInput = {};

    if (status && status !== 'ALL') {
      if ((Object.values(SchoolApplicationStatus) as string[]).includes(status)) {
        where.status = status as SchoolApplicationStatus;
      } else {
        return NextResponse.json(
          { error: 'Invalid status filter' },
          { status: 400 }
        );
      }
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

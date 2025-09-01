/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'schoolName', 'address', 'schoolType', 'principalName', 
      'phoneNumber', 'email', 'establishmentYear', 'ownershipType', 
      'curriculum', 'submittedBy'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingApplication = await db.schoolApplication.findFirst({
      where: { email: body.email }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 400 }
      );
    }

    // Create school application
    const schoolApplication = await db.schoolApplication.create({
      data: {
        schoolName: body.schoolName,
        address: body.address,
        pmbNumber: body.pmbNumber || null,
        rcNumber: body.rcNumber || null,
        schoolType: body.schoolType,
        principalName: body.principalName,
        phoneNumber: body.phoneNumber,
        email: body.email,
        website: body.website || null,
        establishmentYear: body.establishmentYear,
        ownershipType: body.ownershipType,
        curriculum: body.curriculum,
        totalStudents: body.totalStudents ? parseInt(body.totalStudents) : null,
        totalTeachers: body.totalTeachers ? parseInt(body.totalTeachers) : null,
        facilities: body.facilities || [],
        accreditation: body.accreditation || null,
        additionalInfo: body.additionalInfo || null,
        submittedBy: body.submittedBy,
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
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get applications with pagination
    const [applications, total] = await Promise.all([
      db.schoolApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' }
      }),
      db.schoolApplication.count({ where })
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

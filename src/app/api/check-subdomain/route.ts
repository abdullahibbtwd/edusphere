import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { subdomain } = await request.json();
    
    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      );
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        { 
          available: false, 
          error: 'Subdomain must contain only lowercase letters, numbers, and hyphens. It cannot start or end with a hyphen.' 
        },
        { status: 200 }
      );
    }

    // Check if subdomain is too short or too long
    if (subdomain.length < 3) {
      return NextResponse.json(
        { 
          available: false, 
          error: 'Subdomain must be at least 3 characters long' 
        },
        { status: 200 }
      );
    }

    if (subdomain.length > 30) {
      return NextResponse.json(
        { 
          available: false, 
          error: 'Subdomain must be less than 30 characters long' 
        },
        { status: 200 }
      );
    }

    // Check if subdomain exists in database
    const existingSchool = await db.school.findUnique({
      where: { subdomain }
    });

    // Check if subdomain exists in school applications
    const existingApplication = await db.schoolApplication.findUnique({
      where: { 
        subdomain: subdomain
      }
    });

    const isAvailable = !existingSchool && !existingApplication;

    return NextResponse.json({
      available: isAvailable,
      subdomain: subdomain,
      message: isAvailable 
        ? 'Subdomain is available!' 
        : 'This subdomain is already taken'
    });

  } catch (error) {
    console.error('Error checking subdomain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

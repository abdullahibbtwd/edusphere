import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST - Check if user exists by email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    // Find school
    let school;
    school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, name: true }
    });

    if (!school) {
      school = await prisma.school.findUnique({
        where: {
          subdomain: schoolId,
          isActive: true
        },
        select: { id: true, name: true }
      });
    }

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        teacher: {
          select: { id: true, teacherId: true, name: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: 'No user found with this email address'
      });
    }

    // Check if user is already a teacher
    if (user.teacher) {
      return NextResponse.json({
        exists: true,
        isTeacher: true,
        message: 'User already has a teacher record',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          teacher: user.teacher
        }
      });
    }

    // Check if user belongs to this school
    if (user.schoolId !== school.id) {
      return NextResponse.json({
        exists: true,
        isTeacher: false,
        belongsToSchool: false,
        message: 'User exists but belongs to a different school',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified
        }
      });
    }

    return NextResponse.json({
      exists: true,
      isTeacher: false,
      belongsToSchool: true,
      message: 'User found and can be added as teacher',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { normalizeEmail } from '@/lib/auth-security';
import { getSchool } from '@/lib/school';

// POST - Check if user exists by email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const sessionUser = requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    const { schoolId } = await params;
    const body = await request.json();
    const email = normalizeEmail(String(body?.email || ''));

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    if (sessionUser.schoolId && sessionUser.schoolId !== school.id && sessionUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - You can only manage teachers for your school' },
        { status: 403 }
      );
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

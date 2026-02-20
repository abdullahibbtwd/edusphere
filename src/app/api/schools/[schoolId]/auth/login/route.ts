import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Find school
    let school;
    school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, name: true, subdomain: true }
    });

    if (!school) {
      school = await prisma.school.findUnique({
        where: {
          subdomain: schoolId,
          isActive: true
        },
        select: { id: true, name: true, subdomain: true }
      });
    }

    if (!school) {
      return NextResponse.json({
        error: 'School not found'
      }, { status: 404 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email,
        schoolId: school.id
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json({
        error: 'Please verify your email before logging in',
        requiresVerification: true
      }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Create JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      schoolSubdomain: school.subdomain
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });

    // Return user data without password
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      school: user.school,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt
    };

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // Set client-side accessible cookie for UI state
    response.cookies.set('user-session', JSON.stringify({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      imageUrl: user.imageUrl, // Added if available on user type
      schoolId: user.schoolId,
      schoolName: user.school?.name,
      schoolSubdomain: user.school?.subdomain
    }), {
      httpOnly: false, // Accessible by JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSchool } from '@/lib/school';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const { email, verificationCode } = await request.json();

    if (!email || !verificationCode) {
      return NextResponse.json({
        error: 'Email and verification code are required'
      }, { status: 400 });
    }

    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email,
        schoolId: school.id
      }
    });

    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json({
        error: 'Email is already verified'
      }, { status: 400 });
    }

    // Check verification code
    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      return NextResponse.json({
        error: 'No verification code found. Please request a new one.'
      }, { status: 400 });
    }

    // Check if code is expired
    if (new Date() > user.emailVerificationExpires) {
      return NextResponse.json({
        error: 'Verification code has expired. Please request a new one.'
      }, { status: 400 });
    }

    // Check if code matches
    if (user.emailVerificationCode !== verificationCode) {
      return NextResponse.json({
        error: 'Invalid verification code'
      }, { status: 400 });
    }

    // Verify user
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpires: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: verifiedUser
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

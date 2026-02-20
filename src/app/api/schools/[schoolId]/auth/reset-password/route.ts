import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const { email, resetCode, newPassword } = await request.json();

    if (!email || !resetCode || !newPassword) {
      return NextResponse.json({
        error: 'Email, reset code, and new password are required'
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
      return NextResponse.json({
        error: 'School not found'
      }, { status: 404 });
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

    // Check reset code
    if (!user.passwordResetCode || !user.passwordResetExpires) {
      return NextResponse.json({
        error: 'No password reset request found. Please request a new one.'
      }, { status: 400 });
    }

    // Check if code is expired
    if (new Date() > user.passwordResetExpires) {
      return NextResponse.json({
        error: 'Password reset code has expired. Please request a new one.'
      }, { status: 400 });
    }

    // Check if code matches
    if (user.passwordResetCode !== resetCode) {
      return NextResponse.json({
        error: 'Invalid reset code'
      }, { status: 400 });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetCode: null,
        passwordResetExpires: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

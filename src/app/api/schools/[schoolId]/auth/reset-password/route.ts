import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSchool } from '@/lib/school';
import { otpLimiter, getClientIp, createRateLimitResponse } from '@/lib/rate-limit';
import { matchesOneTimeCode, normalizeEmail } from '@/lib/auth-security';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const clientIp = getClientIp(request);
    const ipRateLimit = otpLimiter.check(`school-reset-ip:${clientIp}`);
    if (!ipRateLimit.success) {
      return createRateLimitResponse(ipRateLimit.retryAfter!, 'Too many password reset attempts. Please try again later.');
    }

    const { email, resetCode, newPassword } = await request.json();
    const normalizedEmail = normalizeEmail(email);

    if (!email || !resetCode || !newPassword) {
      return NextResponse.json({
        error: 'Email, reset code, and new password are required'
      }, { status: 400 });
    }

    if (String(newPassword).length < 8) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters long'
      }, { status: 400 });
    }

    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const accountRateLimit = otpLimiter.check(`school-reset:${schoolId}:${normalizedEmail}`);
    if (!accountRateLimit.success) {
      return createRateLimitResponse(accountRateLimit.retryAfter!, 'Too many password reset attempts for this account. Please try again later.');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
        schoolId: school.id
      }
    });

    if (!user) {
      return NextResponse.json({
        error: 'Invalid email or reset code'
      }, { status: 400 });
    }

    // Check reset code
    if (!user.passwordResetCode || !user.passwordResetExpires) {
      return NextResponse.json({
        error: 'Invalid email or reset code'
      }, { status: 400 });
    }

    // Check if code is expired
    if (new Date() > user.passwordResetExpires) {
      return NextResponse.json({
        error: 'Invalid email or reset code'
      }, { status: 400 });
    }

    // Check if code matches
    if (!matchesOneTimeCode(String(resetCode), user.passwordResetCode)) {
      return NextResponse.json({
        error: 'Invalid email or reset code'
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

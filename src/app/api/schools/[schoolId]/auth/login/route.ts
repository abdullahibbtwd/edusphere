import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSchool } from '@/lib/school';
import { loginIpLimiter, getClientIp, createRateLimitResponse } from '@/lib/rate-limit';
import { normalizeEmail } from '@/lib/auth-security';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const clientIp = getClientIp(request);
    const ipRateLimit = loginIpLimiter.check(`school-login-ip:${clientIp}`);
    if (!ipRateLimit.success) {
      return createRateLimitResponse(ipRateLimit.retryAfter!, 'Too many login attempts from this IP. Please try again later.');
    }

    const body = await request.json();
    const emailOrPhone = body.email ?? body.emailOrPhone ?? '';
    const password = body.password;

    if (!emailOrPhone || !password) {
      return NextResponse.json({
        error: 'Email/phone and password are required'
      }, { status: 400 });
    }

    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Find user by email or phone (students can login with either)
    const isEmail = String(emailOrPhone).includes('@');
    const normalizedEmailOrPhone = isEmail ? normalizeEmail(String(emailOrPhone)) : String(emailOrPhone).trim();
    const accountRateLimit = loginIpLimiter.check(`school-login:${schoolId}:${normalizedEmailOrPhone}`);
    if (!accountRateLimit.success) {
      return createRateLimitResponse(accountRateLimit.retryAfter!, 'Too many login attempts for this account. Please try again later.');
    }

    const user = await prisma.user.findFirst({
      where: {
        schoolId: school.id,
        ...(isEmail
          ? { email: normalizedEmailOrPhone }
          : { phone: normalizedEmailOrPhone })
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        },
        student: { select: { profileImagePath: true } },
        teacher: { select: { img: true } }
      }
    });

    if (!user) {
      return NextResponse.json({
        error: 'Invalid email/phone or password'
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
        error: 'Invalid email/phone or password'
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

    // Prefer User.imageUrl; fallback to Student.profileImagePath or Teacher.img
    const imageUrl =
      user.imageUrl ??
      (user.student?.profileImagePath || null) ??
      (user.teacher?.img || null) ??
      null;

    // Set client-side accessible cookie for UI state
    response.cookies.set('user-session', JSON.stringify({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      imageUrl,
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

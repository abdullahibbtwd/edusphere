import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getSchool } from '@/lib/school';
import { registerLimiter, getClientIp, createRateLimitResponse } from '@/lib/rate-limit';
import { hashOneTimeCode, normalizeEmail } from '@/lib/auth-security';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const clientIp = getClientIp(request);
    const ipRateLimit = registerLimiter.check(`school-register-ip:${clientIp}`);
    if (!ipRateLimit.success) {
      return createRateLimitResponse(ipRateLimit.retryAfter!, 'Too many registration attempts. Please try again later.');
    }

    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const { name, email, password, role = 'STUDENT' } = await request.json();
    const normalizedEmail = normalizeEmail(email);

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({
        error: 'Name, email, and password are required'
      }, { status: 400 });
    }

    // Validate role
    const validRoles = ['STUDENT', 'TEACHER', 'PARENT', 'ADMIN', 'USER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({
        error: 'Invalid role. Must be STUDENT, TEACHER, PARENT, ADMIN, or USER'
      }, { status: 400 });
    }

    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const accountRateLimit = registerLimiter.check(`school-register:${schoolId}:${normalizedEmail}`);
    if (!accountRateLimit.success) {
      return createRateLimitResponse(accountRateLimit.retryAfter!, 'Too many registration attempts for this account. Please try again later.');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json({
        error: 'User with this email already exists'
      }, { status: 409 });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationCodeHash = hashOneTimeCode(verificationCode);
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        schoolId: school.id,
        emailVerificationCode: verificationCodeHash,
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false
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

    // Send verification email
    let emailSent = false;
    try {
      console.log('Sending verification email to:', normalizedEmail);
      console.log('Using base URL for email API:', baseUrl);

      // For testing: always send to your verified email in development
      const testEmail = process.env.NODE_ENV === 'development'
        ? 'abdullahibashirtwd@gmail.com'
        : normalizedEmail;

      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: sending to verified email:', testEmail);
        console.log('Original user email:', normalizedEmail);
      }

      const emailResponse = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testEmail,
          subject: `Verify your ${school.name} account`,
          type: 'verification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to ${school.name}!</h2>
              <p>Thank you for registering with email: <strong>${normalizedEmail}</strong></p>
              <p>Please verify your email address by entering the code below:</p>
              
              <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
              </div>
              
              <p>This code will expire in 15 minutes.</p>
              <p>If you didn't create this account, please ignore this email.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                This email was sent from ${school.name} via EduSphere.
              </p>
            </div>
          `
        })
      });

      const emailData = await emailResponse.json();
      console.log('Email response status:', emailResponse.status);
      console.log('Email response data:', emailData);

      if (emailResponse.ok) {
        emailSent = true;
        console.log('✅ Verification email sent successfully to:', testEmail);
      } else {
        console.error('❌ Failed to send verification email:', emailData);
        console.error('Response status:', emailResponse.status);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'User registered successfully. Please check your email for verification code.'
        : 'User registered successfully. Email sending failed - check console for details.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        isEmailVerified: user.isEmailVerified
      },
      // Include verification code in development for testing
      ...(process.env.NODE_ENV === 'development' && {
        verificationCode: verificationCode,
        emailSent: emailSent
      })
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

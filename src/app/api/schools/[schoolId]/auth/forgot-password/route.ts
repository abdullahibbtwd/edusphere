import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;

    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

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
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset code.'
      });
    }

    // Generate reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with reset code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCode: resetCode,
        passwordResetExpires: resetExpires
      }
    });

    // Send reset email
    try {
      const emailResponse = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: `Reset your ${school.name} password`,
          type: 'password-reset',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>You requested to reset your password for your ${school.name} account.</p>
              
              <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #dc3545; font-size: 32px; margin: 0; letter-spacing: 5px;">${resetCode}</h1>
              </div>
              
              <p>Enter this code to reset your password. This code will expire in 15 minutes.</p>
              <p>If you didn't request this password reset, please ignore this email.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                This email was sent from ${school.name} via EduSphere.
              </p>
            </div>
          `
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send password reset email');
        return NextResponse.json({
          error: 'Failed to send reset email'
        }, { status: 500 });
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json({
        error: 'Failed to send reset email'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset code.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

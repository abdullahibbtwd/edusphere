import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        error: 'Email address is required' 
      }, { status: 400 });
    }

    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

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

    console.log('Testing email for school:', school.name);
    console.log('Base URL:', baseUrl);

    // Send test email
    const emailResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: `Test Email from ${school.name}`,
        type: 'verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Test Email from ${school.name}</h2>
            <p>This is a test email to verify that the email system is working correctly with your subdomain setup.</p>
            <p><strong>School:</strong> ${school.name}</p>
            <p><strong>Subdomain:</strong> ${school.subdomain}</p>
            <p><strong>Base URL:</strong> ${baseUrl}</p>
            <p>If you receive this email, your email configuration is working!</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Sent from ${school.name} via EduSphere.
            </p>
          </div>
        `
      })
    });

    const emailData = await emailResponse.json();
    console.log('Email response:', emailData);

    if (emailResponse.ok) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        school: school.name,
        baseUrl: baseUrl,
        emailData: emailData
      });
    } else {
      return NextResponse.json({
        error: 'Failed to send test email',
        details: emailData
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();

    if (!to) {
      return NextResponse.json({ 
        error: 'Email address is required' 
      }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not configured' 
      }, { status: 500 });
    }

    console.log('Testing email to:', to);
    console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's default domain
      to: [to],
      subject: 'Test Email from EduSphere',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email</h2>
          <p>This is a test email to verify that Resend is working correctly.</p>
          <p>If you receive this email, your email configuration is working!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Sent from EduSphere via Resend.
          </p>
        </div>
      `,
    });

    console.log('Resend response:', { data, error });

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to send email',
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: data?.id
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

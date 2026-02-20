import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, type = 'verification' } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ 
        error: 'Missing required fields: to, subject, html' 
      }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'Resend API key not configured' 
      }, { status: 500 });
    }

    // Always use Resend's default domain for testing
    const finalFromEmail = 'onboarding@resend.dev';

    console.log('📧 Attempting to send email:', { to, subject, fromEmail: finalFromEmail, type });

    const { data, error } = await resend.emails.send({
      from: finalFromEmail,
      to: [to],
      subject,
      html,
    });

    console.log('📧 Resend response:', { data, error });
    
    if (error) {
      console.error('❌ Resend error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Email sent successfully:', data?.id);
    }

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ 
        error: 'Failed to send email' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

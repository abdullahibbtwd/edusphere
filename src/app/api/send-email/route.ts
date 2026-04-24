import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAuth } from '@/lib/auth-middleware';
import { getClientIp, createRateLimitResponse, otpLimiter } from '@/lib/rate-limit';
import { normalizeEmail } from '@/lib/auth-security';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const sessionUser = requireAuth(request);
    if (sessionUser instanceof NextResponse) return sessionUser;

    const ip = getClientIp(request);
    const rateCheck = otpLimiter.check(`send-email:${ip}`);
    if (!rateCheck.success) {
      return createRateLimitResponse(rateCheck.retryAfter || 60, 'Too many email requests');
    }

    const { to, subject, html, type = 'verification' } = await request.json();
    const normalizedTo = normalizeEmail(String(to || ''));
    const safeSubject = String(subject || '').trim();
    const safeHtml = String(html || '');

    if (!normalizedTo || !safeSubject || !safeHtml) {
      return NextResponse.json({ 
        error: 'Missing required fields: to, subject, html' 
      }, { status: 400 });
    }
    if (safeSubject.length > 200) {
      return NextResponse.json({ error: 'Subject is too long' }, { status: 400 });
    }
    if (safeHtml.length > 200000) {
      return NextResponse.json({ error: 'Email body is too large' }, { status: 400 });
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
      to: [normalizedTo],
      subject: safeSubject,
      html: safeHtml,
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

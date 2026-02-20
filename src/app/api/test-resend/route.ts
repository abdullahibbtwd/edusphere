import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not configured',
        status: 'missing_api_key'
      }, { status: 500 });
    }

    // Test Resend connection with your verified email
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['abdullahibashirtwd@gmail.com'], // Use your verified email for testing
      subject: 'Test Connection - EduSphere',
      html: '<p>Resend is working correctly with EduSphere!</p>',
    });

    if (error) {
      return NextResponse.json({ 
        error: 'Resend API error',
        details: error,
        status: 'api_error'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Resend is properly configured',
      status: 'configured',
      apiKeyExists: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'connection_failed'
    }, { status: 500 });
  }
}

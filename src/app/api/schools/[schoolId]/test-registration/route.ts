import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    
    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    console.log('🧪 Testing registration email flow...');
    console.log('School ID:', schoolId);
    console.log('Base URL:', baseUrl);

    // Test the send-email API directly
    const testEmail = 'abdullahibashirtwd@gmail.com';
    const testCode = '123456';

    const emailResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: testEmail,
        subject: `Test Registration Email for ${schoolId}`,
        type: 'verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Test Registration Email</h2>
            <p>This is a test email to verify the registration flow is working.</p>
            <p><strong>School:</strong> ${schoolId}</p>
            <p><strong>Test Code:</strong> ${testCode}</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${testCode}</h1>
            </div>
            <p>If you receive this email, the registration email system is working!</p>
          </div>
        `
      })
    });

    const emailData = await emailResponse.json();
    console.log('📧 Test email response:', emailData);

    return NextResponse.json({
      success: emailResponse.ok,
      message: emailResponse.ok ? 'Test email sent successfully' : 'Test email failed',
      schoolId: schoolId,
      baseUrl: baseUrl,
      emailResponse: emailData
    });

  } catch (error) {
    console.error('Test registration error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

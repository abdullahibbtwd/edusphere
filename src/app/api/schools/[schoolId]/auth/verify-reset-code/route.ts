import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSchool } from '@/lib/school';
import { matchesOneTimeCode, normalizeEmail } from '@/lib/auth-security';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const { email, code } = await request.json();
        const normalizedEmail = normalizeEmail(email);

        if (!email || !code) {
            return NextResponse.json({
                error: 'Email and code are required'
            }, { status: 400 });
        }

        const school = await getSchool(schoolId);
        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
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
                error: 'Invalid code'
            }, { status: 400 });
        }

        // Check reset code
        if (!user.passwordResetCode || !user.passwordResetExpires) {
            return NextResponse.json({
                error: 'Invalid code'
            }, { status: 400 });
        }

        // Check if code matches
        if (!matchesOneTimeCode(String(code), user.passwordResetCode)) {
            return NextResponse.json({
                error: 'Invalid code'
            }, { status: 400 });
        }

        // Check if code is expired
        if (new Date() > user.passwordResetExpires) {
            return NextResponse.json({
                error: 'Invalid code'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'Code verified successfully'
        });

    } catch (error) {
        console.error('Verify reset code error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}

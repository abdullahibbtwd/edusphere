import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email-service';
import { getSchool } from '@/lib/school';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const school = await getSchool(schoolId);
        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const user = await prisma.user.findFirst({
            where: { email, schoolId: school.id, role: 'STUDENT' }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.isEmailVerified) {
            return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
        }

        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationCode: verificationCode,
                emailVerificationExpires: verificationExpires
            }
        });

        await sendVerificationEmail(email, user.name || 'Student', verificationCode);

        return NextResponse.json({ success: true, message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Error resending student OTP:', error);
        return NextResponse.json(
            { error: 'Failed to send verification email. Please try again later.' },
            { status: 500 }
        );
    }
}

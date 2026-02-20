import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email-service";

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

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { school: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.isEmailVerified) {
            return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
        }

        // Generate new code
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update user with new code
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationCode: verificationCode,
                emailVerificationExpires: verificationExpires,
            }
        });

        // Send email
        try {
            await sendVerificationEmail(email, user.name || 'Teacher', verificationCode);
            return NextResponse.json({ success: true, message: 'OTP resent successfully' });
        } catch (emailError) {
            console.error("Failed to resend verification email:", emailError);
            return NextResponse.json({
                error: 'Failed to send email. Please try again later.'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error resending OTP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

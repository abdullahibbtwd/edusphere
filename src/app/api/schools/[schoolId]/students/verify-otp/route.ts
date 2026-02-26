import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
                { status: 400 }
            );
        }

        const school = await prisma.school.findFirst({
            where: {
                OR: [{ id: schoolId }, { subdomain: schoolId }]
            },
            select: { id: true }
        });

        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const user = await prisma.user.findFirst({
            where: { email, schoolId: school.id, role: 'STUDENT' }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (user.isEmailVerified) {
            return NextResponse.json(
                { success: true, message: 'Email already verified' },
                { status: 200 }
            );
        }

        if (!user.emailVerificationCode || !user.emailVerificationExpires) {
            return NextResponse.json(
                { error: 'Invalid verification request' },
                { status: 400 }
            );
        }

        if (user.emailVerificationCode !== String(otp)) {
            return NextResponse.json(
                { error: 'Invalid OTP' },
                { status: 400 }
            );
        }

        if (new Date() > user.emailVerificationExpires) {
            return NextResponse.json(
                { error: 'OTP has expired' },
                { status: 400 }
            );
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                emailVerificationCode: null,
                emailVerificationExpires: null
            }
        });

        return NextResponse.json(
            { success: true, message: 'Email verified successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Student OTP verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}

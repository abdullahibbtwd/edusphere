import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email-service";
import { requireRole } from '@/lib/auth-middleware';
import { hashOneTimeCode, normalizeEmail } from '@/lib/auth-security';
import { getSchool } from '@/lib/school';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const sessionUser = requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const { schoolId } = await params;
        const body = await request.json();
        const email = normalizeEmail(String(body?.email || ''));

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const school = await getSchool(schoolId);
        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        if (sessionUser.schoolId && sessionUser.schoolId !== school.id && sessionUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - You can only manage teachers for your school' },
                { status: 403 }
            );
        }

        // Find the user
        const user = await prisma.user.findFirst({
            where: { email, schoolId: school.id, role: 'TEACHER' }
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
                emailVerificationCode: hashOneTimeCode(verificationCode),
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

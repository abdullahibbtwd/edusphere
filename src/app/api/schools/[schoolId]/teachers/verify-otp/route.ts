import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { matchesOneTimeCode, normalizeEmail } from '@/lib/auth-security';
import { getSchool } from '@/lib/school';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const sessionUser = requireRole(req, ['ADMIN', 'SUPER_ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const { schoolId } = await params;
        const school = await getSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        if (sessionUser.schoolId && sessionUser.schoolId !== school.id && sessionUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - You can only manage teachers for your school' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const email = normalizeEmail(String(body?.email || ''));
        const otp = String(body?.otp || '').trim();

        if (!email || !otp) {
            return NextResponse.json(
                { error: "Email and OTP are required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findFirst({
            where: { email, schoolId: school.id, role: 'TEACHER' },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (user.isEmailVerified) {
            return NextResponse.json(
                { message: "Email already verified" },
                { status: 200 }
            );
        }

        if (!user.emailVerificationCode || !user.emailVerificationExpires) {
            return NextResponse.json(
                { error: "Invalid verification request" },
                { status: 400 }
            );
        }

        if (!matchesOneTimeCode(otp, user.emailVerificationCode)) {
            return NextResponse.json(
                { error: "Invalid OTP" },
                { status: 400 }
            );
        }

        if (new Date() > user.emailVerificationExpires) {
            return NextResponse.json(
                { error: "OTP has expired" },
                { status: 400 }
            );
        }

        // Verify user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                emailVerificationCode: null,
                emailVerificationExpires: null,
            },
        });

        return NextResponse.json(
            { success: true, message: "Email verified successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("OTP Verification Error:", error);
        return NextResponse.json(
            { error: "Failed to verify OTP" },
            { status: 500 }
        );
    }
}

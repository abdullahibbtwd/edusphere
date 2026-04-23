import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { otpLimiter, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";
import { matchesOneTimeCode, normalizeEmail } from "@/lib/auth-security";

export async function POST(req: Request) {
    try {
        // Rate limiting - 3 requests per minute per IP
        const clientIp = getClientIp(req);
        const rateLimit = otpLimiter.check(clientIp);

        if (!rateLimit.success) {
            console.warn(`⚠️ Rate limit exceeded for reset-password from IP: ${clientIp}`);
            return createRateLimitResponse(
                rateLimit.retryAfter!,
                'Too many password reset attempts. Please try again later.'
            );
        }

        const body = await req.json();
        const { email, code, newPassword } = body;

        // Validation
        if (!email || !code || !newPassword) {
            return NextResponse.json(
                { error: "Email, code, and new password are required" },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        const normalizedEmail = normalizeEmail(email);
        const accountRateLimit = otpLimiter.check(`reset:${normalizedEmail}`);
        if (!accountRateLimit.success) {
            return createRateLimitResponse(
                accountRateLimit.retryAfter!,
                'Too many password reset attempts for this account. Please try again later.'
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or reset code" },
                { status: 400 }
            );
        }

        // Check reset code
        if (!matchesOneTimeCode(code, user.passwordResetCode)) {
            return NextResponse.json(
                { error: "Invalid email or reset code" },
                { status: 400 }
            );
        }

        // Check if code has expired
        if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
            return NextResponse.json(
                { error: "Invalid email or reset code" },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update user password and clear reset code
        await prisma.user.update({
            where: { email: normalizedEmail },
            data: {
                password: hashedPassword,
                passwordResetCode: null,
                passwordResetExpires: null,
            },
        });

        console.log(`✅ Password reset successfully for: ${normalizedEmail}`);

        return NextResponse.json(
            {
                success: true,
                message: "Password reset successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        );
    }
}

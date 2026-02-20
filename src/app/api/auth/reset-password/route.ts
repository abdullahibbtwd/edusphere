import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { otpLimiter, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";

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

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or reset code" },
                { status: 400 }
            );
        }

        // Check reset code
        if (user.passwordResetCode !== code) {
            return NextResponse.json(
                { error: "Invalid reset code" },
                { status: 400 }
            );
        }

        // Check if code has expired
        if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
            return NextResponse.json(
                { error: "Reset code has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update user password and clear reset code
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                passwordResetCode: null,
                passwordResetExpires: null,
            },
        });

        console.log(`✅ Password reset successfully for: ${email}`);

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

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { otpLimiter, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";
import { hashOneTimeCode, normalizeEmail } from "@/lib/auth-security";

export async function POST(req: Request) {
    try {
        // Rate limiting - 3 requests per minute per IP
        const clientIp = getClientIp(req);
        const rateLimit = otpLimiter.check(clientIp);

        if (!rateLimit.success) {
            console.warn(`⚠️ Rate limit exceeded for forgot-password from IP: ${clientIp}`);
            return createRateLimitResponse(
                rateLimit.retryAfter!,
                'Too many password reset requests. Please try again later.'
            );
        }

        const body = await req.json();
        const { email } = body;

        // Validation
        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const normalizedEmail = normalizeEmail(email);

        const accountRateLimit = otpLimiter.check(`forgot:${normalizedEmail}`);
        if (!accountRateLimit.success) {
            return createRateLimitResponse(
                accountRateLimit.retryAfter!,
                'Too many password reset requests for this account. Please try again later.'
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user) {
            // For security, don't reveal if user exists
            return NextResponse.json(
                {
                    success: true,
                    message: "If an account with this email exists, a reset code has been sent.",
                },
                { status: 200 }
            );
        }

        // Generate reset code (6 digits)
        const resetCode = crypto.randomInt(100000, 999999).toString();
        const resetCodeHash = hashOneTimeCode(resetCode);
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Update user with reset code
        await prisma.user.update({
            where: { email: normalizedEmail },
            data: {
                passwordResetCode: resetCodeHash,
                passwordResetExpires: resetExpires,
            },
        });

        // Send reset code via email
        try {
            const { sendPasswordResetEmail } = await import("@/lib/email-service");
            await sendPasswordResetEmail(normalizedEmail, user.name || "User", resetCode);
            console.log("✅ Password reset email sent to:", normalizedEmail);
        } catch (emailError) {
            console.error("⚠️ Failed to send password reset email:", emailError);
            // Continue anyway - better user experience
        }

        // Return response
        // In development, return the code for testing
        const isDevelopment = process.env.NODE_ENV === "development";

        return NextResponse.json(
            {
                success: true,
                message: "Password reset code sent to your email",
                ...(isDevelopment && { resetCode }), // Only in development
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        );
    }
}

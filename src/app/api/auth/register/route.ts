import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerLimiter, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
    try {
        // Rate limiting - 5 requests per minute per IP
        const clientIp = getClientIp(req);
        const rateLimit = registerLimiter.check(clientIp);

        if (!rateLimit.success) {
            console.warn(`⚠️ Rate limit exceeded for registration from IP: ${clientIp}`);
            return createRateLimitResponse(
                rateLimit.retryAfter!,
                'Too many registration attempts. Please try again later.'
            );
        }

        const body = await req.json();
        const { name, email, password, confirmPassword, schoolId } = body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate verification code (6 digits)
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                emailVerificationCode: verificationCode,
                emailVerificationExpires: verificationExpires,
                isEmailVerified: false,
                role: "USER", // Default role
                schoolId: schoolId || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isEmailVerified: true,
                createdAt: true,
            },
        });

        // Send verification email
        try {
            const { sendVerificationEmail } = await import("@/lib/email-service");
            await sendVerificationEmail(email, name, verificationCode);
            console.log("✅ Verification email sent to:", email);
        } catch (emailError) {
            console.error("⚠️ Failed to send verification email:", emailError);
            // Don't fail registration if email fails - user can request resend
        }

        // Return response
        // In development, return the code for testing
        const isDevelopment = process.env.NODE_ENV === "development";

        return NextResponse.json(
            {
                success: true,
                message: "Registration successful. Please check your email for the verification code.",
                user,
                ...(isDevelopment && { verificationCode }), // Only in development
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "An error occurred during registration" },
            { status: 500 }
        );
    }
}

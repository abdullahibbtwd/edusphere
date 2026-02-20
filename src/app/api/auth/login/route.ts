import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken, getCookieOptions } from "@/lib/jwt";
import { loginIpLimiter, loginSchoolLimiter, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
    try {
        // Rate limiting - Check IP-based limit first (5 requests per minute)
        const clientIp = getClientIp(req);
        const ipRateLimit = loginIpLimiter.check(clientIp);

        if (!ipRateLimit.success) {
            console.warn(`⚠️ Rate limit exceeded for IP: ${clientIp}`);
            return createRateLimitResponse(
                ipRateLimit.retryAfter!,
                'Too many login attempts from this IP. Please try again later.'
            );
        }

        const body = await req.json();
        const { email, password, rememberMe } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                        subdomain: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Rate limiting - Check school-based limit (10 requests per minute)
        if (user.schoolId) {
            const schoolRateLimit = loginSchoolLimiter.check(`school:${user.schoolId}`);

            if (!schoolRateLimit.success) {
                console.warn(`⚠️ School rate limit exceeded for school ID: ${user.schoolId}`);
                return createRateLimitResponse(
                    schoolRateLimit.retryAfter!,
                    'Too many login attempts for this school. Please try again later.'
                );
            }
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return NextResponse.json(
                {
                    error: "Please verify your email before logging in",
                    requiresVerification: true,
                    email: user.email,
                },
                { status: 403 }
            );
        }

        // Create JWT token with user data
        const token = createToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolId,
            imageUrl: user.imageUrl,
        });

        // Prepare user data for response (excluding sensitive fields)
        const { password: _, emailVerificationCode, passwordResetCode, ...userData } = user;

        // Set cookie duration (7 days default, 30 days if "remember me")
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
        const cookieOptions = getCookieOptions(maxAge);

        // Create response
        const response = NextResponse.json(
            {
                success: true,
                message: "Login successful",
                user: userData,
            },
            { status: 200 }
        );

        // Set HTTP-only authentication cookie
        response.cookies.set({
            name: 'auth-token',
            value: token,
            ...cookieOptions,
        });

        // Also set a lighter cookie for client-side access (non-sensitive data only)
        response.cookies.set({
            name: 'user-session',
            value: JSON.stringify({
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                imageUrl: user.imageUrl,
                schoolId: user.schoolId,
                schoolName: user.school?.name,
                schoolSubdomain: user.school?.subdomain,
            }),
            httpOnly: false, // Accessible by JavaScript
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: maxAge,
            path: '/',
        });

        console.log(`✅ User logged in: ${user.email} (${user.role})`);

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "An error occurred during login" },
            { status: 500 }
        );
    }
}

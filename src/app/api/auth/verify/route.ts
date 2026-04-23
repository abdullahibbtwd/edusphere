import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchesOneTimeCode, normalizeEmail } from "@/lib/auth-security";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, code } = body;

        // Validation
        if (!email || !code) {
            return NextResponse.json(
                { error: "Email and verification code are required" },
                { status: 400 }
            );
        }

        const normalizedEmail = normalizeEmail(email);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user || user.isEmailVerified) {
            return NextResponse.json(
                { error: "Invalid or expired verification code" },
                { status: 400 }
            );
        }

        // Check verification code
        if (!matchesOneTimeCode(code, user.emailVerificationCode)) {
            return NextResponse.json(
                { error: "Invalid or expired verification code" },
                { status: 400 }
            );
        }

        // Check if code has expired
        if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
            return NextResponse.json(
                { error: "Invalid or expired verification code" },
                { status: 400 }
            );
        }

        // Update user as verified
        const updatedUser = await prisma.user.update({
            where: { email: normalizedEmail },
            data: {
                isEmailVerified: true,
                emailVerificationCode: null,
                emailVerificationExpires: null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isEmailVerified: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Email verified successfully",
                user: updatedUser,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { error: "An error occurred during verification" },
            { status: 500 }
        );
    }
}

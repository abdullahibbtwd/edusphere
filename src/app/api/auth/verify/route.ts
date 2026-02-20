import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return NextResponse.json(
                { error: "Email is already verified" },
                { status: 400 }
            );
        }

        // Check verification code
        if (user.emailVerificationCode !== code) {
            return NextResponse.json(
                { error: "Invalid verification code" },
                { status: 400 }
            );
        }

        // Check if code has expired
        if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
            return NextResponse.json(
                { error: "Verification code has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Update user as verified
        const updatedUser = await prisma.user.update({
            where: { email },
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

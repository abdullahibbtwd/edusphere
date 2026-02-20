import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: "Email and OTP are required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
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

        if (user.emailVerificationCode !== otp) {
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

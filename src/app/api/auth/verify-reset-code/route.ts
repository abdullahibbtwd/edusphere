import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchesOneTimeCode, normalizeEmail } from "@/lib/auth-security";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json(
                { error: "Email and code are required" },
                { status: 400 }
            );
        }

        const normalizedEmail = normalizeEmail(email);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: {
                passwordResetCode: true,
                passwordResetExpires: true,
            }
        });

        if (!user) {
            // Return error but mimic generic failure for security
            return NextResponse.json(
                { error: "Invalid code" },
                { status: 400 }
            );
        }

        // Check reset code
        if (!matchesOneTimeCode(code, user.passwordResetCode)) {
            return NextResponse.json(
                { error: "Invalid code" },
                { status: 400 }
            );
        }

        // Check validity
        if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
            return NextResponse.json(
                { error: "Invalid code" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Code valid" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verify reset code error:", error);
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json(
            {
                success: true,
                message: "Logged out successfully",
            },
            { status: 200 }
        );

        // Clear authentication cookies
        response.cookies.set({
            name: 'auth-token',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Expire immediately
            path: '/',
        });

        response.cookies.set({
            name: 'user-session',
            value: '',
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Expire immediately
            path: '/',
        });

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "An error occurred during logout" },
            { status: 500 }
        );
    }
}

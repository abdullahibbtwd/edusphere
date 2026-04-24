import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth-middleware";
import { normalizeEmail } from "@/lib/auth-security";

export async function POST(req: NextRequest) {
  try {
    const sessionUser = requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    if (sessionUser instanceof NextResponse) return sessionUser;

    const body = await req.json();
    const { email, name, password } = body;
    const normalizedEmail = normalizeEmail(String(email || ""));
    const cleanName = String(name || "").trim();

    if (!normalizedEmail || !cleanName || !password) {
      return NextResponse.json(
        { error: "email, name and password are required" },
        { status: 400 }
      );
    }
    if (String(password).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(String(password), 12);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: cleanName,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-middleware';

export async function PATCH(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, phone, imageUrl } = await request.json();

    if (name !== undefined && (!name || typeof name !== 'string' || name.trim().length < 2)) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        imageUrl: true,
        role: true,
        schoolId: true,
      },
    });

    // Only sync image to student/teacher when user has that role and a new image was provided
    if (imageUrl) {
      if (auth.role === 'STUDENT') {
        await prisma.student.updateMany({
          where: { userId: auth.userId },
          data: { profileImagePath: imageUrl },
        });
      }
      if (auth.role === 'TEACHER') {
        await prisma.teacher.updateMany({
          where: { userId: auth.userId },
          data: { img: imageUrl },
        });
      }
    }

    // Update the user-session cookie so Navbar/SuperAdmin Navbar see the new avatar
    const shortImageUrl =
      updated.imageUrl && !updated.imageUrl.startsWith('data:') && updated.imageUrl.length <= 400
        ? updated.imageUrl
        : null;

    const response = NextResponse.json({ user: updated });

    response.cookies.set({
      name: 'user-session',
      value: JSON.stringify({
        userId: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        imageUrl: shortImageUrl,
        schoolId: updated.schoolId,
      }),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

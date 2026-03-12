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
      select: { id: true, name: true, email: true, phone: true, imageUrl: true, role: true },
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

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

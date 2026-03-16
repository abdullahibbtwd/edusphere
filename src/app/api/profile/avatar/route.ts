import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { cloudinary, extractPublicId } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { image } = await request.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Optional: delete previous avatar if it was hosted on Cloudinary
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { imageUrl: true },
    });

    if (user?.imageUrl && user.imageUrl.includes('res.cloudinary.com')) {
      try {
        const publicId = extractPublicId(user.imageUrl);
        await cloudinary.uploader.destroy(publicId);
      } catch {
        // Ignore delete failures; do not block upload
      }
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: 'edusphere/avatars',
      resource_type: 'image',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'faces', quality: 'auto' }],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  }
}


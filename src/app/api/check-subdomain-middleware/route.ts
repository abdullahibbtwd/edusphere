import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json({ exists: false });
    }

    const school = await prisma.school.findUnique({
      where: { subdomain },
      select: {
        id: true,
        name: true,
        subdomain: true,
        isActive: true
      }
    });

    if (!school) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      school: {
        id: school.id,
        name: school.name,
        subdomain: school.subdomain,
        isActive: school.isActive
      }
    });

  } catch (error) {
    console.error('Error checking subdomain:', error);
    return NextResponse.json({ exists: false });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = Number.parseInt(searchParams.get('limit') || '24', 10);
    const limit = Number.isFinite(limitParam) ? Math.min(100, Math.max(1, limitParam)) : 24;

    const schools = await prisma.school.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        subdomain: true,
        content: {
          select: {
            schoolLogo: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
    });

    return NextResponse.json({
      count: schools.length,
      schools: schools.map((school) => ({
        id: school.id,
        name: school.name,
        subdomain: school.subdomain,
        logo: school.content?.schoolLogo ?? null,
      })),
    });
  } catch (error) {
    console.error('Error fetching carousel schools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}

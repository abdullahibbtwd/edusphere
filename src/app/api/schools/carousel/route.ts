import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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

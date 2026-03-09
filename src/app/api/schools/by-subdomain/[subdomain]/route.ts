import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis';

const CACHE_KEY = (subdomain: string) => `school:landing:${subdomain}`;
const CACHE_TTL = 300; // 5 minutes

// GET - Fetch school data by subdomain
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;

    const cached = await redis.get(CACHE_KEY(subdomain));
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const school = await prisma.school.findUnique({
      where: {
        subdomain,
        isActive: true
      },
      include: {
        content: true,
        levels: {
          where: { isActive: true },
          include: {
            classes: {
              orderBy: { name: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
        },
        subjects: {
          orderBy: { name: 'asc' }
        },
        students: {
          select: { id: true }
        }
      }
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    await redis.set(CACHE_KEY(subdomain), JSON.stringify(school), 'EX', CACHE_TTL);

    return NextResponse.json(school);
  } catch (error) {
    console.error('Error fetching school by subdomain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

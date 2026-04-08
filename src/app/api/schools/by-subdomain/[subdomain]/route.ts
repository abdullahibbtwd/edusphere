import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { loadSchoolLandingFromDb } from '@/lib/school-landing';

const CACHE_KEY = (subdomain: string) => `school:landing:${subdomain}`;
const CACHE_TTL = 604800; // 1 week

// GET - Fetch school data by subdomain
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;

    const cached = await redis.get(CACHE_KEY(subdomain));
    if (cached) {
      return NextResponse.json(cached);
    }

    const school = await loadSchoolLandingFromDb(subdomain);

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    await redis.set(CACHE_KEY(subdomain), JSON.stringify(school), CACHE_TTL);

    return NextResponse.json(school);
  } catch (error) {
    console.error('Error fetching school by subdomain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

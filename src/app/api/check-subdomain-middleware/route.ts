import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subdomainCheckLimiter, getClientIp, createRateLimitResponse } from '@/lib/rate-limit';

const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'admin',
  'app',
  'mail',
  'support',
  'help',
  'status',
  'dashboard',
  'auth',
  'cdn',
  'static',
  'assets',
  'docs',
  'blog',
  'ftp',
  'localhost',
  'root',
]);


export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = subdomainCheckLimiter.check(`middleware:${clientIp}`);
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit.retryAfter!, 'Too many subdomain checks. Please try again later.');
    }

    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json({ exists: false });
    }

    const normalizedSubdomain = subdomain.trim().toLowerCase();
    if (!normalizedSubdomain) {
      return NextResponse.json({ exists: false });
    }

    if (RESERVED_SUBDOMAINS.has(normalizedSubdomain)) {
      return NextResponse.json({ exists: false });
    }

    const school = await prisma.school.findUnique({
      where: { subdomain: normalizedSubdomain },
      select: {
        id: true,
        name: true,
        subdomain: true,
        isActive: true,
        subscription: {
          select: {
            planType: true,
          },
        },
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
        isActive: school.isActive,
        planType: school.subscription?.planType ?? 'BASIC',
      }
    });

  } catch (error) {
    console.error('Error checking subdomain:', error);
    return NextResponse.json({ exists: false });
  }
}

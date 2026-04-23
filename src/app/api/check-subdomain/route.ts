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

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = subdomainCheckLimiter.check(clientIp);
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit.retryAfter!, 'Too many subdomain checks. Please try again later.');
    }

    const { subdomain } = await request.json();

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      );
    }

    const normalizedSubdomain = String(subdomain).trim().toLowerCase();

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomainRegex.test(normalizedSubdomain)) {
      return NextResponse.json(
        {
          available: false,
          error: 'Subdomain must contain only lowercase letters, numbers, and hyphens. It cannot start or end with a hyphen.'
        },
        { status: 200 }
      );
    }

    // Check if subdomain is too short or too long
    if (normalizedSubdomain.length < 3) {
      return NextResponse.json(
        {
          available: false,
          error: 'Subdomain must be at least 3 characters long'
        },
        { status: 200 }
      );
    }

    if (normalizedSubdomain.length > 30) {
      return NextResponse.json(
        {
          available: false,
          error: 'Subdomain must be less than 30 characters long'
        },
        { status: 200 }
      );
    }

    if (RESERVED_SUBDOMAINS.has(normalizedSubdomain)) {
      return NextResponse.json(
        {
          available: false,
          subdomain: normalizedSubdomain,
          error: 'This subdomain is reserved. Please choose another one.'
        },
        { status: 200 }
      );
    }

    // Check if subdomain exists in database
    const existingSchool = await prisma.school.findUnique({
      where: { subdomain: normalizedSubdomain }
    });

    // Check if subdomain exists in school applications (excluding rejected ones)
    const activeApplication = await prisma.schoolApplication.findFirst({
      where: {
        subdomain: normalizedSubdomain,
        status: {
          not: 'REJECTED'
        }
      }
    });

    const isAvailable = !existingSchool && !activeApplication;

    return NextResponse.json({
      available: isAvailable,
      subdomain: normalizedSubdomain,
      message: isAvailable
        ? 'Subdomain is available!'
        : 'This subdomain is already taken'
    });

  } catch (error) {
    console.error('Error checking subdomain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

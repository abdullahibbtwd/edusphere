import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import {
  checkSchoolRequestLimit,
  checkSchoolUserRequestLimit,
  createRateLimitResponse,
} from '@/lib/rate-limit';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Avoid recursion for the internal subdomain lookup used by this middleware.
  if (pathname.startsWith('/api/check-subdomain-middleware')) {
    return NextResponse.next();
  }

  const hostnameWithoutPort = hostname.split(':')[0];
  const subdomain = hostnameWithoutPort.split('.')[0];

  // Verify JWT signature — not just existence
  const token = request.cookies.get('auth-token')?.value;
  let isAuthenticated = false;
  let userRole: string | null = null;
  let userId: string | null = null;
  let userSchoolSubdomain: string | null = null;

  if (token) {
    const payload = await verifyToken(token);
    isAuthenticated = !!payload;
    userRole = (payload?.role as string) ?? null;
    userId = (payload?.userId as string) ?? null;
  }

  // Fallback to session cookie if token missing or invalid
  try {
    const sessionCookie = request.cookies.get('user-session')?.value;
    if (sessionCookie) {
      const session = JSON.parse(decodeURIComponent(sessionCookie));
      userSchoolSubdomain = session.schoolSubdomain ?? null;
      if (!userRole) {
        userRole = session.role;
      }
    }
  } catch { /* ignore malformed cookie */ }

  const isMainDomain =
    subdomain === 'www' ||
    subdomain === 'localhost' ||
    subdomain === '127' ||
    hostnameWithoutPort.includes('vercel.app');

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api');

  const isUserAllowedMainRoute =
    pathname === '/' || pathname === '/schoolApplication';

  const pathSegments = pathname.split('/').filter(Boolean);
  const requestedSchoolSegment = pathSegments[0] ?? null;

  // ── Main domain ─────────────────────────────────────────────────
  if (isMainDomain) {
    if (!isAuthenticated && !isPublicRoute) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // School-bound users can only access their own school path on the main domain.
    if (
      isAuthenticated &&
      userSchoolSubdomain &&
      !isPublicRoute &&
      requestedSchoolSegment &&
      requestedSchoolSegment !== userSchoolSubdomain
    ) {
      url.pathname = `/${userSchoolSubdomain}`;
      return NextResponse.redirect(url);
    }

    // Merge USER + SCHOOL_ADMIN restriction into one check
    if (
      isAuthenticated &&
      (userRole === 'USER' || userRole === 'SCHOOL_ADMIN') &&
      !isPublicRoute &&
      !isUserAllowedMainRoute
    ) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Subdomain ───────────────────────────────────────────────────

  // Check cookie cache first — avoids a DB fetch on every request
  const cachedRaw = request.cookies.get(`school-cache:${subdomain}`)?.value;
  let schoolData: { id: string; name: string; isActive: boolean; planType?: string } | null = null;

  if (cachedRaw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(cachedRaw));
      if (parsed?.id && parsed?.name) {
        schoolData = parsed;
      }
    } catch { /* ignore malformed cache */ }
  }

  if (!schoolData) {
    try {
      const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
      const res = await fetch(`${baseUrl}/api/check-subdomain-middleware?subdomain=${subdomain}`);
      const data = await res.json();
      if (data.exists) {
        schoolData = data.school;
      }
    } catch {
      return NextResponse.next();
    }
  }

  if (!schoolData?.isActive) {
    if (pathname.startsWith(`/${subdomain}`)) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const schoolRateLimit = checkSchoolRequestLimit(
    `school:${schoolData.id}`,
    schoolData.planType
  );

  if (!schoolRateLimit.success) {
    return createRateLimitResponse(
      schoolRateLimit.retryAfter!,
      `This school's request limit has been reached for the current minute. Upgrade the plan for a higher limit.`
    );
  }

  if (isAuthenticated && userId) {
    const schoolUserRateLimit = checkSchoolUserRequestLimit(
      `school-user:${schoolData.id}:${userId}`,
      schoolData.planType
    );

    if (!schoolUserRateLimit.success) {
      return createRateLimitResponse(
        schoolUserRateLimit.retryAfter!,
        `This user has reached the request limit for the current minute. Please wait and try again.`
      );
    }
  }

  // ── School found — handle routing ───────────────────────────────
  const isSubdomainPublicRoute =
    pathname === '/' ||
    pathname === `/${subdomain}` ||
    pathname.startsWith('/auth') ||
    pathname.startsWith(`/${subdomain}/auth`) ||
    pathname.startsWith('/api');

  const isUserAllowedSubdomainRoute =
    pathname === `/${subdomain}` ||
    pathname === `/${subdomain}/application`;

  let response: NextResponse;

  if (!isAuthenticated && !isSubdomainPublicRoute) {
    url.pathname = `/${subdomain}/auth`;
    response = NextResponse.redirect(url);
  } else if (isAuthenticated && (pathname.startsWith('/auth') || pathname.startsWith(`/${subdomain}/auth`))) {
    url.pathname = `/${subdomain}`;
    response = NextResponse.redirect(url);
  } else if (isAuthenticated && userRole === 'USER' && !isSubdomainPublicRoute && !isUserAllowedSubdomainRoute) {
    url.pathname = `/${subdomain}`;
    response = NextResponse.redirect(url);
  } else if (pathname === '/') {
    url.pathname = `/${subdomain}`;
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }

  // Cache school data in a cookie for 1 hour to skip future DB fetches
  if (!cachedRaw && schoolData) {
    response.cookies.set(`school-cache:${subdomain}`, JSON.stringify(schoolData), {
      httpOnly: true,
      maxAge: 60 * 60,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|otf)).*)',
  ],
};

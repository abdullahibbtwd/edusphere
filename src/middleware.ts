import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

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

  const hostnameWithoutPort = hostname.split(':')[0];
  const subdomain = hostnameWithoutPort.split('.')[0];

  // Verify JWT signature — not just existence
  const token = request.cookies.get('auth-token')?.value;
  let isAuthenticated = false;
  let userRole: string | null = null;

  if (token) {
    const payload = await verifyToken(token);
    isAuthenticated = !!payload;
    userRole = (payload?.role as string) ?? null;
  }

  // Fallback to session cookie if token missing or invalid
  if (!userRole) {
    try {
      const sessionCookie = request.cookies.get('user-session')?.value;
      if (sessionCookie) {
        const session = JSON.parse(decodeURIComponent(sessionCookie));
        userRole = session.role;
      }
    } catch { /* ignore malformed cookie */ }
  }

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

  // ── Main domain ─────────────────────────────────────────────────
  if (isMainDomain) {
    if (!isAuthenticated && !isPublicRoute) {
      url.pathname = '/';
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
  let schoolData: { name: string; isActive: boolean } | null = null;

  if (cachedRaw) {
    try {
      schoolData = JSON.parse(decodeURIComponent(cachedRaw));
    } catch { /* ignore malformed cache */ }
  } else {
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|otf)).*)',
  ],
};

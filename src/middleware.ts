import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Extract subdomain from hostname (remove port if present)
  const hostnameWithoutPort = hostname.split(':')[0];
  const subdomain = hostnameWithoutPort.split('.')[0];

  // Check if user has auth token cookie (simplified check for Edge Runtime)
  const token = request.cookies.get('auth-token')?.value;
  const isAuthenticated = !!token; // Just check if token exists

  // Get user role from user-session cookie
  let userRole: string | null = null;
  try {
    const sessionCookie = request.cookies.get('user-session')?.value;
    if (sessionCookie) {
      const session = JSON.parse(decodeURIComponent(sessionCookie));
      userRole = session.role;
    }
  } catch (error) {
    console.error('Error parsing user-session:', error);
  }

  console.log(`🔍 Checking subdomain: "${subdomain}" from hostname: "${hostnameWithoutPort}"`);
  console.log(`🔐 User authenticated: ${isAuthenticated}, Role: ${userRole}`);

  // Define public routes that unauthenticated users can access
  const isPublicRoute = pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/api');

  // Define allowed routes for USER role
  const isUserAllowedMainRoute = pathname === '/' || pathname === '/schoolApplication';
  const isUserAllowedSubdomainRoute = (subdomainPath: string) =>
    pathname === `/${subdomainPath}` || pathname === `/${subdomainPath}/application`;

  // Check if this is main domain or localhost
  const isMainDomain = subdomain === 'www' || subdomain === 'localhost' || subdomain === '127' || hostnameWithoutPort.includes('vercel.app');

  // Handle main domain authentication
  if (isMainDomain) {
    console.log(`⏭️ Main domain: "${subdomain}"`);

    // If not authenticated and trying to access protected routes, redirect to home
    if (!isAuthenticated && !isPublicRoute) {
      console.log(`🔒 Unauthenticated user trying to access "${pathname}", redirecting to "/"`);
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // If authenticated with USER role, restrict to allowed routes only
    if (isAuthenticated && userRole === 'USER' && !isPublicRoute && !isUserAllowedMainRoute) {
      console.log(`🔒 USER role trying to access "${pathname}", redirecting to "/"`);
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // If authenticated with SCHOOL_ADMIN role, restrict to allowed routes on main domain
    if (isAuthenticated && userRole === 'SCHOOL_ADMIN' && !isPublicRoute && !isUserAllowedMainRoute) {
      console.log(`🔒 SCHOOL_ADMIN role trying to access "${pathname}" on main domain, redirecting to "/"`);
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // Handle subdomain logic
  try {
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const checkUrl = `${baseUrl}/api/check-subdomain-middleware?subdomain=${subdomain}`;

    console.log(`🌐 Checking subdomain via API: ${checkUrl}`);

    const response = await fetch(checkUrl);
    const data = await response.json();

    if (data.exists && data.school.isActive) {
      console.log(`✅ School found: "${data.school.name}" (Active: ${data.school.isActive})`);

      // Define subdomain public routes
      const isSubdomainPublicRoute =
        pathname === '/' ||
        pathname === `/${subdomain}` ||
        pathname.startsWith('/auth') ||
        pathname.startsWith(`/${subdomain}/auth`) ||
        pathname.startsWith('/api');

      // If not authenticated and trying to access protected routes on subdomain
      if (!isAuthenticated && !isSubdomainPublicRoute) {
        console.log(`🔒 Unauthenticated user trying to access "${pathname}" on subdomain, redirecting to "/${subdomain}"`);
        url.pathname = `/${subdomain}`;
        return NextResponse.redirect(url);
      }

      // If authenticated and trying to access auth routes, redirect to school home
      if (isAuthenticated && (pathname.startsWith('/auth') || pathname.startsWith(`/${subdomain}/auth`))) {
        console.log(`🔒 Authenticated user trying to access auth route "${pathname}", redirecting to "/${subdomain}"`);
        url.pathname = `/${subdomain}`;
        return NextResponse.redirect(url);
      }

      // If authenticated with USER role, restrict to allowed subdomain routes only
      if (isAuthenticated && userRole === 'USER' && !isSubdomainPublicRoute && !isUserAllowedSubdomainRoute(subdomain)) {
        console.log(`🔒 USER role trying to access "${pathname}" on subdomain, redirecting to "/${subdomain}"`);
        url.pathname = `/${subdomain}`;
        return NextResponse.redirect(url);
      }

      // Redirect root to subdomain homepage
      if (pathname === '/') {
        console.log(`🔄 Redirecting from "/" to "/${subdomain}" for school: "${data.school.name}"`);
        url.pathname = `/${subdomain}`;
        return NextResponse.redirect(url);
      }

      // If user is already on a school route, let them continue
      if (pathname.startsWith(`/${subdomain}`)) {
        console.log(`✅ Allowing access to school route: "${pathname}"`);
        return NextResponse.next();
      }

      // For any other path, redirect to school homepage
      console.log(`🔄 Redirecting from "${pathname}" to "/${subdomain}" for school: "${data.school.name}"`);
      url.pathname = `/${subdomain}`;
      return NextResponse.redirect(url);
    } else {
      console.log(`❌ School not found or inactive for subdomain: "${subdomain}"`);
      // If school doesn't exist, redirect to main domain
      if (pathname.startsWith(`/${subdomain}`)) {
        console.log(`🔄 Redirecting from school route "${pathname}" to main domain "/"`);
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }
  } catch (error) {
    console.error('Error checking subdomain:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - Static assets (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|otf)).*)',
  ],
};
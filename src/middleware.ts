import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // Extract subdomain from hostname
  const subdomain = hostname.split('.')[0];
  
  console.log(`🔍 Checking subdomain: "${subdomain}" from hostname: "${hostname}"`);
  
  // Skip middleware for main domain and localhost
  if (subdomain === 'www' || subdomain === 'localhost' || subdomain === '127.0.0.1' || hostname.includes('vercel.app')) {
    console.log(`⏭️ Skipping middleware for main domain: "${subdomain}"`);
    return NextResponse.next();
  }
  
  // Check if subdomain exists in database via API call
  try {
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const checkUrl = `${baseUrl}/api/check-subdomain-middleware?subdomain=${subdomain}`;
    
    console.log(`🌐 Checking subdomain via API: ${checkUrl}`);
    
    const response = await fetch(checkUrl);
    const data = await response.json();
    
    if (data.exists && data.school.isActive) {
      console.log(`✅ School found: "${data.school.name}" (Active: ${data.school.isActive})`);
      
      if (url.pathname === '/') {
        console.log(`🔄 Redirecting from "/" to "/${subdomain}" for school: "${data.school.name}"`);
        url.pathname = `/${subdomain}`;
        return NextResponse.redirect(url);
      }
      
      // If user is already on a school route, let them continue
      if (url.pathname.startsWith(`/${subdomain}`)) {
        console.log(`✅ Allowing access to school route: "${url.pathname}"`);
        return NextResponse.next();
      }
      
      // For any other path, redirect to school dashboard
      console.log(`🔄 Redirecting from "${url.pathname}" to "/${subdomain}" for school: "${data.school.name}"`);
      url.pathname = `/${subdomain}`;
      return NextResponse.redirect(url);
    } else {
      console.log(`❌ School not found or inactive for subdomain: "${subdomain}"`);
      // If school doesn't exist, redirect to main domain
      if (url.pathname.startsWith(`/${subdomain}`)) {
        console.log(`🔄 Redirecting from school route "${url.pathname}" to main domain "/"`);
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
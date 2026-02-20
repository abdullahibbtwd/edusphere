import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/jwt';

/**
 * Get the current user from the request cookies
 */
export function getCurrentUser(request: NextRequest): JWTPayload | null {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    return verifyToken(token);
}

/**
 * Middleware to protect routes - requires authentication
 */
export function requireAuth(request: NextRequest): NextResponse | JWTPayload {
    const user = getCurrentUser(request);

    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized - Please log in' },
            { status: 401 }
        );
    }

    return user;
}

/**
 * Middleware to protect routes - requires specific role(s)
 */
export function requireRole(
    request: NextRequest,
    allowedRoles: string[]
): NextResponse | JWTPayload {
    const user = getCurrentUser(request);

    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized - Please log in' },
            { status: 401 }
        );
    }

    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
            { error: 'Forbidden - Insufficient permissions' },
            { status: 403 }
        );
    }

    return user;
}

/**
 * Example usage in an API route:
 * 
 * import { requireAuth, requireRole } from '@/lib/auth-middleware';
 * 
 * export async function GET(request: NextRequest) {
 *   const user = requireAuth(request);
 *   if (user instanceof NextResponse) return user; // Returns error response
 *   
 *   // User is authenticated, proceed with logic
 *   return NextResponse.json({ user });
 * }
 * 
 * export async function DELETE(request: NextRequest) {
 *   const user = requireRole(request, ['ADMIN']);
 *   if (user instanceof NextResponse) return user; // Returns error response
 *   
 *   // User is admin, proceed with delete logic
 *   return NextResponse.json({ success: true });
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-middleware';

/**
 * GET /api/schools/list
 * Get list of all schools (for dropdown filters)
 */
export async function GET(request: NextRequest) {
    // Check authentication
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Only SUPER_ADMIN can access this endpoint
    if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
            { error: 'Forbidden - Super Admin access required' },
            { status: 403 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const includeInactive = searchParams.get('includeInactive') === 'true';
        const query = (searchParams.get('query') || '').trim();
        const limitParam = Number.parseInt(searchParams.get('limit') || '200', 10);
        const limit = Number.isFinite(limitParam) ? Math.min(500, Math.max(1, limitParam)) : 200;

        const schools = await prisma.school.findMany({
            where: {
                ...(includeInactive ? {} : { isActive: true }),
                ...(query
                    ? {
                          OR: [
                              { name: { contains: query, mode: 'insensitive' } },
                              { subdomain: { contains: query, mode: 'insensitive' } },
                          ],
                      }
                    : {}),
            },
            select: {
                id: true,
                name: true,
                subdomain: true,
                isActive: true,
            },
            orderBy: {
                name: 'asc',
            },
            take: limit,
        });

        return NextResponse.json({ schools });
    } catch (error) {
        console.error('Error fetching schools:', error);
        return NextResponse.json(
            { error: 'Failed to fetch schools' },
            { status: 500 }
        );
    }
}

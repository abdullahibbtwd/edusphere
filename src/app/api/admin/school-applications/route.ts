import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptSchoolIdentifiers } from '@/lib/encryption';
import { requireAuth } from '@/lib/auth-middleware';

/**
 * GET /api/admin/school-applications
 * Fetch school applications with decrypted identification numbers
 * Only accessible by SUPER_ADMIN
 */
export async function GET(request: NextRequest) {
    // Check authentication
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Only SUPER_ADMIN can access
    if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
            { error: 'Forbidden - Super Admin access required' },
            { status: 403 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (status && status !== 'ALL') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { schoolName: { contains: search, mode: 'insensitive' } },
                { principalName: { contains: search, mode: 'insensitive' } },
                { schoolEmail: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Get applications with pagination
        const [applications, total] = await Promise.all([
            prisma.schoolApplication.findMany({
                where,
                skip,
                take: limit,
                orderBy: { submittedAt: 'desc' }
            }),
            prisma.schoolApplication.count({ where })
        ]);

        // Decrypt sensitive identification numbers
        const decryptedApplications = applications.map(app => {
            const decryptedIds = decryptSchoolIdentifiers({
                rcNumber: app.rcNumber,
                nemisId: app.nemisId,
                stateApprovalNumber: app.stateApprovalNumber,
                waecNecoNumber: app.waecNecoNumber,
            });

            return {
                ...app,
                rcNumber: decryptedIds.rcNumber,
                nemisId: decryptedIds.nemisId,
                stateApprovalNumber: decryptedIds.stateApprovalNumber,
                waecNecoNumber: decryptedIds.waecNecoNumber,
            };
        });

        return NextResponse.json({
            applications: decryptedApplications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching school applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch school applications' },
            { status: 500 }
        );
    }
}

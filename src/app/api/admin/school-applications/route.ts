import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptSchoolIdentifiers } from '@/lib/encryption';
import { requireAuth } from '@/lib/auth-middleware';
import { Prisma, SchoolApplicationStatus } from '@prisma/client';

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
        const search = searchParams.get('search')?.trim() || '';
        const cursor = searchParams.get('cursor');
        const includeSensitive = searchParams.get('includeSensitive') === 'true';
        const includeTotal = searchParams.get('includeTotal') === 'true';
        const limitParam = Number.parseInt(searchParams.get('limit') || '10', 10);
        const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10;

        // Build where clause
        const where: Prisma.SchoolApplicationWhereInput = {};

        if (status && status !== 'ALL') {
            if ((Object.values(SchoolApplicationStatus) as string[]).includes(status)) {
                where.status = status as SchoolApplicationStatus;
            } else {
                return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
            }
        }

        if (search) {
            where.OR = [
                { schoolName: { contains: search, mode: 'insensitive' } },
                { principalName: { contains: search, mode: 'insensitive' } },
                { schoolEmail: { contains: search, mode: 'insensitive' } }
            ];
        }

        const selectBase = {
            id: true,
            schoolName: true,
            principalName: true,
            schoolEmail: true,
            status: true,
            submittedAt: true,
        } satisfies Prisma.SchoolApplicationSelect;

        const selectWithSensitive = {
            ...selectBase,
            rcNumber: true,
            nemisId: true,
            stateApprovalNumber: true,
            waecNecoNumber: true,
        } satisfies Prisma.SchoolApplicationSelect;

        const orderBy: Prisma.SchoolApplicationOrderByWithRelationInput[] = [
            { submittedAt: 'desc' },
            { id: 'desc' },
        ];

        const queryArgs = {
            where,
            take: limit + 1, // fetch one extra to detect next page
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            orderBy,
        };

        const applications = includeSensitive
            ? await prisma.schoolApplication.findMany({
                ...queryArgs,
                select: selectWithSensitive,
            })
            : await prisma.schoolApplication.findMany({
                ...queryArgs,
                select: selectBase,
            });

        const hasNextPage = applications.length > limit;
        const pageItems = hasNextPage ? applications.slice(0, limit) : applications;
        const nextCursor = hasNextPage ? pageItems[pageItems.length - 1]?.id ?? null : null;

        // Decrypt sensitive identifiers only when explicitly requested
        const responseApplications = includeSensitive
            ? pageItems.map((app) => {
                const appWithSensitive = app as Prisma.SchoolApplicationGetPayload<{ select: typeof selectWithSensitive }>;
                const decryptedIds = decryptSchoolIdentifiers({
                    rcNumber: appWithSensitive.rcNumber ?? null,
                    nemisId: appWithSensitive.nemisId ?? null,
                    stateApprovalNumber: appWithSensitive.stateApprovalNumber ?? null,
                    waecNecoNumber: appWithSensitive.waecNecoNumber ?? null,
                });
                return {
                    ...appWithSensitive,
                    rcNumber: decryptedIds.rcNumber,
                    nemisId: decryptedIds.nemisId,
                    stateApprovalNumber: decryptedIds.stateApprovalNumber,
                    waecNecoNumber: decryptedIds.waecNecoNumber,
                };
            })
            : pageItems;

        let total: number | undefined;
        if (includeTotal) {
            total = await prisma.schoolApplication.count({ where });
        }

        return NextResponse.json({
            applications: responseApplications,
            pagination: {
                limit,
                nextCursor,
                hasNextPage,
                ...(typeof total === 'number'
                    ? { total, totalPages: Math.ceil(total / limit) }
                    : {}),
            },
        });

    } catch (error) {
        console.error('Error fetching school applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch school applications' },
            { status: 500 }
        );
    }
}

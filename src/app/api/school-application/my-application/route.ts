import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    try {
        const userId = authUser.userId;

        // Get total count of applications submitted by this user
        const totalApplications = await prisma.schoolApplication.count({
            where: {
                submittedBy: userId
            }
        });

        // Check if user has submitted an application (get most recent)
        const application = await prisma.schoolApplication.findFirst({
            where: {
                submittedBy: userId
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });

        // Determine if user can submit another application
        // Can resubmit if: rejected and total < 3
        const canResubmit = application?.status === 'REJECTED' && totalApplications < 3;

        return NextResponse.json({
            application: application,
            totalApplications: totalApplications,
            canResubmit: canResubmit,
            maxApplications: 3
        });

    } catch (error) {
        console.error('Error checking user application:', error);
        return NextResponse.json(
            { error: 'Failed to check application status' },
            { status: 500 }
        );
    }
}

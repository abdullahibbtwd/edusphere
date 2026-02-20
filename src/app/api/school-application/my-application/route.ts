import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Get user ID from session cookie
        let userId: string | null = null;
        try {
            const sessionCookie = request.cookies.get('user-session')?.value;
            if (sessionCookie) {
                const session = JSON.parse(decodeURIComponent(sessionCookie));
                userId = session.userId;
            }
        } catch (error) {
            console.error('Error parsing user session:', error);
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'User session not found' },
                { status: 401 }
            );
        }

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

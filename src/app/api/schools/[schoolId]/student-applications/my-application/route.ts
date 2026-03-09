import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/client-auth';
import { cookies } from 'next/headers';
import { getSchool } from '@/lib/school';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;

        // In App Router, we should use a server-side session check
        // Since we're using cookies and a custom auth, let's try to get it from cookies
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('user-session');

        if (!sessionCookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);
        const userId = session.userId;

        if (!userId) {
            return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
        }

        const school = await getSchool(schoolId);
        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const application = await prisma.studentApplication.findFirst({
            where: {
                userId: userId,
                schoolId: school.id
            },
            include: {
                class: {
                    select: { name: true, level: { select: { name: true } } }
                }
            }
        });

        if (!application) {
            return NextResponse.json({ application: null, schoolName: school.name });
        }

        return NextResponse.json({
            application: {
                ...application,
                className: application.class.name,
                levelName: application.class.level.name
            },
            schoolName: school.name
        });

    } catch (error) {
        console.error('Error fetching my application:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

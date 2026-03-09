import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole, requireAuth } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

// GET result settings for a school
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const user = requireAuth(request);
        if (user instanceof NextResponse) return user;

        const school = await getSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const settings = await prisma.resultSettings.findUnique({
            where: { schoolId: school.id },
            include: {
                publishedTerm: {
                    select: {
                        id: true,
                        name: true,
                        session: { select: { id: true, name: true } },
                    },
                },
            },
        });

        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Error fetching result settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT create or update result settings (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const user = requireRole(request, ['ADMIN']);
        if (user instanceof NextResponse) return user;

        const school = await getSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const body = await request.json();
        const { promotionAverage, publishedTermId } = body;

        const settings = await prisma.resultSettings.upsert({
            where: { schoolId: school.id },
            update: {
                ...(promotionAverage !== undefined && { promotionAverage: parseFloat(promotionAverage) }),
                // Allow explicit null to unpublish; otherwise update only if provided
                ...(publishedTermId !== undefined && { publishedTermId: publishedTermId || null }),
            },
            create: {
                schoolId: school.id,
                promotionAverage: promotionAverage !== undefined ? parseFloat(promotionAverage) : 50,
                publishedTermId: publishedTermId || null,
            },
            include: {
                publishedTerm: {
                    select: {
                        id: true,
                        name: true,
                        session: { select: { id: true, name: true } },
                    },
                },
            },
        });

        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Error updating result settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole, requireAuth } from '@/lib/auth-middleware';

async function resolveSchool(schoolId: string) {
    return prisma.school.findFirst({
        where: { OR: [{ id: schoolId }, { subdomain: schoolId }] },
    });
}

// GET all assessment components for a school
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const user = requireAuth(request);
        if (user instanceof NextResponse) return user;

        const school = await resolveSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const components = await prisma.assessmentComponent.findMany({
            where: { schoolId: school.id },
            orderBy: { order: 'asc' },
        });

        return NextResponse.json({ components });
    } catch (error) {
        console.error('Error fetching assessment components:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST create a new assessment component (admin only)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const user = requireRole(request, ['ADMIN']);
        if (user instanceof NextResponse) return user;

        const school = await resolveSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const body = await request.json();
        const { name, maxScore, order } = body;

        if (!name || maxScore === undefined || maxScore === null) {
            return NextResponse.json({ error: 'Name and maxScore are required' }, { status: 400 });
        }

        const existing = await prisma.assessmentComponent.findUnique({
            where: { name_schoolId: { name, schoolId: school.id } },
        });
        if (existing) {
            return NextResponse.json({ error: 'A component with this name already exists' }, { status: 409 });
        }

        // Auto-assign order if not provided
        const lastComponent = await prisma.assessmentComponent.findFirst({
            where: { schoolId: school.id },
            orderBy: { order: 'desc' },
        });
        const nextOrder = order ?? (lastComponent ? lastComponent.order + 1 : 0);

        const component = await prisma.assessmentComponent.create({
            data: {
                name,
                maxScore: parseFloat(maxScore),
                order: nextOrder,
                schoolId: school.id,
            },
        });

        return NextResponse.json({ component }, { status: 201 });
    } catch (error) {
        console.error('Error creating assessment component:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT update one or many components (admin only) - supports bulk reorder
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const user = requireRole(request, ['ADMIN']);
        if (user instanceof NextResponse) return user;

        const school = await resolveSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const body = await request.json();

        // Bulk update (array)
        if (Array.isArray(body.components)) {
            const updated = await prisma.$transaction(
                body.components.map((c: { id: string; name?: string; maxScore?: number; order?: number }) =>
                    prisma.assessmentComponent.update({
                        where: { id: c.id },
                        data: {
                            ...(c.name !== undefined && { name: c.name }),
                            ...(c.maxScore !== undefined && { maxScore: parseFloat(String(c.maxScore)) }),
                            ...(c.order !== undefined && { order: c.order }),
                        },
                    })
                )
            );
            return NextResponse.json({ components: updated });
        }

        // Single update
        const { id, name, maxScore, order } = body;
        if (!id) return NextResponse.json({ error: 'Component id is required' }, { status: 400 });

        const component = await prisma.assessmentComponent.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(maxScore !== undefined && { maxScore: parseFloat(maxScore) }),
                ...(order !== undefined && { order }),
            },
        });

        return NextResponse.json({ component });
    } catch (error) {
        console.error('Error updating assessment component:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE a component (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const user = requireRole(request, ['ADMIN']);
        if (user instanceof NextResponse) return user;

        const school = await resolveSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Component id is required' }, { status: 400 });

        await prisma.assessmentComponent.delete({ where: { id } });

        return NextResponse.json({ message: 'Component deleted successfully' });
    } catch (error) {
        console.error('Error deleting assessment component:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

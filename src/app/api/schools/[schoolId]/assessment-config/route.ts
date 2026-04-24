import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole, requireAuth } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

// GET all assessment components for a school
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
        if (user.schoolId && user.schoolId !== school.id && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden - You can only access your school config' }, { status: 403 });
        }

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

        const school = await getSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        if (user.schoolId && user.schoolId !== school.id) {
            return NextResponse.json({ error: 'Forbidden - You can only manage your school config' }, { status: 403 });
        }

        const body = await request.json();
        const { name, maxScore, order } = body;

        if (!name || maxScore === undefined || maxScore === null) {
            return NextResponse.json({ error: 'Name and maxScore are required' }, { status: 400 });
        }
        const parsedMaxScore = Number.parseFloat(String(maxScore));
        if (!Number.isFinite(parsedMaxScore) || parsedMaxScore <= 0) {
            return NextResponse.json({ error: 'maxScore must be a positive number' }, { status: 400 });
        }
        const parsedOrder = order !== undefined ? Number.parseInt(String(order), 10) : undefined;
        if (parsedOrder !== undefined && (!Number.isFinite(parsedOrder) || parsedOrder < 0)) {
            return NextResponse.json({ error: 'order must be a non-negative integer' }, { status: 400 });
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
                name: String(name).trim(),
                maxScore: parsedMaxScore,
                order: parsedOrder ?? nextOrder,
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

        const school = await getSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        if (user.schoolId && user.schoolId !== school.id) {
            return NextResponse.json({ error: 'Forbidden - You can only manage your school config' }, { status: 403 });
        }

        const body = await request.json();

        // Bulk update (array)
        if (Array.isArray(body.components)) {
            const componentIds = body.components.map((c: { id: string }) => c.id);
            const ownedCount = await prisma.assessmentComponent.count({
                where: { schoolId: school.id, id: { in: componentIds } }
            });
            if (ownedCount !== componentIds.length) {
                return NextResponse.json({ error: 'One or more components do not belong to this school' }, { status: 403 });
            }

            const updated = await prisma.$transaction(
                body.components.map((c: { id: string; name?: string; maxScore?: number; order?: number }) =>
                    prisma.assessmentComponent.update({
                        where: { id: c.id },
                        data: {
                            ...(c.name !== undefined && { name: String(c.name).trim() }),
                            ...(c.maxScore !== undefined && {
                                maxScore: Number.isFinite(Number.parseFloat(String(c.maxScore)))
                                    ? Number.parseFloat(String(c.maxScore))
                                    : undefined
                            }),
                            ...(c.order !== undefined && { order: Number.parseInt(String(c.order), 10) }),
                        },
                    })
                )
            );
            return NextResponse.json({ components: updated });
        }

        // Single update
        const { id, name, maxScore, order } = body;
        if (!id) return NextResponse.json({ error: 'Component id is required' }, { status: 400 });

        const owned = await prisma.assessmentComponent.findFirst({
            where: { id, schoolId: school.id },
            select: { id: true }
        });
        if (!owned) {
            return NextResponse.json({ error: 'Component not found for this school' }, { status: 404 });
        }

        if (maxScore !== undefined) {
            const parsed = Number.parseFloat(String(maxScore));
            if (!Number.isFinite(parsed) || parsed <= 0) {
                return NextResponse.json({ error: 'maxScore must be a positive number' }, { status: 400 });
            }
        }
        if (order !== undefined) {
            const parsed = Number.parseInt(String(order), 10);
            if (!Number.isFinite(parsed) || parsed < 0) {
                return NextResponse.json({ error: 'order must be a non-negative integer' }, { status: 400 });
            }
        }

        const component = await prisma.assessmentComponent.update({
            where: { id },
            data: {
                ...(name !== undefined && { name: String(name).trim() }),
                ...(maxScore !== undefined && { maxScore: Number.parseFloat(String(maxScore)) }),
                ...(order !== undefined && { order: Number.parseInt(String(order), 10) }),
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

        const school = await getSchool(schoolId);
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        if (user.schoolId && user.schoolId !== school.id) {
            return NextResponse.json({ error: 'Forbidden - You can only manage your school config' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Component id is required' }, { status: 400 });

        const owned = await prisma.assessmentComponent.findFirst({
            where: { id, schoolId: school.id },
            select: { id: true }
        });
        if (!owned) {
            return NextResponse.json({ error: 'Component not found for this school' }, { status: 404 });
        }

        await prisma.assessmentComponent.delete({ where: { id } });

        return NextResponse.json({ message: 'Component deleted successfully' });
    } catch (error) {
        console.error('Error deleting assessment component:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

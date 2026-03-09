import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSchool } from '@/lib/school';
import redis from '@/lib/redis';

// PATCH - Partial update of school settings
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: identifier } = await params;
        const body = await request.json();
        const { isAdmissionsOpen } = body;

        if (typeof isAdmissionsOpen === 'undefined') {
            return NextResponse.json({ error: 'Missing isAdmissionsOpen field' }, { status: 400 });
        }

        const resolvedSchool = await getSchool(identifier);

        if (!resolvedSchool) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const school = await prisma.school.update({
            where: { id: resolvedSchool.id },
            data: { isAdmissionsOpen },
        });

        // Bust the Redis cache so getSchool reflects the updated value
        await Promise.all([
            redis.del(`school:${resolvedSchool.id}`),
            redis.del(`school:${resolvedSchool.subdomain}`),
        ]);

        return NextResponse.json({
            message: 'School settings updated successfully',
            school: {
                id: school.id,
                isAdmissionsOpen: school.isAdmissionsOpen
            }
        });
    } catch (error) {
        console.error('Error updating school settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET - Fetch school settings
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: identifier } = await params;

        const resolvedSchool = await getSchool(identifier);

        if (!resolvedSchool) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        // isAdmissionsOpen is now part of the cached shape — no extra DB query needed
        return NextResponse.json({
            id: resolvedSchool.id,
            name: resolvedSchool.name,
            subdomain: resolvedSchool.subdomain,
            isAdmissionsOpen: resolvedSchool.isAdmissionsOpen,
        });
    } catch (error) {
        console.error('Error fetching school settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

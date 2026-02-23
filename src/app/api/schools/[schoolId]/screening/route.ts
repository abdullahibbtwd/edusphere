import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function resolveSchoolId(identifier: string): Promise<string | null> {
    let school = await prisma.school.findUnique({ where: { id: identifier }, select: { id: true } });
    if (!school) {
        school = await prisma.school.findUnique({ where: { subdomain: identifier, isActive: true }, select: { id: true } });
    }
    return school?.id || null;
}

// GET - fetch current screening toggle state
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: identifier } = await params;
        const actualId = await resolveSchoolId(identifier);
        if (!actualId) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        // Use raw select with string keys to avoid stale client type issues
        const school = await prisma.$queryRaw<{ isScreeningEnabled: boolean }[]>`
      SELECT "isScreeningEnabled" FROM "schools" WHERE "id" = ${actualId} LIMIT 1
    `;

        return NextResponse.json({ isScreeningEnabled: school[0]?.isScreeningEnabled ?? false });
    } catch (err) {
        console.error('[Screening GET]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - toggle screening on/off
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: identifier } = await params;
        const actualId = await resolveSchoolId(identifier);
        if (!actualId) return NextResponse.json({ error: 'School not found' }, { status: 404 });

        const body = await req.json();
        const { isScreeningEnabled } = body;

        await prisma.$executeRaw`
      UPDATE "schools" SET "isScreeningEnabled" = ${Boolean(isScreeningEnabled)}, "updatedAt" = NOW() WHERE "id" = ${actualId}
    `;

        return NextResponse.json({ message: 'Screening updated', isScreeningEnabled: Boolean(isScreeningEnabled) });
    } catch (err) {
        console.error('[Screening PATCH]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

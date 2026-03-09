import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSchool } from '@/lib/school';

// GET - fetch current screening toggle state
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: identifier } = await params;
        const resolvedSchool = await getSchool(identifier);
        if (!resolvedSchool) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        const actualId = resolvedSchool.id;

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
        const resolvedSchool = await getSchool(identifier);
        if (!resolvedSchool) return NextResponse.json({ error: 'School not found' }, { status: 404 });
        const actualId = resolvedSchool.id;

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

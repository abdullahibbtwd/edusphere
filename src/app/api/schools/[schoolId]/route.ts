import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getActualSchoolId(identifier: string) {
    // Try as actual ID first
    let school = await prisma.school.findUnique({
        where: { id: identifier },
        select: { id: true }
    });

    if (!school) {
        // Try as subdomain
        school = await prisma.school.findUnique({
            where: { subdomain: identifier, isActive: true },
            select: { id: true }
        });
    }

    return school?.id || null;
}

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

        const actualId = await getActualSchoolId(identifier);

        if (!actualId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const school = await prisma.school.update({
            where: { id: actualId },
            data: { isAdmissionsOpen },
        });

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

        const actualId = await getActualSchoolId(identifier);

        if (!actualId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const school = await prisma.school.findUnique({
            where: { id: actualId },
            select: {
                id: true,
                isAdmissionsOpen: true,
                name: true,
                subdomain: true,
            }
        });

        return NextResponse.json(school);
    } catch (error) {
        console.error('Error fetching school settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

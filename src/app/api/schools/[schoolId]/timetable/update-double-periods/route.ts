import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const body = await request.json();
        const { updates } = body; // Array of { id: string, requiresDoublePeriod: boolean }

        if (!Array.isArray(updates)) {
            return NextResponse.json({ error: 'Invalid updates format' }, { status: 400 });
        }

        let school;
        // Try as UUID first (actual school ID)
        school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: { id: true }
        });

        // If not found by ID, try as subdomain
        if (!school) {
            school = await prisma.school.findUnique({
                where: { subdomain: schoolId, isActive: true },
                select: { id: true }
            });
        }

        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        // Process updates
        // Using transaction for atomicity
        const results = await prisma.$transaction(
            updates.map((update: { id: string; requiresDoublePeriod: boolean }) =>
                prisma.teacherSubjectClass.update({
                    where: { id: update.id },
                    data: { requiresDoublePeriod: update.requiresDoublePeriod }
                })
            )
        );

        return NextResponse.json({
            message: 'Updated successfully',
            updatedCount: results.length
        });

    } catch (error) {
        console.error('Error updating double periods:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

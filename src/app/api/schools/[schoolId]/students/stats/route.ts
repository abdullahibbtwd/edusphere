import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;

        const actualSchoolId = await getSchool(schoolId);

        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const [total, maleCount, femaleCount] = await Promise.all([
            prisma.student.count({ where: { schoolId: actualSchoolId.id } }),
            prisma.student.count({
                where: { schoolId: actualSchoolId.id, gender: 'MALE' }
            }),
            prisma.student.count({
                where: { schoolId: actualSchoolId.id, gender: 'FEMALE' }
            })
        ]);

        return NextResponse.json({
            total,
            male: maleCount,
            female: femaleCount
        });
    } catch (error) {
        console.error('Error fetching student stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

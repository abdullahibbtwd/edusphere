import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const sessionUser = requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const { schoolId } = await params;

        const actualSchoolId = await getSchool(schoolId);

        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        if (sessionUser.schoolId && sessionUser.schoolId !== actualSchoolId.id && sessionUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - You can only view student stats for your school' },
                { status: 403 }
            );
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

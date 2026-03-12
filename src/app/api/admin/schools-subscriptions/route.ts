import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';

/**
 * GET /api/admin/schools-subscriptions
 * List all (approved) schools with subscription and level count. Super admin only.
 */
export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['SUPER_ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const planFilter = searchParams.get('plan') || 'ALL'; // ALL | FREE | BASIC | PREMIUM | ENTERPRISE

    const schools = await prisma.school.findMany({
      where:
        planFilter === 'ALL'
          ? undefined
          : planFilter === 'BASIC'
          ? {
              OR: [
                { subscription: { is: null } },
                { subscription: { planType: 'BASIC' } },
              ],
            }
          : {
              subscription: {
                planType: planFilter as 'FREE' | 'PREMIUM' | 'ENTERPRISE',
              },
            },
      include: {
        subscription: true,
        _count: { select: { levels: true, students: true, teachers: true } },
      },
      orderBy: { name: 'asc' },
    });

    const list = schools.map((s) => ({
      id: s.id,
      name: s.name,
      subdomain: s.subdomain,
      email: s.email,
      isActive: s.isActive,
      totalStudents: s.totalStudents,
      totalTeachers: s.totalTeachers,
      levelCount: s._count.levels,
      studentCount: s._count.students,
      teacherCount: s._count.teachers,
      subscription: s.subscription
        ? {
            id: s.subscription.id,
            planType: s.subscription.planType,
            status: s.subscription.status,
            startDate: s.subscription.startDate.toISOString(),
            endDate: s.subscription.endDate.toISOString(),
            maxStudents: s.subscription.maxStudents,
            maxTeachers: s.subscription.maxTeachers,
          }
        : null,
    }));

    return NextResponse.json({ schools: list });
  } catch (error) {
    console.error('Error fetching schools subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 });
  }
}

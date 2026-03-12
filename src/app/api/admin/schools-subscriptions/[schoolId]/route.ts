import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';

const PLAN_LIMITS: Record<string, { maxStudents: number; maxTeachers: number }> = {
  FREE: { maxStudents: 100, maxTeachers: 10 },
  BASIC: { maxStudents: 500, maxTeachers: 50 },
  PREMIUM: { maxStudents: 2000, maxTeachers: 150 },
  ENTERPRISE: { maxStudents: 10000, maxTeachers: 500 },
};

/**
 * PATCH /api/admin/schools-subscriptions/[schoolId]
 * Create or update a school's subscription. Super admin only.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const auth = requireRole(request, ['SUPER_ADMIN']);
  if (auth instanceof NextResponse) return auth;

  const { schoolId } = await params;
  if (!schoolId) {
    return NextResponse.json({ error: 'School ID required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { planType, status, endDate } = body as {
      planType?: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
      status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';
      endDate?: string;
    };

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: { subscription: true },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const limits = planType ? PLAN_LIMITS[planType] : null;
    const end = endDate ? new Date(endDate) : undefined;

    if (school.subscription) {
      const updated = await prisma.schoolSubscription.update({
        where: { schoolId },
        data: {
          ...(planType && { planType }),
          ...(status && { status }),
          ...(end && { endDate: end }),
          ...(limits && {
            maxStudents: limits.maxStudents,
            maxTeachers: limits.maxTeachers,
          }),
        },
      });
      return NextResponse.json({ subscription: updated });
    }

    const created = await prisma.schoolSubscription.create({
      data: {
        schoolId,
        planType: planType || 'BASIC',
        status: status || 'ACTIVE',
        endDate: end || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        maxStudents: limits?.maxStudents ?? 500,
        maxTeachers: limits?.maxTeachers ?? 50,
        features: [],
      },
    });
    return NextResponse.json({ subscription: created });
  } catch (error) {
    console.error('Error updating school subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

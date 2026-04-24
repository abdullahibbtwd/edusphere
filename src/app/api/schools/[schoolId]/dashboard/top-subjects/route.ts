import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';
import { requireRole } from '@/lib/auth-middleware';

const TOP_N = 10;

/**
 * GET — Top performing subjects from stored Result rows (average % and % meeting promotion bar).
 * Query: levelId?, classId?, termId?
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const user = requireRole(request, ['ADMIN']);
    if (user instanceof NextResponse) return user;

    const { schoolId } = await params;
    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    if (user.schoolId && user.schoolId !== school.id && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - You can only view dashboard data for your school' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get('levelId') || undefined;
    const classId = searchParams.get('classId') || undefined;
    const termIdParam = searchParams.get('termId') || undefined;

    const [settings, levels, classesRaw, terms] = await Promise.all([
      prisma.resultSettings.findUnique({ where: { schoolId: school.id } }),
      prisma.level.findMany({
        where: { schoolId: school.id, isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.class.findMany({
        where: { schoolId: school.id },
        select: {
          id: true,
          name: true,
          levelId: true,
          level: { select: { id: true, name: true } },
        },
        orderBy: [{ level: { name: 'asc' } }, { name: 'asc' }],
      }),
      prisma.academicTerm.findMany({
        where: { schoolId: school.id },
        select: { id: true, name: true, session: { select: { name: true } } },
        orderBy: { startDate: 'desc' },
        take: 24,
      }),
    ]);

    const promotionAverage = settings?.promotionAverage ?? 50;

    let termId: string | null = termIdParam ?? null;
    if (termId) {
      const ok = terms.some((t) => t.id === termId);
      if (!ok) termId = null;
    }
    if (!termId && settings?.publishedTermId) {
      termId = settings.publishedTermId;
    }
    if (!termId) {
      const active = await prisma.academicTerm.findFirst({
        where: { schoolId: school.id, isActive: true },
        orderBy: { startDate: 'desc' },
        select: { id: true },
      });
      termId = active?.id ?? terms[0]?.id ?? null;
    }

    const termMeta = termId ? terms.find((t) => t.id === termId) : null;

    const components = await prisma.assessmentComponent.findMany({
      where: { schoolId: school.id },
      orderBy: { order: 'asc' },
    });
    const totalMaxScore = components.reduce((s, c) => s + c.maxScore, 0);

    const classes = classesRaw.map((c) => ({
      id: c.id,
      name: c.level?.name ? `${c.level.name} ${c.name}` : c.name,
      levelId: c.levelId,
    }));

    if (!termId || totalMaxScore <= 0) {
      return NextResponse.json({
        termId: termId ?? null,
        termName: termMeta?.name ?? null,
        promotionAverage,
        levels,
        classes,
        terms: terms.map((t) => ({ id: t.id, name: t.name, sessionName: t.session?.name })),
        subjects: [],
        message:
          !termId
            ? 'No academic term found. Add a term and enter results.'
            : 'Assessment components are not configured for this school.',
      });
    }

    const where: Prisma.ResultWhereInput = {
      schoolId: school.id,
      termId,
    };
    if (classId) {
      const isClassInSchool = classes.some((c) => c.id === classId);
      if (!isClassInSchool) {
        return NextResponse.json({ error: 'Invalid class filter for this school' }, { status: 400 });
      }
      where.classId = classId;
    } else if (levelId) {
      const isLevelInSchool = levels.some((l) => l.id === levelId);
      if (!isLevelInSchool) {
        return NextResponse.json({ error: 'Invalid level filter for this school' }, { status: 400 });
      }
      const classesInLevel = await prisma.class.findMany({
        where: { schoolId: school.id, levelId },
        select: { id: true },
      });
      const classIds = classesInLevel.map((c) => c.id);
      if (classIds.length === 0) {
        return NextResponse.json({
          termId,
          termName: termMeta?.name ?? null,
          promotionAverage,
          levels,
          classes,
          terms: terms.map((t) => ({
            id: t.id,
            name: t.name,
            sessionName: t.session?.name,
          })),
          subjects: [],
        });
      }
      where.classId = { in: classIds };
    }

    const results = await prisma.result.findMany({
      where,
      select: {
        subjectId: true,
        scores: {
          select: { score: true },
        },
        subject: { select: { id: true, name: true } },
      },
    });

    type Agg = { percentages: number[]; name: string };
    const bySubject = new Map<string, Agg>();

    for (const r of results) {
      const totalScore = r.scores.reduce((sum, s) => sum + s.score, 0);
      const pct = (totalScore / totalMaxScore) * 100;
      const key = r.subjectId;
      let entry = bySubject.get(key);
      if (!entry) {
        entry = { percentages: [], name: r.subject.name };
        bySubject.set(key, entry);
      }
      entry.percentages.push(pct);
    }

    const subjects = [...bySubject.values()]
      .map((agg) => {
        const { percentages, name } = agg;
        if (percentages.length === 0) return null;
        const passRate = Math.round(
          percentages.reduce((a, b) => a + b, 0) / percentages.length
        );
        const passed = percentages.filter((p) => p >= promotionAverage).length;
        const understanding = Math.round((passed / percentages.length) * 100);
        return { subject: name, passRate, understanding };
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
      .sort((a, b) => b.passRate - a.passRate)
      .slice(0, TOP_N);

    return NextResponse.json({
      termId,
      termName: termMeta?.name ?? null,
      promotionAverage,
      levels,
      classes,
      terms: terms.map((t) => ({ id: t.id, name: t.name, sessionName: t.session?.name })),
      subjects,
    });
  } catch (error) {
    console.error('Error fetching top subjects:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

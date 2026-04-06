import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';
import { requireAuth } from '@/lib/auth-middleware';

const TOP_N = 15;

function pctFromScores(
  scores: { score: number }[],
  totalMaxScore: number
): number {
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  return (totalScore / totalMaxScore) * 100;
}

/**
 * GET — Top students by average subject score % for the term (Result rows).
 * Query: levelId?, classId?, termId?
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const user = requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { schoolId } = await params;
    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
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
        students: [],
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
      where.classId = classId;
    } else if (levelId) {
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
          students: [],
        });
      }
      where.classId = { in: classIds };
    }

    const results = await prisma.result.findMany({
      where,
      select: {
        studentId: true,
        scores: { select: { score: true } },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            registrationNumber: true,
            applicationNumber: true,
            class: {
              select: {
                name: true,
                level: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    type Agg = { percentages: number[]; student: NonNullable<(typeof results)[0]['student']> };
    const byStudent = new Map<string, Agg>();

    for (const r of results) {
      const pct = pctFromScores(r.scores, totalMaxScore);
      const key = r.studentId;
      let entry = byStudent.get(key);
      if (!entry) {
        entry = { percentages: [], student: r.student };
        byStudent.set(key, entry);
      }
      entry.percentages.push(pct);
    }

    const ranked = [...byStudent.entries()]
      .map(([id, agg]) => {
        const { percentages, student } = agg;
        if (percentages.length === 0) return null;
        const average = Math.round(
          percentages.reduce((a, b) => a + b, 0) / percentages.length
        );
        const levelName = student.class?.level?.name ?? '—';
        const className = student.class?.name ?? '—';
        const name = `${student.firstName} ${student.lastName}`.trim();
        const reg =
          student.registrationNumber?.trim() ||
          student.applicationNumber?.trim() ||
          id.slice(0, 8);
        return {
          id,
          name,
          registrationLabel: reg,
          level: levelName,
          class: className,
          average,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
      .sort((a, b) => b.average - a.average)
      .slice(0, TOP_N);

    const termsChrono = await prisma.academicTerm.findMany({
      where: { schoolId: school.id },
      select: { id: true, startDate: true },
      orderBy: { startDate: 'asc' },
    });
    const termIdx = termsChrono.findIndex((t) => t.id === termId);
    const prevTermId =
      termIdx > 0 ? termsChrono[termIdx - 1]?.id ?? null : null;

    let prevByStudent = new Map<string, number>();
    if (prevTermId && ranked.length > 0) {
      const ids = ranked.map((s) => s.id);
      const prevRows = await prisma.result.findMany({
        where: {
          schoolId: school.id,
          termId: prevTermId,
          studentId: { in: ids },
        },
        select: {
          studentId: true,
          scores: { select: { score: true } },
        },
      });
      const prevAgg = new Map<string, number[]>();
      for (const r of prevRows) {
        const pct = pctFromScores(r.scores, totalMaxScore);
        const arr = prevAgg.get(r.studentId) ?? [];
        arr.push(pct);
        prevAgg.set(r.studentId, arr);
      }
      for (const [sid, pcts] of prevAgg) {
        if (pcts.length > 0) {
          prevByStudent.set(
            sid,
            Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
          );
        }
      }
    }

    const students = ranked.map((s, index) => {
      const prevAvg = prevByStudent.get(s.id);
      const improvement =
        prevAvg !== undefined ? s.average - prevAvg : null;
      return {
        ...s,
        position: index + 1,
        improvement,
      };
    });

    return NextResponse.json({
      termId,
      termName: termMeta?.name ?? null,
      promotionAverage,
      levels,
      classes,
      terms: terms.map((t) => ({ id: t.id, name: t.name, sessionName: t.session?.name })),
      students,
    });
  } catch (error) {
    console.error('Error fetching top students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

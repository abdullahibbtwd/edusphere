import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';

const TERM_ORDER = ['FIRST', 'SECOND', 'THIRD'] as const;
const TERM_LABELS: Record<string, string> = {
    FIRST: 'First Term',
    SECOND: 'Second Term',
    THIRD: 'Third Term'
};

/**
 * GET - Revenue tracking by session and term.
 * Returns data for line chart: X = session + term, Y = amount.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;

        const school = await getSchool(schoolId);
        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const payments = await prisma.feePayment.findMany({
            where: {
                studentFee: {
                    student: { schoolId: school.id }
                }
            },
            select: {
                amount: true,
                studentFee: {
                    select: {
                        sessionId: true,
                        term: true,
                        session: { select: { name: true, startDate: true } }
                    }
                }
            }
        });

        const byKey = new Map<
            string,
            { sessionId: string; sessionName: string; startDate: Date; term: string; amount: number }
        >();
        let totalRevenue = 0;

        for (const p of payments) {
            const sid = p.studentFee.sessionId;
            const term = p.studentFee.term;
            const name = p.studentFee.session.name;
            const startDate = p.studentFee.session.startDate;
            totalRevenue += p.amount;

            if (term === 'FULL_SESSION') {
                const third = p.amount / 3;
                for (const t of ['FIRST', 'SECOND', 'THIRD'] as const) {
                    const key = `${sid}|${t}`;
                    const existing = byKey.get(key);
                    if (existing) {
                        existing.amount += third;
                    } else {
                        byKey.set(key, {
                            sessionId: sid,
                            sessionName: name,
                            startDate,
                            term: t,
                            amount: third
                        });
                    }
                }
            } else {
                const key = `${sid}|${term}`;
                const existing = byKey.get(key);
                if (existing) {
                    existing.amount += p.amount;
                } else {
                    byKey.set(key, {
                        sessionId: sid,
                        sessionName: name,
                        startDate,
                        term,
                        amount: p.amount
                    });
                }
            }
        }

        const list = Array.from(byKey.values())
            .filter((r) => r.term !== 'FULL_SESSION')
            .map((r) => ({
            ...r,
            amount: Math.round(r.amount * 100) / 100
        }));

        list.sort((a, b) => {
            const d = a.startDate.getTime() - b.startDate.getTime();
            if (d !== 0) return d;
            return TERM_ORDER.indexOf(a.term as (typeof TERM_ORDER)[number]) - TERM_ORDER.indexOf(b.term as (typeof TERM_ORDER)[number]);
        });

        let cumulative = 0;
        const bySessionTerm = list.map((r) => {
            cumulative += r.amount;
            const termLabel = TERM_LABELS[r.term] ?? r.term;
            const label = `${r.sessionName} - ${termLabel}`;
            return {
                sessionId: r.sessionId,
                sessionName: r.sessionName,
                term: r.term,
                termLabel,
                label,
                amount: r.amount,
                cumulative: Math.round(cumulative * 100) / 100
            };
        });

        return NextResponse.json({
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            bySessionTerm
        });
    } catch (error) {
        console.error('Error fetching revenue:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

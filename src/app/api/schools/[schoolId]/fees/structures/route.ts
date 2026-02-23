import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';

// GET all fee structures for a school
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const sessionUser = requireRole(request, ['ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const classId = searchParams.get('classId');

        // Resolve School
        const actualSchool = await prisma.school.findFirst({
            where: {
                OR: [
                    { id: schoolId },
                    { subdomain: schoolId }
                ]
            }
        });

        if (!actualSchool) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const structures = await prisma.feeStructure.findMany({
            where: {
                schoolId: actualSchool.id,
                ...(sessionId && { sessionId }),
                ...(classId && { classId })
            },
            include: {
                class: {
                    select: {
                        name: true,
                        levelId: true,
                        level: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                session: {
                    select: { name: true }
                }
            },
            orderBy: [
                { class: { level: { name: 'asc' } } },
                { class: { name: 'asc' } },
                { term: 'asc' }
            ]
        });

        return NextResponse.json({ structures });
    } catch (error) {
        console.error('Error fetching fee structures:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST create or update fee structures
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const sessionUser = requireRole(request, ['ADMIN']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const body = await request.json();
        const { sessionId, levelIds, amount, structures: explicitStructures } = body;

        if (!sessionId || (!levelIds && !Array.isArray(explicitStructures))) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Resolve School
        const actualSchool = await prisma.school.findFirst({
            where: {
                OR: [
                    { id: schoolId },
                    { subdomain: schoolId }
                ]
            }
        });

        if (!actualSchool) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        let structuresToProcess = explicitStructures || [];

        if (Array.isArray(levelIds) && levelIds.length > 0) {
            // Find all classes for the selected levels
            const classes = await prisma.class.findMany({
                where: {
                    levelId: { in: levelIds },
                    schoolId: actualSchool.id
                },
                select: { id: true }
            });

            if (classes.length === 0) {
                return NextResponse.json({ error: 'No classes found for the selected levels' }, { status: 404 });
            }

            // Create structures for all terms for all classes in the levels
            const terms: ('FIRST' | 'SECOND' | 'THIRD')[] = ['FIRST', 'SECOND', 'THIRD'];
            structuresToProcess = classes.flatMap(cls =>
                terms.map(term => ({
                    classId: cls.id,
                    term,
                    amount: parseFloat(amount)
                }))
            );
        }

        // Batch update/upsert
        const results = await prisma.$transaction(
            structuresToProcess.map((s: any) =>
                prisma.feeStructure.upsert({
                    where: {
                        schoolId_sessionId_classId_term: {
                            schoolId: actualSchool.id,
                            sessionId,
                            classId: s.classId,
                            term: s.term
                        }
                    },
                    update: { amount: parseFloat(s.amount) },
                    create: {
                        schoolId: actualSchool.id,
                        sessionId,
                        classId: s.classId,
                        term: s.term,
                        amount: parseFloat(s.amount)
                    }
                })
            )
        );

        // Optional: Trigger background task to update existing StudentFee records or create new ones
        // For simplicity, we can do it here or let the system handle it when a student "registers" 
        // or when an admin clicks "Apply to All Students".

        return NextResponse.json({
            message: 'Fee structures updated successfully',
            count: results.length
        });
    } catch (error) {
        console.error('Error updating fee structures:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

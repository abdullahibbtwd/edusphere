
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';


export async function GET() {
    try {
        const teachers = await prisma.teacher.findMany({
            where: {
                name: { contains: 'Bashir', mode: 'insensitive' }
            },
            include: {
                _count: {
                    select: { teacherSubjectClasses: true }
                }
            }
        });


        return NextResponse.json(teachers.map(t => ({
            id: t.id,
            name: t.name,
            teacherId: t.teacherId,
            allocationsCount: t._count.teacherSubjectClasses
        })));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

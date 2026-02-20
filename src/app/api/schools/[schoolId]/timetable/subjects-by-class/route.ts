import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;

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

        // Fetch all active teaching assignments
        const assignments = await prisma.teacherSubjectClass.findMany({
            where: {
                schoolId: school.id,
                isActive: true
            },
            include: {
                subject: {
                    select: { id: true, name: true, code: true }
                },
                class: {
                    select: {
                        id: true,
                        name: true,
                        levelId: true,
                        level: { select: { id: true, name: true } }
                    }
                },
                teacher: {
                    select: { id: true, name: true }
                }
            },
            orderBy: [
                { class: { level: { name: 'asc' } } },
                { class: { name: 'asc' } },
                { subject: { name: 'asc' } }
            ]
        });

        // Group by Level -> Class
        const groupedData = new Map<string, {
            id: string;
            name: string;
            classes: Map<string, {
                id: string;
                name: string;
                subjects: any[];
            }>
        }>();

        assignments.forEach(assignment => {
            const levelId = assignment.class.levelId;
            const levelName = assignment.class.level.name;
            const classId = assignment.class.id;
            const className = assignment.class.name;

            // Ensure Level exists
            if (!groupedData.has(levelId)) {
                groupedData.set(levelId, {
                    id: levelId,
                    name: levelName,
                    classes: new Map()
                });
            }

            const levelGroup = groupedData.get(levelId)!;

            // Ensure Class exists
            if (!levelGroup.classes.has(classId)) {
                levelGroup.classes.set(classId, {
                    id: classId,
                    name: className,
                    subjects: []
                });
            }

            // Add Subject
            const classGroup = levelGroup.classes.get(classId)!;
            classGroup.subjects.push({
                id: assignment.id, // ID of the TeacherSubjectClass record (for updating)
                subjectId: assignment.subject.id,
                name: assignment.subject.name,
                code: assignment.subject.code,
                teacherName: assignment.teacher.name,
                requiresDoublePeriod: assignment.requiresDoublePeriod,
                hoursPerWeek: assignment.hoursPerWeek
            });
        });

        // Convert Maps to Arrays for JSON response
        const levels = Array.from(groupedData.values()).map(level => ({
            ...level,
            classes: Array.from(level.classes.values()).sort((a, b) => a.name.localeCompare(b.name))
        })).sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json({ levels });

    } catch (error) {
        console.error('Error fetching subjects by class:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

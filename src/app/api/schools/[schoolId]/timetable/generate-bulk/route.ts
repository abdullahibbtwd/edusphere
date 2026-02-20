import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateTimetableForClass, convertScheduleToJson } from '@/lib/timetable/generator';

/**
 * Bulk generate timetables for all classes in a level
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const body = await request.json();
        const { levelId, term } = body;

        if (!levelId || !term) {
            return NextResponse.json(
                { error: 'Missing levelId or term' },
                { status: 400 }
            );
        }

        // Get all classes for this level
        const classes = await prisma.class.findMany({
            where: {
                schoolId,
                levelId
            },
            include: {
                level: true
            }
        });

        if (classes.length === 0) {
            return NextResponse.json(
                { error: 'No classes found for this level' },
                { status: 404 }
            );
        }

        const results = [];
        const errors = [];

        // Generate timetable for each class
        for (const classData of classes) {
            try {
                const schedule = await generateTimetableForClass(schoolId, classData.id, term);
                const scheduleJson = convertScheduleToJson(schedule);

                // Save or update timetable
                const timetable = await prisma.timetable.upsert({
                    where: {
                        // Create a composite unique identifier
                        classId_term_schoolId: {
                            classId: classData.id,
                            term: term as any,
                            schoolId
                        }
                    },
                    update: {
                        schedule: scheduleJson,
                        updatedAt: new Date()
                    },
                    create: {
                        classId: classData.id,
                        levelId: classData.levelId,
                        term: term as any,
                        schedule: scheduleJson,
                        schoolId
                    }
                });

                results.push({
                    classId: classData.id,
                    className: `${classData.level.name} ${classData.name}`,
                    periodsGenerated: schedule.length,
                    success: true
                });
            } catch (error: any) {
                errors.push({
                    classId: classData.id,
                    className: `${classData.level.name} ${classData.name}`,
                    error: error.message,
                    success: false
                });
            }
        }

        return NextResponse.json({
            success: true,
            totalClasses: classes.length,
            successful: results.length,
            failed: errors.length,
            results,
            errors
        });

    } catch (error: any) {
        console.error('Bulk timetable generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate timetables' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * DELETE - Delete a subject
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; subjectId: string }> }
) {
    try {
        const { schoolId, subjectId } = await params;

        // Check if subject exists
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            include: {
                _count: {
                    select: {
                        teacherSubjectClasses: true,
                        examTimetables: true
                    }
                }
            }
        });

        if (!subject) {
            return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
        }

        // Check if subject is associated with any teachers or exams
        if (subject._count.teacherSubjectClasses > 0) {
            return NextResponse.json({
                error: `Cannot delete subject. It is assigned to ${subject._count.teacherSubjectClasses} teacher(s).`
            }, { status: 400 });
        }

        if (subject._count.examTimetables > 0) {
            return NextResponse.json({
                error: `Cannot delete subject. It is used in ${subject._count.examTimetables} exam timetable(s).`
            }, { status: 400 });
        }

        // Delete the subject
        await prisma.subject.delete({
            where: { id: subjectId }
        });

        return NextResponse.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
    }
}

/**
 * PATCH - Update a subject
 */
// PATCH - Update a subject
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string; subjectId: string }> }
) {
    try {
        const { schoolId, subjectId } = await params;
        const body = await request.json();
        const { name, subjectType, classIds } = body; // Expect classIds

        if (!name) {
            return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
        }

        // Determine levels and class assignment string
        let levelIdsToConnect: string[] = [];
        let classAssignmentString: string | null = null;
        let isGeneral = false;

        if (subjectType === 'general') {
            isGeneral = true;
            // Fetch all levels for the school
            const schoolLevels = await prisma.level.findMany({
                where: { schoolId },
                select: { id: true }
            });
            levelIdsToConnect = schoolLevels.map(l => l.id);
        } else if (subjectType === 'specific') {
            isGeneral = false;
            if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
                return NextResponse.json({ error: 'At least one class must be selected for specific subjects' }, { status: 400 });
            }

            // 1. Find the classes by ID to verify and get level IDs
            const classes = await prisma.class.findMany({
                where: {
                    schoolId,
                    id: { in: classIds }
                },
                select: { id: true, levelId: true }
            });

            if (classes.length === 0) {
                return NextResponse.json({ error: 'No valid classes found' }, { status: 400 });
            }

            // 2. Get unique level IDs from the selected classes
            levelIdsToConnect = [...new Set(classes.map(c => c.levelId))];

            // 3. Create the comma-separated string of IDs for storage
            classAssignmentString = classIds.join(', ');
        } else {
            return NextResponse.json({ error: 'Invalid subject type' }, { status: 400 });
        }

        // Update the subject
        const updatedSubject = await prisma.subject.update({
            where: { id: subjectId },
            data: {
                name,
                isGeneral,
                classAssignment: classAssignmentString,
                levels: {
                    set: [], // clears existing relations
                    connect: levelIdsToConnect.map(id => ({ id }))
                }
            }
        });

        return NextResponse.json({
            message: 'Subject updated successfully',
            subject: updatedSubject
        });

    } catch (error) {
        console.error('Error updating subject:', error);
        return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
    }
}

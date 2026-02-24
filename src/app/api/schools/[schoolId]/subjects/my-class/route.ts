import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';

async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
    const school = await prisma.school.findFirst({
        where: {
            OR: [
                { id: schoolIdentifier },
                { subdomain: schoolIdentifier, isActive: true }
            ]
        },
        select: { id: true }
    });
    return school?.id || null;
}

/**
 * GET - Subjects for the current student's class, with teacher name(s) per subject.
 * Student role only.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params;
        const sessionUser = requireRole(request, ['STUDENT']);
        if (sessionUser instanceof NextResponse) return sessionUser;

        const actualSchoolId = await resolveSchoolId(schoolId);
        if (!actualSchoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const userId = (sessionUser as { userId: string }).userId;
        const student = await prisma.student.findFirst({
            where: { userId, schoolId: actualSchoolId },
            include: {
                class: {
                    include: { level: { select: { name: true } } }
                }
            }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student record not found for this school' }, { status: 404 });
        }

        const classId = student.classId;
        const studentLevel = student.class?.level?.name ?? '';
        const studentClassName = student.class?.name ?? '';

        const allSubjects = await prisma.subject.findMany({
            where: { schoolId: actualSchoolId },
            include: {
                levels: { select: { name: true } },
                teacherSubjectClasses: {
                    where: { classId, isActive: true },
                    include: { teacher: { select: { id: true, name: true } } }
                }
            }
        });

        const filteredSubjects = allSubjects.filter(subject => {
            if (subject.isGeneral) return true;
            if (!subject.classAssignment) {
                const subjectLevels = subject.levels.map(l => l.name);
                if (subjectLevels.includes('JSS1') && subjectLevels.includes('JSS2') && subjectLevels.includes('JSS3')) {
                    return studentLevel.startsWith('JSS');
                }
                if (subjectLevels.includes('SS1') && subjectLevels.includes('SS2') && subjectLevels.includes('SS3')) {
                    return studentLevel.startsWith('SS');
                }
                if (subjectLevels.includes(studentLevel)) return true;
            }
            if (subject.classAssignment) {
                const [levelType, classSuffix] = subject.classAssignment.split(' Class ');
                if (levelType === 'Junior' && studentLevel.startsWith('JSS')) {
                    return studentClassName.endsWith(classSuffix);
                }
                if (levelType === 'Senior' && studentLevel.startsWith('SS')) {
                    return studentClassName.endsWith(classSuffix);
                }
            }
            return false;
        });

        const subjectsWithTeachers = filteredSubjects.map(subject => {
            const teachers = subject.teacherSubjectClasses
                .map(tsc => tsc.teacher.name)
                .filter(Boolean);
            const teacherName = teachers.length > 0
                ? teachers.join(', ')
                : '-';
            return {
                id: subject.id,
                name: subject.name,
                code: subject.code,
                creditUnit: subject.creditUnit,
                term: subject.term,
                levelName: subject.levels.length > 0 ? subject.levels[0].name : 'All Levels',
                teacherName
            };
        });

        return NextResponse.json({
            subjects: subjectsWithTeachers,
            student: {
                name: `${student.firstName} ${student.lastName}`,
                class: studentClassName,
                level: studentLevel
            }
        });
    } catch (error) {
        console.error('Error fetching my-class subjects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

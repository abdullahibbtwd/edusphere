import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

// GET - Fetch subjects for a specific student based on their class
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; studentId: string }> }
) {
  try {
    const sessionUser = requireRole(request, ['ADMIN', 'TEACHER', 'SUPER_ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    const { schoolId, studentId } = await params;

    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    if (sessionUser.schoolId && sessionUser.schoolId !== school.id && sessionUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - You can only view subjects for your school' },
        { status: 403 }
      );
    }

    // Get student's class information
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId: school.id },
      include: { 
        class: {
          include: {
            level: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get all subjects for the school
    const allSubjects = await prisma.subject.findMany({
      where: { schoolId: school.id },
      include: { 
        levels: {
          select: { name: true }
        }
      }
    });

    // Filter subjects based on student's class
    const filteredSubjects = allSubjects.filter(subject => {
      const studentLevel = student.class.level.name;
      const studentClassName = student.class.name;

      // School General - all students see these
      if (subject.isGeneral) {
        return true;
      }

      // Junior/Senior General - check if student is in the right level group
      if (!subject.classAssignment) {
        const subjectLevels = subject.levels.map(l => l.name);
        
        // Check if subject is for all junior levels
        if (subjectLevels.includes('JSS1') && subjectLevels.includes('JSS2') && subjectLevels.includes('JSS3')) {
          return studentLevel.startsWith('JSS');
        }
        
        // Check if subject is for all senior levels
        if (subjectLevels.includes('SS1') && subjectLevels.includes('SS2') && subjectLevels.includes('SS3')) {
          return studentLevel.startsWith('SS');
        }
        
        // Check if subject is for specific level
        if (subjectLevels.includes(studentLevel)) {
          return true;
        }
      }

      // Class Specific - check if student's class matches the assignment
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

    // Format the response
    const formattedSubjects = filteredSubjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      creditUnit: subject.creditUnit,
      term: subject.term,
      levelName: subject.levels.length > 0 ? subject.levels[0].name : 'All Levels',
      classAssignment: subject.classAssignment,
      isGeneral: subject.isGeneral,
      schoolId: subject.schoolId,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString()
    }));

    return NextResponse.json({
      subjects: formattedSubjects,
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        class: student.class.name,
        level: student.class.level.name
      }
    });

  } catch (error) {
    console.error('Error fetching student subjects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch subjects for a specific student based on their class
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; studentId: string }> }
) {
  try {
    const { schoolId, studentId } = await params;

    let school;
    // Try as UUID first (actual school ID)
    school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true }
    });

    // If not found by ID, try as subdomain
    if (!school) {
      school = await prisma.school.findUnique({
        where: {
          subdomain: schoolId,
          isActive: true
        },
        select: { id: true }
      });
    }

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const actualSchoolId = school.id;

    // Get student's class information
    const student = await prisma.student.findUnique({
      where: { id: studentId },
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
      where: { schoolId: actualSchoolId },
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

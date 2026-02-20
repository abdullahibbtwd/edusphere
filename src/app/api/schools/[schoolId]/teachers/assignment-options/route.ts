import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Get available subjects, classes, and levels for teacher assignment
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

    // Get all subjects
    const subjects = await prisma.subject.findMany({
      where: { schoolId: actualSchoolId },
      select: {
        id: true,
        name: true,
        code: true,
        classAssignment: true,
        levels: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Get all classes with their levels
    const classes = await prisma.class.findMany({
      where: { schoolId: actualSchoolId },
      include: {
        level: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { level: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    // Get all levels
    const levels = await prisma.level.findMany({
      where: { schoolId: actualSchoolId },
      select: {
        id: true,
        name: true
      },
      orderBy: { name: 'asc' }
    });

    // Format subjects with their available classes
    const formattedSubjects = subjects.map(subject => {
      let availableClasses = [];

      if (subject.classAssignment) {
        if (subject.classAssignment.includes(' Class ')) {
          // Format 1: Legacy string "Junior Class A"
          const [levelType, classSuffix] = subject.classAssignment.split(' Class ');
          const levelNames = levelType === 'Junior'
            ? ['JSS1', 'JSS2', 'JSS3']
            : ['SS1', 'SS2', 'SS3'];

          availableClasses = classes.filter(cls =>
            levelNames.includes(cls.level.name) && cls.name.endsWith(classSuffix)
          );
        } else {
          // Format 2 & 3: Comma-separated IDs or Names
          const assignments = subject.classAssignment.split(',').map(s => s.trim());
          availableClasses = classes.filter(cls =>
            assignments.includes(cls.id) || assignments.includes(cls.name)
          );
        }
      } else {
        // Format 4: General subject (no classAssignment string) - filter by Level IDs
        const assignedLevelIds = subject.levels.map(level => level.id);

        if (assignedLevelIds.length === 0) {
          availableClasses = classes;
        } else {
          availableClasses = classes.filter(cls => assignedLevelIds.includes(cls.levelId));
        }
      }

      return {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        classAssignment: subject.classAssignment,
        levels: subject.levels,
        availableClasses: availableClasses.map(cls => ({
          id: cls.id,
          name: cls.name,
          levelName: cls.level.name,
          fullName: `${cls.level.name}${cls.name}`,
          levelId: cls.levelId // Add this
        }))
      };
    });

    return NextResponse.json({
      subjects: formattedSubjects,
      classes: classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        levelName: cls.level.name,
        fullName: `${cls.level.name}${cls.name}`,
        levelId: cls.levelId
      })),
      levels: levels
    });

  } catch (error) {
    console.error('Error fetching assignment options:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch school classes with counts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const levelId = searchParams.get('levelId');
    const skip = (page - 1) * limit;

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

    const where: any = { schoolId: actualSchoolId };
    if (levelId) {
      where.levelId = levelId;
    }

    // Get classes with related data
    const classes = await prisma.class.findMany({
      where,
      include: {
        level: {
          select: { name: true }
        },
        supervisor: {
          select: { name: true }
        },
        _count: {
          select: {
            students: true,
            teacherSubjectClasses: true
          }
        }
      },
      orderBy: [
        { level: { name: 'asc' } },
        { name: 'asc' }
      ],
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.class.count({
      where
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Format the response
    const formattedClasses = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      levelName: cls.level.name,
      studentCount: cls._count.students,
      subjectCount: cls._count.teacherSubjectClasses,
      headTeacher: cls.supervisor?.name || 'Not assigned',
      description: '',
      isActive: true,
      schoolId: cls.schoolId,
      levelId: cls.levelId,
      createdAt: cls.createdAt.toISOString(),
      updatedAt: cls.updatedAt.toISOString()
    }));

    return NextResponse.json({
      classes: formattedClasses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create classes for selected levels
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const body = await request.json();
    const { mode, levelIds, suffixes, classes: customClasses } = body;

    // Validate mode
    if (!mode || !['auto', 'custom'].includes(mode)) {
      return NextResponse.json({
        error: 'Mode is required and must be either "auto" or "custom"'
      }, { status: 400 });
    }

    // Validate based on mode
    if (mode === 'auto') {
      if (!levelIds || !Array.isArray(levelIds) || levelIds.length === 0) {
        return NextResponse.json({
          error: 'levelIds array is required for auto mode'
        }, { status: 400 });
      }
      if (!suffixes || !Array.isArray(suffixes) || suffixes.length === 0) {
        return NextResponse.json({
          error: 'suffixes array is required for auto mode (e.g., ["A", "B", "C"])'
        }, { status: 400 });
      }
    } else if (mode === 'custom') {
      if (!customClasses || !Array.isArray(customClasses) || customClasses.length === 0) {
        return NextResponse.json({
          error: 'classes array is required for custom mode'
        }, { status: 400 });
      }
      // Validate each custom class has levelId and name
      for (const cls of customClasses) {
        if (!cls.levelId || !cls.name) {
          return NextResponse.json({
            error: 'Each class must have levelId and name'
          }, { status: 400 });
        }
      }
    }

    let school;
    // Try as UUID first (actual school ID)
    school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    // If not found by ID, try as subdomain
    if (!school) {
      school = await prisma.school.findUnique({
        where: {
          subdomain: schoolId,
          isActive: true
        }
      });
    }

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    let classesToCreate: Array<{ name: string; levelId: string; schoolId: string }> = [];

    if (mode === 'auto') {
      // Verify all levelIds exist and belong to this school
      const levels = await prisma.level.findMany({
        where: {
          id: { in: levelIds },
          schoolId: school.id
        }
      });

      if (levels.length !== levelIds.length) {
        return NextResponse.json({
          error: 'One or more level IDs are invalid or do not belong to this school'
        }, { status: 400 });
      }

      // Check for existing classes for these levels
      const existingClasses = await prisma.class.findMany({
        where: {
          schoolId: school.id,
          levelId: { in: levelIds }
        },
        select: { levelId: true, name: true }
      });

      // Create classes for each level and suffix combination
      for (const level of levels) {
        for (const suffix of suffixes) {
          const className = `${level.name}${suffix}`;

          // Check if this class already exists
          const exists = existingClasses.some(
            cls => cls.levelId === level.id && cls.name === className
          );

          if (exists) {
            return NextResponse.json({
              error: `Class "${className}" already exists for level "${level.name}"`
            }, { status: 400 });
          }

          classesToCreate.push({
            name: className,
            levelId: level.id,
            schoolId: school.id
          });
        }
      }
    } else {
      // Custom mode
      const levelIdsFromCustom: string[] = Array.from(new Set(customClasses.map((cls: any) => cls.levelId as string)));

      // Verify all levelIds exist and belong to this school
      const levels = await prisma.level.findMany({
        where: {
          id: { in: levelIdsFromCustom },
          schoolId: school.id
        }
      });

      if (levels.length !== levelIdsFromCustom.length) {
        return NextResponse.json({
          error: 'One or more level IDs are invalid or do not belong to this school'
        }, { status: 400 });
      }

      // Check for existing classes with same names in same levels
      const existingClasses = await prisma.class.findMany({
        where: {
          schoolId: school.id,
          levelId: { in: levelIdsFromCustom }
        },
        select: { levelId: true, name: true }
      });

      for (const cls of customClasses) {
        const exists = existingClasses.some(
          existing => existing.levelId === cls.levelId && existing.name === cls.name
        );

        if (exists) {
          const level = levels.find(l => l.id === cls.levelId);
          return NextResponse.json({
            error: `Class "${cls.name}" already exists for level "${level?.name}"`
          }, { status: 400 });
        }

        classesToCreate.push({
          name: cls.name.trim(),
          levelId: cls.levelId,
          schoolId: school.id
        });
      }
    }

    // Create all classes
    const createdClasses = await prisma.class.createMany({
      data: classesToCreate
    });

    // Fetch the newly created classes with their details
    const newClasses = await prisma.class.findMany({
      where: {
        schoolId: school.id,
        levelId: { in: mode === 'auto' ? levelIds : [...new Set(customClasses.map((c: any) => c.levelId as string))] }
      },
      include: {
        level: {
          select: { name: true }
        },
        supervisor: {
          select: { name: true }
        },
        _count: {
          select: {
            students: true,
            teacherSubjectClasses: true
          }
        }
      },
      orderBy: [
        { level: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    const formattedClasses = newClasses.map(cls => ({
      id: cls.id,
      name: cls.name,
      levelName: cls.level.name,
      studentCount: cls._count.students,
      subjectCount: cls._count.teacherSubjectClasses,
      headTeacher: cls.supervisor?.name || 'Not assigned',
      description: '',
      isActive: true,
      schoolId: cls.schoolId,
      levelId: cls.levelId,
      createdAt: cls.createdAt.toISOString(),
      updatedAt: cls.updatedAt.toISOString()
    }));

    return NextResponse.json({
      message: `Successfully created ${createdClasses.count} classes`,
      classes: formattedClasses
    });

  } catch (error) {
    console.error('Error creating classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

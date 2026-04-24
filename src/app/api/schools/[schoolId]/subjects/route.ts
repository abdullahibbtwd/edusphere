import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';
import { getSchool } from '@/lib/school';

// GET - Fetch school subjects with class assignments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const sessionUser = requireRole(request, ['ADMIN', 'TEACHER', 'SUPER_ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    const { schoolId } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10)));
    const levelId = searchParams.get('levelId');
    const classId = searchParams.get('classId');
    const skip = (page - 1) * limit;

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

    // Build query filter
    const whereClause: any = { schoolId: school.id };

    if (classId) {
      // Filter by specific class (e.g. SS1 A): show general + subjects that include this class in classAssignment
      const targetClass = await prisma.class.findFirst({
        where: { id: classId, schoolId: school.id },
        select: { id: true, name: true, levelId: true }
      });

      if (targetClass) {
        const name = targetClass.name.trim();
        const level = targetClass.levelId
          ? await prisma.level.findUnique({
              where: { id: targetClass.levelId },
              select: { name: true }
            })
          : null;
        const levelName = level?.name ?? '';

        // Token match: class name as whole token ("A", "A, C", "C, A", etc.)
        const tokenMatch =
          name.length > 0
            ? [
                { classAssignment: name },
                { classAssignment: { startsWith: `${name}, ` } },
                { classAssignment: { startsWith: `${name},` } },
                { classAssignment: { endsWith: `, ${name}` } },
                { classAssignment: { endsWith: `,${name}` } },
                { classAssignment: { contains: `, ${name}, ` } },
                { classAssignment: { contains: `,${name},` } },
                { classAssignment: { contains: `${name},` } },
                { classAssignment: { contains: `,${name}` } },
              ]
            : [];

        // "Level Class" format (e.g. "SS1 A", "SS1A", "JSS1 C") in case classAssignment stores that
        const levelClassMatch =
          levelName && name.length > 0
            ? [
                { classAssignment: { contains: `${levelName} ${name}` } },
                { classAssignment: { contains: `${levelName}${name}` } },
                { classAssignment: { contains: `${levelName}, ${name}` } },
                { classAssignment: { contains: `, ${levelName} ${name}` } },
                { classAssignment: { contains: `, ${levelName}${name}` } },
              ]
            : [];

        whereClause.OR = [
          { isGeneral: true },
          { classAssignment: { contains: targetClass.id } },
          ...tokenMatch,
          ...levelClassMatch,
          {
            AND: [
              { levels: { some: { id: targetClass.levelId } } },
              { classAssignment: null },
            ],
          },
        ];
      }
    } else if (levelId) {
      // Logic for filtering by Level
      whereClause.OR = [
        { isGeneral: true }, // General subjects apply to all levels
        { levels: { some: { id: levelId } } } // Connected to this level
      ];
    }

    // Get subjects with related data
    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: {
        levels: {
          select: { name: true, id: true }
        },
        _count: {
          select: {
            teacherSubjectClasses: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ],
      skip,
      take: limit
    });

    // Get total count for pagination with same filter
    const totalCount = await prisma.subject.count({
      where: whereClause
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Fetch all classes for mapping IDs to names efficiently
    const allClasses = await prisma.class.findMany({
      where: { schoolId: school.id },
      select: { id: true, name: true }
    });
    const classMap = new Map(allClasses.map(c => [c.id, c.name]));
    const classNameMap = new Map(allClasses.map(c => [c.name, c.id])); // Reverse map for legacy data

    // Format the response
    const formattedSubjects = await Promise.all(subjects.map(async (subject) => {
      let classInfo = 'All Classes';
      let classIds: string[] = [];

      // Use classAssignment to determine class display
      if (subject.classAssignment) {
        if (subject.classAssignment.includes(' Class ')) {
          // Legacy format support: "Junior Class A"
          const [levelType, classSuffix] = subject.classAssignment.split(' Class ');
          const levelNames = levelType === 'Junior'
            ? ['JSS1', 'JSS2', 'JSS3']
            : ['SS1', 'SS2', 'SS3'];

          const classNames = levelNames.map(level => `${level}${classSuffix}`);
          classInfo = classNames.join(', ');
          // Try to resolve legacy names to IDs if exact matches exist
          classIds = classNames.map(name => classNameMap.get(name)).filter(id => id) as string[];

        } else {
          // New format: could be a list of IDs or list of Names
          const assignments = subject.classAssignment.split(', ').map(s => s.trim());
          const areIds = assignments.every(id => classMap.has(id)); // Check if they look like known IDs

          if (areIds) {
            // It's a list of IDs
            classIds = assignments;
            const names = assignments.map(id => classMap.get(id) || 'Unknown Class');
            classInfo = names.join(', ');
          } else {
            // It's likely a list of Names (from previous step before this refactor)
            classInfo = subject.classAssignment;
            // Try to resolve names to IDs for the edit form
            classIds = assignments.map(name => classNameMap.get(name)).filter(id => id) as string[];
          }
        }
      } else if (subject.levels.length > 0) {
        // General subjects or multi-level subjects
        const levelNames = subject.levels.map(level => level.name).sort(); // Sort for consistency

        // Check if it's truly "All Levels" (e.g. JSS1-SS3)
        // We know we have 6 levels total usually.
        // But let's just use the names joined by comma if it's short, or a summary if long?
        // User asked: "remove that all jujnir oor senir just wirte the level"
        // So we will just join them.
        classInfo = levelNames.join(', ') + ' Classes';
      }

      const displayLevelName = subject.levels.length === 6 // If all 6 levels (JSS1-3, SS1-3)
        ? 'All Levels'
        : (subject.levels.length > 0 ? subject.levels.map(l => l.name).sort().join(', ') : 'All Levels');

      return {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        creditUnit: subject.creditUnit,
        term: subject.term,
        levelName: displayLevelName,
        classes: classInfo,
        classAssignment: subject.classAssignment,
        classIds: classIds, // Return resolved IDs for frontend state
        teacherCount: subject._count.teacherSubjectClasses,
        isGeneral: subject.isGeneral,
        schoolId: subject.schoolId,
        levelId: subject.levels.length > 0 ? subject.levels[0].id : null,
        createdAt: subject.createdAt.toISOString(),
        updatedAt: subject.updatedAt.toISOString()
      };
    }));

    return NextResponse.json({
      subjects: formattedSubjects,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create subject with class assignments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const sessionUser = requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
    if (sessionUser instanceof NextResponse) return sessionUser;

    const { schoolId } = await params;
    const body = await request.json();
    const { name, subjectType, classIds } = body; // Expect classIds instead of classNames

    if (!name || !subjectType) {
      return NextResponse.json({
        error: 'Subject name and type are required'
      }, { status: 400 });
    }

    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    if (sessionUser.schoolId && sessionUser.schoolId !== school.id && sessionUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - You can only manage subjects for your school' },
        { status: 403 }
      );
    }

    let levelIdsToConnect: string[] = [];
    let classAssignmentStr: string | null = null;
    let isGeneral = false;

    if (subjectType === 'general') {
      isGeneral = true;
      // General subjects apply to ALL levels
      const allLevels = await prisma.level.findMany({
        where: { schoolId: school.id }
      });
      levelIdsToConnect = allLevels.map(level => level.id);
    } else if (subjectType === 'specific') {
      if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
        return NextResponse.json({
          error: 'At least one class must be selected for specific subjects'
        }, { status: 400 });
      }

      // Validate IDs and get levels
      const classes = await prisma.class.findMany({
        where: {
          schoolId: school.id,
          id: { in: classIds } // Query by IDs
        }
      });

      if (classes.length !== classIds.length) {
        // Some IDs might be invalid, but we'll proceed with valid ones
      }

      // Get unique level IDs from the selected classes
      levelIdsToConnect = [...new Set(classes.map(cls => cls.levelId))];

      // Store CLASS IDs as comma-separated string
      classAssignmentStr = classIds.join(', ');
    } else {
      return NextResponse.json({ error: 'Invalid subject type' }, { status: 400 });
    }

    // Create the subject
    const subject = await prisma.subject.create({
      data: {
        name,
        code: name.toUpperCase().replace(/\s+/g, '').substring(0, 10), // Generate code from name
        creditUnit: 1, // Default credit unit
        term: 'FIRST', // Default term
        isGeneral,
        classAssignment: classAssignmentStr, // Store IDs
        schoolId: school.id
      }
    });

    // Assign to levels if specified
    if (levelIdsToConnect.length > 0) {
      await prisma.subject.update({
        where: { id: subject.id },
        data: {
          levels: {
            connect: levelIdsToConnect.map(id => ({ id }))
          }
        }
      });
    }

    // Fetch the created subject with its details for immediate display
    const createdSubject = await prisma.subject.findUnique({
      where: { id: subject.id },
      include: {
        levels: {
          select: { name: true, id: true }
        },
        _count: {
          select: {
            teacherSubjectClasses: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Subject created successfully',
      subject: createdSubject
    });

  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

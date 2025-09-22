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

    // Get classes with related data
    const classes = await prisma.class.findMany({
      where: { schoolId: actualSchoolId },
      include: {
        level: {
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
      where: { schoolId: actualSchoolId }
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Format the response
    const formattedClasses = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      levelName: cls.level.name,
      studentCount: cls._count.students,
      subjectCount: cls._count.teacherSubjectClasses,
      headTeacher: 'Not assigned',
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

// POST - Create classes automatically
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const body = await request.json();
    const { levelRange, classSuffixes } = body;

    if (!levelRange || !classSuffixes) {
      return NextResponse.json({ 
        error: 'Level range and class suffixes are required' 
      }, { status: 400 });
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

    // Get levels based on the range
    let levelNames = [];
    switch (levelRange) {
      case 'JSS1-3':
        levelNames = ['JSS1', 'JSS2', 'JSS3'];
        break;
      case 'SS1-3':
        levelNames = ['SS1', 'SS2', 'SS3'];
        break;
      case 'JSS1-SS3':
        levelNames = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
        break;
      default:
        return NextResponse.json({ error: 'Invalid level range' }, { status: 400 });
    }

    // Find the levels in the database
    const levels = await prisma.level.findMany({
      where: {
        schoolId: school.id,
        name: { in: levelNames }
      }
    });

    if (levels.length === 0) {
      return NextResponse.json({ 
        error: 'No levels found for the specified range. Please create levels first.' 
      }, { status: 400 });
    }

    // Check if classes already exist for any of these levels
    const existingClasses = await prisma.class.findMany({
      where: {
        schoolId: school.id,
        levelId: { in: levels.map(l => l.id) }
      }
    });

    if (existingClasses.length > 0) {
      return NextResponse.json({
        error: 'Classes already exist for some of these levels. Please delete existing classes first.'
      }, { status: 400 });
    }

    // Create classes for each level and suffix combination
    const classesToCreate = [];
    for (const level of levels) {
      for (const suffix of classSuffixes) {
        classesToCreate.push({
          name: `${level.name}${suffix}`,
          levelId: level.id,
          schoolId: school.id
        });
      }
    }

    const createdClasses = await prisma.class.createMany({
      data: classesToCreate
    });

    // Fetch the newly created classes with their details
    const newClasses = await prisma.class.findMany({
      where: {
        schoolId: school.id,
        levelId: { in: levels.map(l => l.id) }
      },
      include: {
        level: {
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
      headTeacher: 'Not assigned',
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

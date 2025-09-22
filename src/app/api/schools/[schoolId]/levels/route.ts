import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch school levels with counts
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

    // First, try to find the school by ID or subdomain
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

    // Get levels with counts
    const [levels, total] = await Promise.all([
      prisma.level.findMany({
        where: { schoolId: actualSchoolId },
        include: {
          _count: {
            select: {
              classes: true,
              subjects: true,
            }
          },
          classes: {
            include: {
              _count: {
                select: {
                  students: true
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.level.count({ where: { schoolId: actualSchoolId } })
    ]);

    // Calculate student count for each level
    const levelsWithCounts = levels.map(level => ({
      id: level.id,
      name: level.name,
      description: level.description,
      isActive: level.isActive,
      classCount: level._count.classes,
      subjectCount: level._count.subjects,
      studentCount: level.classes.reduce((sum, cls) => sum + cls._count.students, 0),
      schoolId: level.schoolId,
      createdAt: level.createdAt,
      updatedAt: level.updatedAt
    }));

    return NextResponse.json({
      levels: levelsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create levels automatically
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const body = await request.json();
    const { levelType } = body;

    if (!levelType) {
      return NextResponse.json({ error: 'Level type is required' }, { status: 400 });
    }

    // First, try to find the school by ID or subdomain
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


    // Check if levels already exist for this school
    const existingLevels = await prisma.level.findMany({
      where: { schoolId: school.id }
    });

    if (existingLevels.length > 0) {
      return NextResponse.json({ 
        error: 'Levels already exist for this school. Please delete existing levels first.' 
      }, { status: 400 });
    }

    let levelsToCreate = [];

    switch (levelType) {
      case 'JSS1-3':
        levelsToCreate = [
          { name: 'JSS1', description: 'Junior Secondary School Year 1' },
          { name: 'JSS2', description: 'Junior Secondary School Year 2' },
          { name: 'JSS3', description: 'Junior Secondary School Year 3' }
        ];
        break;
      case 'SS1-3':
        levelsToCreate = [
          { name: 'SS1', description: 'Senior Secondary School Year 1' },
          { name: 'SS2', description: 'Senior Secondary School Year 2' },
          { name: 'SS3', description: 'Senior Secondary School Year 3' }
        ];
        break;
      case 'JSS1-SS3':
        levelsToCreate = [
          { name: 'JSS1', description: 'Junior Secondary School Year 1' },
          { name: 'JSS2', description: 'Junior Secondary School Year 2' },
          { name: 'JSS3', description: 'Junior Secondary School Year 3' },
          { name: 'SS1', description: 'Senior Secondary School Year 1' },
          { name: 'SS2', description: 'Senior Secondary School Year 2' },
          { name: 'SS3', description: 'Senior Secondary School Year 3' }
        ];
        break;
      default:
        return NextResponse.json({ error: 'Invalid level type' }, { status: 400 });
    }

    // Create all levels
    const createdLevels = await prisma.level.createMany({
      data: levelsToCreate.map(level => ({
        ...level,
        schoolId: school.id
      }))
    });

    // Fetch the created levels with counts
    const newLevels = await prisma.level.findMany({
      where: { schoolId: school.id },
      include: {
        _count: {
          select: {
            classes: true,
            subjects: true,
          }
        },
        classes: {
          include: {
            _count: {
              select: {
                students: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const levelsWithCounts = newLevels.map(level => ({
      id: level.id,
      name: level.name,
      description: level.description,
      isActive: level.isActive,
      classCount: level._count.classes,
      subjectCount: level._count.subjects,
      studentCount: level.classes.reduce((sum, cls) => sum + cls._count.students, 0),
      schoolId: level.schoolId,
      createdAt: level.createdAt,
      updatedAt: level.updatedAt
    }));

    return NextResponse.json({
      message: `Successfully created ${levelsToCreate.length} levels`,
      levels: levelsWithCounts
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating levels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

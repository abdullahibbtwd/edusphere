import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Helper to resolve school ID from either UUID or subdomain
 */
async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
  // Try as UUID first (actual school ID)
  let school = await prisma.school.findUnique({
    where: { id: schoolIdentifier },
    select: { id: true }
  });

  // If not found by ID, try as subdomain
  if (!school) {
    school = await prisma.school.findUnique({
      where: {
        subdomain: schoolIdentifier,
        isActive: true
      },
      select: { id: true }
    });
  }

  return school?.id || null;
}

/**
 * Helper to fetch levels with all counts
 */
async function fetchLevelsWithCounts(schoolId: string, skip?: number, take?: number) {
  const levels = await prisma.level.findMany({
    where: { schoolId },
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
    take
  });

  return levels.map(level => ({
    id: level.id,
    name: level.name,
    description: level.description,
    isActive: level.isActive,
    classCount: level._count.classes,
    subjectCount: level._count.subjects,
    studentCount: level.classes.reduce((sum, cls) => sum + cls._count.students, 0),
    schoolId: level.schoolId,
    createdAt: level.createdAt.toISOString(),
    updatedAt: level.updatedAt.toISOString()
  }));
}

/**
 * GET - Fetch school levels with counts and pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10'))); // Max 100 per page
    const skip = (page - 1) * limit;

    // Resolve school ID
    const actualSchoolId = await resolveSchoolId(schoolId);
    if (!actualSchoolId) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Fetch levels and total count in parallel
    const [levelsWithCounts, total] = await Promise.all([
      fetchLevelsWithCounts(actualSchoolId, skip, limit),
      prisma.level.count({ where: { schoolId: actualSchoolId } })
    ]);

    return NextResponse.json({
      success: true,
      levels: levelsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create levels (preset or custom)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const body = await request.json();
    const { levelType, customLevels } = body;

    // Validation
    if (!levelType) {
      return NextResponse.json(
        { error: 'Level type is required' },
        { status: 400 }
      );
    }

    if (levelType === 'CUSTOM' && (!customLevels || !Array.isArray(customLevels) || customLevels.length === 0)) {
      return NextResponse.json(
        { error: 'Custom levels array is required for CUSTOM level type' },
        { status: 400 }
      );
    }

    // Resolve school ID
    const actualSchoolId = await resolveSchoolId(schoolId);
    if (!actualSchoolId) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Determine levels to create
    let levelsToCreate: Array<{ name: string; description: string }> = [];

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

      case 'CUSTOM':
        // Validate and sanitize custom levels
        levelsToCreate = customLevels
          .filter((level: any) => level.name && level.name.trim() !== '')
          .map((level: any) => ({
            name: level.name.trim(),
            description: level.description?.trim() || `${level.name.trim()} Level`
          }));

        if (levelsToCreate.length === 0) {
          return NextResponse.json(
            { error: 'At least one valid level with a name is required' },
            { status: 400 }
          );
        }

        // Check for duplicate names in custom levels
        const levelNames = levelsToCreate.map(l => l.name);
        const uniqueNames = new Set(levelNames);
        if (levelNames.length !== uniqueNames.size) {
          return NextResponse.json(
            { error: 'Duplicate level names are not allowed' },
            { status: 400 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid level type. Must be JSS1-3, SS1-3, JSS1-SS3, or CUSTOM' },
          { status: 400 }
        );
    }

    // Create levels using transaction for data consistency
    const createdLevels = await prisma.$transaction(
      levelsToCreate.map(level =>
        prisma.level.create({
          data: {
            name: level.name,
            description: level.description,
            schoolId: actualSchoolId,
            isActive: true
          }
        })
      )
    );

    console.log(`✅ Created ${createdLevels.length} levels for school ${actualSchoolId}`);

    // Fetch created levels with counts
    const newLevels = await fetchLevelsWithCounts(actualSchoolId);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdLevels.length} level${createdLevels.length !== 1 ? 's' : ''}`,
      count: createdLevels.length,
      levels: newLevels
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating levels:', error);

    // Handle Prisma unique constraint violation (duplicate level names)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'One or more level names already exist for this school' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create levels' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch school subjects with class assignments
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

    // Get subjects with related data
    const subjects = await prisma.subject.findMany({
      where: { schoolId: actualSchoolId },
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

    // Get total count for pagination
    const totalCount = await prisma.subject.count({
      where: { schoolId: actualSchoolId }
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Format the response
    const formattedSubjects = await Promise.all(subjects.map(async (subject) => {
      let classInfo = 'All Classes';
      
      // Use classAssignment to determine class display
      if (subject.classAssignment) {
        // Class specific - show actual class names
        const [levelType, classSuffix] = subject.classAssignment.split(' Class ');
        const levelNames = levelType === 'Junior' 
          ? ['JSS1', 'JSS2', 'JSS3'] 
          : ['SS1', 'SS2', 'SS3'];
        
        const classNames = levelNames.map(level => `${level}${classSuffix}`);
        classInfo = classNames.join(', ');
      } else if (subject.levels.length > 0) {
        // General subjects - show level-based info
        const levelNames = subject.levels.map(level => level.name);
        if (levelNames.includes('JSS1') && levelNames.includes('JSS2') && levelNames.includes('JSS3')) {
          classInfo = 'All Junior Classes';
        } else if (levelNames.includes('SS1') && levelNames.includes('SS2') && levelNames.includes('SS3')) {
          classInfo = 'All Senior Classes';
        } else if (levelNames.length === 1) {
          classInfo = `${levelNames[0]} Classes`;
        } else {
          classInfo = levelNames.join(', ') + ' Classes';
        }
      }

      return {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        creditUnit: subject.creditUnit,
        term: subject.term,
        levelName: subject.levels.length > 0 ? subject.levels[0].name : 'All Levels',
        classes: classInfo,
        classAssignment: subject.classAssignment,
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
    const { schoolId } = await params;
    const body = await request.json();
    const { name, subjectType, classAssignment } = body;

    if (!name || !subjectType) {
      return NextResponse.json({ 
        error: 'Subject name and type are required' 
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

    let classIds = [];

    // Determine level and classes based on subject type
    let levelIdsToConnect: string[] = [];
    
    switch (subjectType) {
      case 'school_general':
        // School general - no specific level or classes
        break;
        
      case 'junior_general':
        // Junior general - all junior classes
        const juniorLevels = await prisma.level.findMany({
          where: {
            schoolId: school.id,
            name: { in: ['JSS1', 'JSS2', 'JSS3'] }
          }
        });
        levelIdsToConnect = juniorLevels.map(level => level.id);
        break;
        
      case 'senior_general':
        // Senior general - all senior classes
        const seniorLevels = await prisma.level.findMany({
          where: {
            schoolId: school.id,
            name: { in: ['SS1', 'SS2', 'SS3'] }
          }
        });
        levelIdsToConnect = seniorLevels.map(level => level.id);
        break;
        
      case 'class_specific':
        // Class specific - assign to specific classes
        if (!classAssignment) {
          return NextResponse.json({ 
            error: 'Class assignment is required for class-specific subjects' 
          }, { status: 400 });
        }
        
        // Parse class assignment (e.g., "Junior Class A" or "Senior Class B")
        const [levelType, classSuffix] = classAssignment.split(' Class ');
        const levelNames = levelType === 'Junior' 
          ? ['JSS1', 'JSS2', 'JSS3'] 
          : ['SS1', 'SS2', 'SS3'];
          
        // Find classes with the specified suffix across all levels
        const targetClasses = await prisma.class.findMany({
          where: {
            schoolId: school.id,
            name: { 
              in: levelNames.map(level => `${level}${classSuffix}`)
            }
          }
        });
        
        classIds = targetClasses.map(cls => cls.id);
        
        // Get all unique level IDs from the target classes
        if (targetClasses.length > 0) {
          levelIdsToConnect = [...new Set(targetClasses.map(cls => cls.levelId))];
        }
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid subject type' }, { status: 400 });
    }

    // Create the subject
    const subject = await prisma.subject.create({
      data: {
        name,
        code: name.toUpperCase().replace(/\s+/g, '').substring(0, 10), // Generate code from name
        creditUnit: 1, // Default credit unit
        term: 'FIRST', // Default term
        isGeneral: subjectType === 'school_general',
        classAssignment: subjectType === 'class_specific' ? classAssignment : null, // Store class assignment
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


    // Fetch the created subject with its details
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

    // Get class names based on subject type
    let classNames = 'All Classes';
    
    if (createdSubject!.classAssignment) {
      // Class specific - show actual class names
      const [levelType, classSuffix] = createdSubject!.classAssignment.split(' Class ');
      const levelNames = levelType === 'Junior' 
        ? ['JSS1', 'JSS2', 'JSS3'] 
        : ['SS1', 'SS2', 'SS3'];
      
      const classNamesArray = levelNames.map(level => `${level}${classSuffix}`);
      classNames = classNamesArray.join(', ');
    } else if (createdSubject!.levels.length > 0) {
      // General subjects - show level-based info
      const levelNames = createdSubject!.levels.map(level => level.name);
      if (levelNames.includes('JSS1') && levelNames.includes('JSS2') && levelNames.includes('JSS3')) {
        classNames = 'All Junior Classes';
      } else if (levelNames.includes('SS1') && levelNames.includes('SS2') && levelNames.includes('SS3')) {
        classNames = 'All Senior Classes';
      } else if (levelNames.length === 1) {
        classNames = `${levelNames[0]} Classes`;
      } else {
        classNames = levelNames.join(', ') + ' Classes';
      }
    }

    const formattedSubject = {
      id: createdSubject!.id,
      name: createdSubject!.name,
      code: createdSubject!.code,
      creditUnit: createdSubject!.creditUnit,
      term: createdSubject!.term,
      levelName: createdSubject!.levels.length > 0 ? createdSubject!.levels[0].name : 'All Levels',
      classes: classNames,
      classAssignment: createdSubject!.classAssignment,
      teacherCount: createdSubject!._count.teacherSubjectClasses,
      isGeneral: createdSubject!.isGeneral,
      schoolId: createdSubject!.schoolId,
      levelId: createdSubject!.levels.length > 0 ? createdSubject!.levels[0].id : null,
      createdAt: createdSubject!.createdAt.toISOString(),
      updatedAt: createdSubject!.updatedAt.toISOString()
    };

    return NextResponse.json({
      message: 'Subject created successfully',
      subject: formattedSubject
    });

  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

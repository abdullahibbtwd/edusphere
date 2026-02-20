import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Get specific level
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId, id } = await params;

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

    const level = await prisma.level.findFirst({
      where: {
        id,
        schoolId: school.id
      },
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
      }
    });

    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    const levelWithCounts = {
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
    };

    return NextResponse.json(levelWithCounts);
  } catch (error) {
    console.error('Error fetching level:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update level
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId, id } = await params;
    const body = await request.json();
    const { name, description, isActive } = body;

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

    // Check if level exists and belongs to this school
    const existingLevel = await prisma.level.findFirst({
      where: {
        id,
        schoolId: school.id
      }
    });

    if (!existingLevel) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    // If name is being changed, check for duplicates
    if (name && name !== existingLevel.name) {
      const duplicateLevel = await prisma.level.findUnique({
        where: {
          name_schoolId: {
            name,
            schoolId: school.id
          }
        }
      });

      if (duplicateLevel) {
        return NextResponse.json({ error: 'Level with this name already exists' }, { status: 400 });
      }
    }

    const updatedLevel = await prisma.level.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      },
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
      }
    });

    const levelWithCounts = {
      id: updatedLevel.id,
      name: updatedLevel.name,
      description: updatedLevel.description,
      isActive: updatedLevel.isActive,
      classCount: updatedLevel._count.classes,
      subjectCount: updatedLevel._count.subjects,
      studentCount: updatedLevel.classes.reduce((sum, cls) => sum + cls._count.students, 0),
      schoolId: updatedLevel.schoolId,
      createdAt: updatedLevel.createdAt,
      updatedAt: updatedLevel.updatedAt
    };

    return NextResponse.json(levelWithCounts);
  } catch (error) {
    console.error('Error updating level:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete level
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId, id } = await params;

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

    // Check if level exists and belongs to this school
    const existingLevel = await prisma.level.findFirst({
      where: {
        id,
        schoolId: school.id
      },
      include: {
        _count: {
          select: {
            classes: true,
            subjects: true
          }
        }
      }
    });

    if (!existingLevel) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    // Check if level has classes or subjects
    if (existingLevel._count.classes > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete level with existing classes. Please delete classes first.' 
      }, { status: 400 });
    }

    if (existingLevel._count.subjects > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete level with existing subjects. Please delete subjects first.' 
      }, { status: 400 });
    }

    await prisma.level.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Level deleted successfully' });
  } catch (error) {
    console.error('Error deleting level:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

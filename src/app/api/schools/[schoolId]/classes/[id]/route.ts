import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch single class
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId, id } = await params;

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

    const classData = await prisma.class.findFirst({
      where: {
        id: id,
        schoolId: actualSchoolId
      },
      include: {
        level: {
          select: { name: true }
        },
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      }
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const formattedClass = {
      id: classData.id,
      name: classData.name,
      levelName: classData.level.name,
      studentCount: classData._count.students,
      subjectCount: classData._count.subjects,
      headTeacher: classData.headTeacher || 'Not assigned',
      description: classData.description || '',
      isActive: classData.isActive,
      schoolId: classData.schoolId,
      levelId: classData.levelId,
      createdAt: classData.createdAt.toISOString(),
      updatedAt: classData.updatedAt.toISOString()
    };

    return NextResponse.json({ class: formattedClass });

  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update class
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId, id } = await params;
    const body = await request.json();

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

    const { name, headTeacher, description, isActive, levelId } = body;

    // Check if class exists
    const existingClass = await prisma.class.findFirst({
      where: {
        id: id,
        schoolId: actualSchoolId
      }
    });

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: { id: id },
      data: {
        name: name || existingClass.name,
        headTeacher: headTeacher || existingClass.headTeacher,
        description: description || existingClass.description,
        isActive: isActive !== undefined ? isActive : existingClass.isActive,
        levelId: levelId || existingClass.levelId
      },
      include: {
        level: {
          select: { name: true }
        },
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      }
    });

    const formattedClass = {
      id: updatedClass.id,
      name: updatedClass.name,
      levelName: updatedClass.level.name,
      studentCount: updatedClass._count.students,
      subjectCount: updatedClass._count.subjects,
      headTeacher: updatedClass.headTeacher || 'Not assigned',
      description: updatedClass.description || '',
      isActive: updatedClass.isActive,
      schoolId: updatedClass.schoolId,
      levelId: updatedClass.levelId,
      createdAt: updatedClass.createdAt.toISOString(),
      updatedAt: updatedClass.updatedAt.toISOString()
    };

    return NextResponse.json({
      message: 'Class updated successfully',
      class: formattedClass
    });

  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId, id } = await params;

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

    // Check if class exists
    const existingClass = await prisma.class.findFirst({
      where: {
        id: id,
        schoolId: actualSchoolId
      }
    });

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check if class has students
    const studentCount = await prisma.student.count({
      where: { classId: id }
    });

    if (studentCount > 0) {
      return NextResponse.json({
        error: 'Cannot delete class with existing students. Please reassign students first.'
      }, { status: 400 });
    }

    // Delete the class
    await prisma.class.delete({
      where: { id: id }
    });

    return NextResponse.json({
      message: 'Class deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

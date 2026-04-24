import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSchool } from '@/lib/school';
import { requireAuth, requireRole } from '@/lib/auth-middleware';

// GET - Fetch single class
// GET - Fetch single class
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  const sessionUser = requireAuth(request);
  if (sessionUser instanceof NextResponse) return sessionUser;

  try {
    const { schoolId, id } = await params;

    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    if (sessionUser.schoolId && sessionUser.schoolId !== school.id && sessionUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - You can only view classes for your school' }, { status: 403 });
    }

    const classData = await prisma.class.findFirst({
      where: {
        id: id,
        schoolId: school.id
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
      subjectCount: classData._count.teacherSubjectClasses,
      schoolId: classData.schoolId,
      levelId: classData.levelId,
      supervisorId: classData.supervisorId,
      headTeacher: classData.supervisor?.name || 'Not assigned',
      createdAt: classData.createdAt.toISOString(),
      updatedAt: classData.updatedAt.toISOString()
    };

    return NextResponse.json({ class: formattedClass });

  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a class
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  const sessionUser = requireRole(request, ['ADMIN']);
  if (sessionUser instanceof NextResponse) return sessionUser;

  try {
    const { schoolId, id } = await params;
    const body = await request.json();
    const { name, levelId, supervisorId } = body;

    if (!name && !levelId && supervisorId === undefined) {
      return NextResponse.json({
        error: 'At least one field (name, levelId, or supervisorId) is required'
      }, { status: 400 });
    }

    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    if (sessionUser.schoolId && sessionUser.schoolId !== school.id) {
      return NextResponse.json({ error: 'Forbidden - You can only manage classes for your school' }, { status: 403 });
    }

    // Find the class
    const existingClass = await prisma.class.findUnique({
      where: { id: id }
    });

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Verify the class belongs to this school
    if (existingClass.schoolId !== school.id) {
      return NextResponse.json({ error: 'Class does not belong to this school' }, { status: 403 });
    }

    // Verify the new level exists and belongs to this school (only if levelId is being updated)
    if (levelId) {
      const level = await prisma.level.findUnique({
        where: { id: levelId }
      });

      if (!level || level.schoolId !== school.id) {
        return NextResponse.json({ error: 'Invalid level ID' }, { status: 400 });
      }

      // Check if another class with the same name exists in the same level
      if (name) {
        const duplicate = await prisma.class.findFirst({
          where: {
            schoolId: school.id,
            levelId: levelId,
            name: name.trim(),
            id: { not: id } // Exclude current class
          }
        });

        if (duplicate) {
          return NextResponse.json({
            error: `A class named "${name}" already exists in level "${level.name}"`
          }, { status: 400 });
        }
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id: id },
      data: {
        ...(name && { name: name.trim() }),
        ...(levelId && { levelId }),
        ...(supervisorId !== undefined && { supervisorId })
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
      }
    });

    return NextResponse.json({
      message: 'Class updated successfully',
      class: {
        id: updatedClass.id,
        name: updatedClass.name,
        levelName: updatedClass.level.name,
        studentCount: updatedClass._count.students,
        subjectCount: updatedClass._count.teacherSubjectClasses,
        schoolId: updatedClass.schoolId,
        levelId: updatedClass.levelId,
        supervisorId: updatedClass.supervisorId,
        headTeacher: updatedClass.supervisor?.name || 'Not assigned',
        createdAt: updatedClass.createdAt.toISOString(),
        updatedAt: updatedClass.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a class (only if no students)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; id: string }> }
) {
  const sessionUser = requireRole(request, ['ADMIN']);
  if (sessionUser instanceof NextResponse) return sessionUser;

  try {
    const { schoolId, id } = await params;

    const school = await getSchool(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    if (sessionUser.schoolId && sessionUser.schoolId !== school.id) {
      return NextResponse.json({ error: 'Forbidden - You can only manage classes for your school' }, { status: 403 });
    }

    // Find the class with student count
    const classToDelete = await prisma.class.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    if (!classToDelete) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Verify the class belongs to this school
    if (classToDelete.schoolId !== school.id) {
      return NextResponse.json({ error: 'Class does not belong to this school' }, { status: 403 });
    }

    // Check if class has students
    if (classToDelete._count.students > 0) {
      return NextResponse.json({
        error: `Cannot delete class. There are ${classToDelete._count.students} student(s) enrolled in this class.`,
        studentCount: classToDelete._count.students
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

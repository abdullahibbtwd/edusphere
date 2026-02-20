import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Get single teacher with assignments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; teacherId: string }> }
) {
  try {
    const { schoolId, teacherId } = await params;

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

    const teacher = await prisma.teacher.findUnique({
      where: { 
        id: teacherId,
        schoolId: actualSchoolId 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isEmailVerified: true
          }
        },
        teacherSubjectClasses: {
          include: {
            subject: {
              select: { 
                id: true,
                name: true, 
                code: true,
                classAssignment: true
              }
            },
            class: {
              include: {
                level: {
                  select: { 
                    id: true,
                    name: true 
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Format assignments
    const assignments = teacher.teacherSubjectClasses.map(assignment => ({
      id: assignment.id,
      subjectId: assignment.subjectId,
      subjectName: assignment.subject.name,
      subjectCode: assignment.subject.code,
      classId: assignment.classId,
      className: assignment.class.name,
      levelId: assignment.class.level.id,
      levelName: assignment.class.level.name,
      fullClassName: `${assignment.class.level.name}${assignment.class.name}`,
      isActive: assignment.isActive,
      assignedAt: assignment.assignedAt.toISOString()
    }));

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        teacherId: teacher.teacherId,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        address: teacher.address,
        birthday: teacher.birthday,
        sex: teacher.sex,
        img: teacher.img,
        schoolId: teacher.schoolId,
        userId: teacher.userId,
        user: teacher.user,
        assignments,
        createdAt: teacher.createdAt.toISOString(),
        updatedAt: teacher.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update teacher and assignments
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; teacherId: string }> }
) {
  try {
    const { schoolId, teacherId } = await params;
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      address, 
      birthday, 
      sex, 
      img,
      assignments = [] // Array of { subjectId, classId } assignments
    } = body;

    if (!name || !email || !phone || !address || !birthday || !sex) {
      return NextResponse.json({ 
        error: 'Name, email, phone, address, birthday, and sex are required' 
      }, { status: 400 });
    }

    // Find school
    let school;
    school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

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

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { 
        id: teacherId,
        schoolId: school.id 
      }
    });

    if (!existingTeacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Check if email is already used by another teacher
    if (email !== existingTeacher.email) {
      const emailExists = await prisma.teacher.findFirst({
        where: { 
          email,
          id: { not: teacherId }
        }
      });

      if (emailExists) {
        return NextResponse.json({ 
          error: 'Email already used by another teacher' 
        }, { status: 409 });
      }
    }

    // Update teacher basic info
    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        name,
        email,
        phone,
        address,
        birthday,
        sex,
        img: img || existingTeacher.img
      }
    });

    // Update assignments
    // First, remove all existing assignments
    await prisma.teacherSubjectClass.deleteMany({
      where: { teacherId }
    });

    // Then, create new assignments
    if (assignments.length > 0) {
      const assignmentData = assignments.map((assignment: any) => ({
        teacherId,
        subjectId: assignment.subjectId,
        classId: assignment.classId,
        schoolId: school.id,
        assignedBy: null // TODO: Get from auth context
      }));

      await prisma.teacherSubjectClass.createMany({
        data: assignmentData
      });
    }

    // Fetch updated teacher with assignments
    const finalTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isEmailVerified: true
          }
        },
        teacherSubjectClasses: {
          include: {
            subject: {
              select: { 
                id: true,
                name: true, 
                code: true,
                classAssignment: true
              }
            },
            class: {
              include: {
                level: {
                  select: { 
                    id: true,
                    name: true 
                  }
                }
              }
            }
          }
        }
      }
    });

    // Format assignments for response
    const formattedAssignments = finalTeacher!.teacherSubjectClasses.map(assignment => ({
      id: assignment.id,
      subjectId: assignment.subjectId,
      subjectName: assignment.subject.name,
      subjectCode: assignment.subject.code,
      classId: assignment.classId,
      className: assignment.class.name,
      levelId: assignment.class.level.id,
      levelName: assignment.class.level.name,
      fullClassName: `${assignment.class.level.name}${assignment.class.name}`,
      isActive: assignment.isActive,
      assignedAt: assignment.assignedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      message: 'Teacher updated successfully',
      teacher: {
        id: finalTeacher!.id,
        teacherId: finalTeacher!.teacherId,
        name: finalTeacher!.name,
        email: finalTeacher!.email,
        phone: finalTeacher!.phone,
        address: finalTeacher!.address,
        birthday: finalTeacher!.birthday,
        sex: finalTeacher!.sex,
        img: finalTeacher!.img,
        schoolId: finalTeacher!.schoolId,
        userId: finalTeacher!.userId,
        user: finalTeacher!.user,
        assignments: formattedAssignments,
        createdAt: finalTeacher!.createdAt.toISOString(),
        updatedAt: finalTeacher!.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete teacher
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; teacherId: string }> }
) {
  try {
    const { schoolId, teacherId } = await params;

    // Find school
    let school;
    school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

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

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { 
        id: teacherId,
        schoolId: school.id 
      }
    });

    if (!existingTeacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Delete teacher (assignments will be deleted automatically due to cascade)
    await prisma.teacher.delete({
      where: { id: teacherId }
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

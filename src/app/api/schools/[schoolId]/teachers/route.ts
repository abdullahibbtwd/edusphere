import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from "bcryptjs";
import crypto from "crypto";

// GET - Fetch school teachers with their assignments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
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

    // Build where clause
    const whereClause: any = {
      schoolId: actualSchoolId
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { teacherId: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get teachers with their assignments
    const teachers = await prisma.teacher.findMany({
      where: whereClause,
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
    const totalCount = await prisma.teacher.count({
      where: whereClause
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Format the response
    const formattedTeachers = teachers.map(teacher => {
      // Group assignments by subject
      const subjectAssignments = teacher.teacherSubjectClasses.reduce((acc, assignment) => {
        const subjectName = assignment.subject.name;
        if (!acc[subjectName]) {
          acc[subjectName] = [];
        }
        acc[subjectName].push(`${assignment.class.level.name}${assignment.class.name}`);
        return acc;
      }, {} as Record<string, string[]>);

      const subjectsText = Object.entries(subjectAssignments)
        .map(([subject, classes]) => `${subject} (${classes.join(', ')})`)
        .join('; ');

      // Format detailed assignments
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

      return {
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
        subjects: subjectsText || 'No assignments',
        assignmentCount: teacher._count.teacherSubjectClasses,
        assignments,
        createdAt: teacher.createdAt.toISOString(),
        updatedAt: teacher.updatedAt.toISOString()
      };
    });

    return NextResponse.json({
      teachers: formattedTeachers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create teacher and check if user exists
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      birthday,
      sex,
      img = '/default-avatar.png',
      assignments = [], // Array of { subjectId, classId } assignments
      password,
      confirmPassword
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

    // Check if user exists with this email
    let existingUser = await prisma.user.findUnique({
      where: { email },
      include: { teacher: true }
    });

    if (existingUser) {
      // If user exists and already has a teacher record
      if (existingUser.teacher) {
        return NextResponse.json({
          error: 'A teacher record already exists for this email address'
        }, { status: 409 });
      }
    } else if (password) {
      // Create new user if password is provided
      if (password.length < 6) {
        return NextResponse.json({
          error: 'Password must be at least 6 characters long'
        }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      // Generate verification code
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      existingUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          isEmailVerified: false, // Require verification
          emailVerificationCode: verificationCode,
          emailVerificationExpires: verificationExpires,
          role: "TEACHER", // Set role to TEACHER
          schoolId: school.id
        },
        include: { teacher: true }
      });

      // Send verification email
      try {
        const { sendVerificationEmail } = await import("@/lib/email-service");
        await sendVerificationEmail(email, name, verificationCode);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }
    }

    // Check if teacher already exists (double check, though unlikely if user check passed)
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email }
    });

    if (existingTeacher) {
      return NextResponse.json({
        error: 'Teacher with this email already exists'
      }, { status: 409 });
    }

    // Generate teacher ID
    const teacherCount = await prisma.teacher.count({
      where: { schoolId: school.id }
    });
    const teacherId = `T-${String(teacherCount + 1).padStart(3, '0')}`;

    // Create teacher
    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        phone,
        address,
        birthday,
        sex,
        img,
        teacherId,
        schoolId: school.id,
        userId: existingUser?.id // Link to existing or newly created user
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isEmailVerified: true
          }
        }
      }
    });

    // Create assignments if provided
    if (assignments.length > 0) {
      const assignmentData = assignments.map((assignment: any) => ({
        teacherId: teacher.id,
        subjectId: assignment.subjectId,
        classId: assignment.classId,
        schoolId: school.id,
        assignedBy: null // TODO: Get from auth context
      }));

      await prisma.teacherSubjectClass.createMany({
        data: assignmentData
      });
    }

    // Fetch the created teacher with assignments
    const createdTeacher = await prisma.teacher.findUnique({
      where: { id: teacher.id },
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
              select: { name: true, code: true }
            },
            class: {
              include: {
                level: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher created successfully',
      requireOtp: !!password, // If password was provided, it means we created a new user who needs verification
      teacher: {
        id: createdTeacher!.id,
        teacherId: createdTeacher!.teacherId,
        name: createdTeacher!.name,
        email: createdTeacher!.email,
        phone: createdTeacher!.phone,
        address: createdTeacher!.address,
        birthday: createdTeacher!.birthday,
        sex: createdTeacher!.sex,
        img: createdTeacher!.img,
        schoolId: createdTeacher!.schoolId,
        userId: createdTeacher!.userId,
        user: createdTeacher!.user,
        assignments: createdTeacher!.teacherSubjectClasses,
        createdAt: createdTeacher!.createdAt.toISOString(),
        updatedAt: createdTeacher!.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

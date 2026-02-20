import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      // Personal Information
      firstName,
      lastName,
      middleName,
      dob,
      gender,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      lga,
      religion,

      // Academic Information
      level,
      classId,
      className,
      departmentId,

      // Previous Education
      primarySchoolName,
      primarySchoolStartDate,
      primarySchoolEndDate,
      primarySchoolGrade,
      juniorSecondarySchoolName,
      juniorSecondarySchoolStartDate,
      juniorSecondarySchoolEndDate,
      juniorSecondarySchoolGrade,

      // Parent/Guardian Information
      parentName,
      parentRelationship,
      parentEmail,
      parentPhone,
      parentOccupation,
      parentAddress,

      // File paths (these would be uploaded separately)
      profileImagePath,
      primarySchoolCertificatePath,
      primarySchoolTestimonialPath,
      juniorSecondarySchoolCertificatePath,
      juniorSecondarySchoolTestimonialPath,
      parentIdCardPath,
      indigeneCertificatePath,
      nationalIdCardPath,

      // Application details
      agreeTerms,
      schoolId,
      userId,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !dob || !gender) {
      return NextResponse.json(
        { error: "Missing required personal information" },
        { status: 400 }
      );
    }

    if (!level || !classId) {
      return NextResponse.json(
        { error: "Missing required academic information" },
        { status: 400 }
      );
    }

    if (!parentName || !parentRelationship || !parentEmail || !parentPhone) {
      return NextResponse.json(
        { error: "Missing required parent/guardian information" },
        { status: 400 }
      );
    }

    if (!agreeTerms) {
      return NextResponse.json(
        { error: "You must agree to the terms and conditions" },
        { status: 400 }
      );
    }

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingApplication = await db.studentApplication.findFirst({
      where: { email }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "An application with this email already exists" },
        { status: 400 }
      );
    }

    // Create the student application
    const application = await db.studentApplication.create({
      data: {
        firstName,
        lastName,
        middleName,
        dob,
        gender,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        lga,
        religion,
        classId,
        className,
        primarySchoolName,
        primarySchoolStartDate,
        primarySchoolEndDate,
        primarySchoolGrade,
        juniorSecondarySchoolName,
        juniorSecondarySchoolStartDate,
        juniorSecondarySchoolEndDate,
        juniorSecondarySchoolGrade,
        parentName,
        parentRelationship,
        parentEmail,
        parentPhone,
        parentOccupation,
        parentAddress,
        profileImagePath,
        primarySchoolCertificatePath,
        primarySchoolTestimonialPath,
        juniorSecondarySchoolCertificatePath,
        juniorSecondarySchoolTestimonialPath,
        parentIdCardPath,
        indigeneCertificatePath,
        nationalIdCardPath,
        agreeTerms,
        schoolId,
        userId,
      },
    });

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        applicationNumber: application.applicationNumber,
        application
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");
    const status = searchParams.get("status");

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { schoolId };
    if (status) {
      where.status = status;
    }

    const applications = await db.studentApplication.findMany({
      where,
      include: {
        class: true,
        school: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."Term" AS ENUM ('FIRST', 'SECOND', 'THIRD');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('ADMITTED', 'PROGRESS', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."SchoolApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."SchoolType" AS ENUM ('PUBLIC', 'PRIVATE', 'INTERNATIONAL', 'FAITH_BASED');

-- CreateEnum
CREATE TYPE "public"."OwnershipType" AS ENUM ('GOVERNMENT', 'PRIVATE', 'RELIGIOUS', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "public"."CurriculumType" AS ENUM ('NATIONAL', 'BRITISH', 'AMERICAN', 'IB', 'MONTESSORI', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SubscriptionPlan" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "imageUrl" TEXT,
    "clerkUserId" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'STUDENT',
    "schoolId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "pmbNumber" TEXT,
    "rcNumber" TEXT,
    "schoolType" "public"."SchoolType" NOT NULL,
    "principalName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "establishmentYear" TEXT NOT NULL,
    "ownershipType" "public"."OwnershipType" NOT NULL,
    "curriculum" "public"."CurriculumType" NOT NULL,
    "totalStudents" INTEGER,
    "totalTeachers" INTEGER,
    "facilitiesList" TEXT[],
    "accreditation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_contents" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL DEFAULT 'Let''s Learn To Explore our Community for better health',
    "heroSubtitle" TEXT,
    "heroImage" TEXT,
    "schoolLogo" TEXT,
    "description" TEXT NOT NULL DEFAULT 'Our school is committed to providing a nurturing environment that fosters academic excellence, character development, and lifelong learning.',
    "contactAddress" TEXT NOT NULL DEFAULT 'No.220 Jos road rudun wada lga,kano state',
    "contactPhone" TEXT NOT NULL DEFAULT '99896638',
    "contactEmail" TEXT NOT NULL DEFAULT 'info@school.com',
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "linkedinUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_facilities" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_campuses" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_subscriptions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "planType" "public"."SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "maxStudents" INTEGER NOT NULL DEFAULT 500,
    "maxTeachers" INTEGER NOT NULL DEFAULT 50,
    "features" TEXT[],
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_applications" (
    "id" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "pmbNumber" TEXT,
    "rcNumber" TEXT,
    "schoolType" "public"."SchoolType" NOT NULL,
    "principalName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "establishmentYear" TEXT NOT NULL,
    "ownershipType" "public"."OwnershipType" NOT NULL,
    "curriculum" "public"."CurriculumType" NOT NULL,
    "totalStudents" INTEGER,
    "totalTeachers" INTEGER,
    "facilities" TEXT[],
    "accreditation" TEXT,
    "additionalInfo" TEXT,
    "status" "public"."SchoolApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedBy" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "school_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."levels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "level1Count" INTEGER NOT NULL DEFAULT 0,
    "level2Count" INTEGER NOT NULL DEFAULT 0,
    "graduateCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "creditUnit" INTEGER NOT NULL,
    "term" "public"."Term" NOT NULL,
    "isGeneral" BOOLEAN NOT NULL DEFAULT false,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teachers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "birthday" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_subject_classes" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_subject_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "dob" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "religion" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "className" TEXT,
    "primarySchoolName" TEXT,
    "primarySchoolStartDate" TEXT,
    "primarySchoolEndDate" TEXT,
    "primarySchoolGrade" TEXT,
    "juniorSecondarySchoolName" TEXT,
    "juniorSecondarySchoolStartDate" TEXT,
    "juniorSecondarySchoolEndDate" TEXT,
    "juniorSecondarySchoolGrade" TEXT,
    "parentName" TEXT NOT NULL,
    "parentRelationship" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "parentOccupation" TEXT,
    "parentAddress" TEXT,
    "profileImagePath" TEXT,
    "primarySchoolCertificatePath" TEXT,
    "primarySchoolTestimonialPath" TEXT,
    "juniorSecondarySchoolCertificatePath" TEXT,
    "juniorSecondarySchoolTestimonialPath" TEXT,
    "parentIdCardPath" TEXT,
    "indigeneCertificatePath" TEXT,
    "nationalIdCardPath" TEXT,
    "agreeTerms" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PROGRESS',
    "applicationNumber" TEXT NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."timetables" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "term" "public"."Term" NOT NULL,
    "schedule" JSONB NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timetables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exam_timetables" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "invigilatorId" TEXT,
    "examHall" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "term" "public"."Term" NOT NULL,
    "classId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_timetables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "targetRoles" "public"."Role"[],
    "createdBy" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."screening_slots" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "bookingCount" INTEGER NOT NULL DEFAULT 0,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screening_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."application_bookings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_applications" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "dob" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "religion" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "className" TEXT,
    "primarySchoolName" TEXT,
    "primarySchoolStartDate" TEXT,
    "primarySchoolEndDate" TEXT,
    "primarySchoolGrade" TEXT,
    "juniorSecondarySchoolName" TEXT,
    "juniorSecondarySchoolStartDate" TEXT,
    "juniorSecondarySchoolEndDate" TEXT,
    "juniorSecondarySchoolGrade" TEXT,
    "parentName" TEXT NOT NULL,
    "parentRelationship" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "parentOccupation" TEXT,
    "parentAddress" TEXT,
    "profileImagePath" TEXT,
    "primarySchoolCertificatePath" TEXT,
    "primarySchoolTestimonialPath" TEXT,
    "juniorSecondarySchoolCertificatePath" TEXT,
    "juniorSecondarySchoolTestimonialPath" TEXT,
    "parentIdCardPath" TEXT,
    "indigeneCertificatePath" TEXT,
    "nationalIdCardPath" TEXT,
    "agreeTerms" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PROGRESS',
    "applicationNumber" TEXT NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schoolId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_LevelToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LevelToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkUserId_key" ON "public"."users"("clerkUserId");

-- CreateIndex
CREATE INDEX "users_schoolId_idx" ON "public"."users"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_key" ON "public"."schools"("name");

-- CreateIndex
CREATE UNIQUE INDEX "schools_subdomain_key" ON "public"."schools"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "school_contents_schoolId_key" ON "public"."school_contents"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "school_subscriptions_schoolId_key" ON "public"."school_subscriptions"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "school_applications_subdomain_key" ON "public"."school_applications"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "levels_name_schoolId_key" ON "public"."levels"("name", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_levelId_schoolId_key" ON "public"."classes"("name", "levelId", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_key" ON "public"."teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_teacherId_key" ON "public"."teachers"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_userId_key" ON "public"."teachers"("userId");

-- CreateIndex
CREATE INDEX "teachers_schoolId_idx" ON "public"."teachers"("schoolId");

-- CreateIndex
CREATE INDEX "teacher_subject_classes_teacherId_idx" ON "public"."teacher_subject_classes"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_subject_classes_subjectId_idx" ON "public"."teacher_subject_classes"("subjectId");

-- CreateIndex
CREATE INDEX "teacher_subject_classes_classId_idx" ON "public"."teacher_subject_classes"("classId");

-- CreateIndex
CREATE INDEX "teacher_subject_classes_schoolId_idx" ON "public"."teacher_subject_classes"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_subject_classes_teacherId_subjectId_classId_key" ON "public"."teacher_subject_classes"("teacherId", "subjectId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "public"."students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_applicationNumber_key" ON "public"."students"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "public"."students"("userId");

-- CreateIndex
CREATE INDEX "students_schoolId_idx" ON "public"."students"("schoolId");

-- CreateIndex
CREATE INDEX "students_classId_idx" ON "public"."students"("classId");

-- CreateIndex
CREATE INDEX "announcements_schoolId_idx" ON "public"."announcements"("schoolId");

-- CreateIndex
CREATE INDEX "events_schoolId_idx" ON "public"."events"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "student_applications_applicationNumber_key" ON "public"."student_applications"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "student_applications_userId_key" ON "public"."student_applications"("userId");

-- CreateIndex
CREATE INDEX "_LevelToSubject_B_index" ON "public"."_LevelToSubject"("B");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_contents" ADD CONSTRAINT "school_contents_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_facilities" ADD CONSTRAINT "school_facilities_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_campuses" ADD CONSTRAINT "school_campuses_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_subscriptions" ADD CONSTRAINT "school_subscriptions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."levels" ADD CONSTRAINT "levels_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subjects" ADD CONSTRAINT "subjects_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teachers" ADD CONSTRAINT "teachers_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teachers" ADD CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_subject_classes" ADD CONSTRAINT "teacher_subject_classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_subject_classes" ADD CONSTRAINT "teacher_subject_classes_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_subject_classes" ADD CONSTRAINT "teacher_subject_classes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_subject_classes" ADD CONSTRAINT "teacher_subject_classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timetables" ADD CONSTRAINT "timetables_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timetables" ADD CONSTRAINT "timetables_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timetables" ADD CONSTRAINT "timetables_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_timetables" ADD CONSTRAINT "exam_timetables_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_timetables" ADD CONSTRAINT "exam_timetables_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_timetables" ADD CONSTRAINT "exam_timetables_invigilatorId_fkey" FOREIGN KEY ("invigilatorId") REFERENCES "public"."teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_timetables" ADD CONSTRAINT "exam_timetables_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_timetables" ADD CONSTRAINT "exam_timetables_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_timetables" ADD CONSTRAINT "exam_timetables_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."announcements" ADD CONSTRAINT "announcements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."announcements" ADD CONSTRAINT "announcements_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."screening_slots" ADD CONSTRAINT "screening_slots_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."application_bookings" ADD CONSTRAINT "application_bookings_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "public"."screening_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."application_bookings" ADD CONSTRAINT "application_bookings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_applications" ADD CONSTRAINT "student_applications_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_applications" ADD CONSTRAINT "student_applications_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_applications" ADD CONSTRAINT "student_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_LevelToSubject" ADD CONSTRAINT "_LevelToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_LevelToSubject" ADD CONSTRAINT "_LevelToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `graduateCount` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `level1Count` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `level2Count` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `curriculum` on the `school_applications` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `school_applications` table. All the data in the column will be lost.
  - You are about to drop the column `ownershipType` on the `school_applications` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `school_applications` table. All the data in the column will be lost.
  - You are about to drop the column `pmbNumber` on the `school_applications` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `school_applications` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `indigeneCertificatePath` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `juniorSecondarySchoolCertificatePath` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `juniorSecondarySchoolEndDate` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `juniorSecondarySchoolGrade` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `juniorSecondarySchoolName` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `juniorSecondarySchoolStartDate` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `juniorSecondarySchoolTestimonialPath` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `nationalIdCardPath` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `parentIdCardPath` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `primarySchoolCertificatePath` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `primarySchoolEndDate` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `primarySchoolGrade` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `primarySchoolName` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `primarySchoolStartDate` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `primarySchoolTestimonialPath` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `indigeneCertificatePath` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `juniorSecondarySchoolCertificatePath` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `juniorSecondarySchoolEndDate` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `juniorSecondarySchoolGrade` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `juniorSecondarySchoolName` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `juniorSecondarySchoolStartDate` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `juniorSecondarySchoolTestimonialPath` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `nationalIdCardPath` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `parentIdCardPath` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `primarySchoolCertificatePath` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `primarySchoolEndDate` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `primarySchoolGrade` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `primarySchoolName` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `primarySchoolStartDate` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `primarySchoolTestimonialPath` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registrationNumber]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[classId,term,schoolId]` on the table `timetables` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `startTime` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `date` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `date` on the `exam_timetables` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startTime` on the `exam_timetables` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `exam_timetables` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `educationLevel` to the `school_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lga` to the `school_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officialPhone` to the `school_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolEmail` to the `school_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `school_applications` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `schoolType` on the `school_applications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `date` on the `screening_slots` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startTime` on the `screening_slots` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `dob` on the `student_applications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `dob` on the `students` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `birthday` on the `teachers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentPlan" AS ENUM ('TERM', 'SESSION');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('PAID', 'PARTIAL', 'UNPAID');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('HOLIDAY', 'EXAM', 'CA', 'REVISION', 'NORMAL_CLASS', 'OTHER');

-- AlterEnum
ALTER TYPE "Term" ADD VALUE 'FULL_SESSION';

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "graduateCount",
DROP COLUMN "level1Count",
DROP COLUMN "level2Count",
ADD COLUMN     "supervisorId" TEXT;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "exam_timetables" DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "school_applications" DROP COLUMN "curriculum",
DROP COLUMN "email",
DROP COLUMN "ownershipType",
DROP COLUMN "phoneNumber",
DROP COLUMN "pmbNumber",
DROP COLUMN "website",
ADD COLUMN     "educationLevel" TEXT NOT NULL,
ADD COLUMN     "lga" TEXT NOT NULL,
ADD COLUMN     "nemisId" TEXT,
ADD COLUMN     "officialPhone" TEXT NOT NULL,
ADD COLUMN     "schoolEmail" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "stateApprovalNumber" TEXT,
ADD COLUMN     "waecNecoNumber" TEXT,
DROP COLUMN "schoolType",
ADD COLUMN     "schoolType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "isAdmissionsOpen" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isScreeningEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "screeningEndTime" TIMESTAMP(3),
ADD COLUMN     "screeningSlotsPerDay" INTEGER,
ADD COLUMN     "screeningStartTime" TIMESTAMP(3),
ADD COLUMN     "screeningVenue" TEXT;

-- AlterTable
ALTER TABLE "screening_slots" ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "venue" TEXT,
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "student_applications" DROP COLUMN "city",
DROP COLUMN "indigeneCertificatePath",
DROP COLUMN "juniorSecondarySchoolCertificatePath",
DROP COLUMN "juniorSecondarySchoolEndDate",
DROP COLUMN "juniorSecondarySchoolGrade",
DROP COLUMN "juniorSecondarySchoolName",
DROP COLUMN "juniorSecondarySchoolStartDate",
DROP COLUMN "juniorSecondarySchoolTestimonialPath",
DROP COLUMN "middleName",
DROP COLUMN "nationalIdCardPath",
DROP COLUMN "parentIdCardPath",
DROP COLUMN "primarySchoolCertificatePath",
DROP COLUMN "primarySchoolEndDate",
DROP COLUMN "primarySchoolGrade",
DROP COLUMN "primarySchoolName",
DROP COLUMN "primarySchoolStartDate",
DROP COLUMN "primarySchoolTestimonialPath",
DROP COLUMN "zipCode",
ADD COLUMN     "lastSchoolAttended" TEXT,
ADD COLUMN     "screeningSlotId" TEXT,
DROP COLUMN "dob",
ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "lga" DROP NOT NULL,
ALTER COLUMN "religion" DROP NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "city",
DROP COLUMN "indigeneCertificatePath",
DROP COLUMN "juniorSecondarySchoolCertificatePath",
DROP COLUMN "juniorSecondarySchoolEndDate",
DROP COLUMN "juniorSecondarySchoolGrade",
DROP COLUMN "juniorSecondarySchoolName",
DROP COLUMN "juniorSecondarySchoolStartDate",
DROP COLUMN "juniorSecondarySchoolTestimonialPath",
DROP COLUMN "middleName",
DROP COLUMN "nationalIdCardPath",
DROP COLUMN "parentIdCardPath",
DROP COLUMN "primarySchoolCertificatePath",
DROP COLUMN "primarySchoolEndDate",
DROP COLUMN "primarySchoolGrade",
DROP COLUMN "primarySchoolName",
DROP COLUMN "primarySchoolStartDate",
DROP COLUMN "primarySchoolTestimonialPath",
DROP COLUMN "zipCode",
ADD COLUMN     "admissionSessionId" TEXT,
ADD COLUMN     "currentSessionId" TEXT,
ADD COLUMN     "exitReason" TEXT,
ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isRegistered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastSchoolAttended" TEXT,
ADD COLUMN     "paymentPlan" "PaymentPlan" NOT NULL DEFAULT 'TERM',
ADD COLUMN     "registrationDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "registrationNumber" TEXT,
DROP COLUMN "dob",
ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "teacher_subject_classes" ADD COLUMN     "hoursPerWeek" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "requiresDoublePeriod" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "birthday",
ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "academic_sessions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_terms" (
    "id" TEXT NOT NULL,
    "name" "Term" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "termId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_configs" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "schoolStartTime" TIMESTAMP(3) NOT NULL,
    "schoolEndTime" TIMESTAMP(3) NOT NULL,
    "periodDuration" INTEGER NOT NULL,
    "breaks" JSONB NOT NULL,
    "workingDays" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timetable_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_timetable_configs" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "examsPerDay" INTEGER NOT NULL DEFAULT 2,
    "examDuration" INTEGER NOT NULL DEFAULT 120,
    "breakBetweenExams" INTEGER NOT NULL DEFAULT 30,
    "examStartTime" TEXT NOT NULL DEFAULT '09:00',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_timetable_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structures" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_fees" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "FeeStatus" NOT NULL DEFAULT 'UNPAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_payments" (
    "id" TEXT NOT NULL,
    "studentFeeId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT,
    "reference" TEXT,
    "recordedBy" TEXT,

    CONSTRAINT "fee_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_components" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_settings" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "promotionAverage" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "publishedTermId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "result_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_scores" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "result_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academic_sessions_schoolId_idx" ON "academic_sessions"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "academic_sessions_name_schoolId_key" ON "academic_sessions"("name", "schoolId");

-- CreateIndex
CREATE INDEX "academic_terms_sessionId_idx" ON "academic_terms"("sessionId");

-- CreateIndex
CREATE INDEX "academic_terms_schoolId_idx" ON "academic_terms"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "academic_terms_name_sessionId_key" ON "academic_terms"("name", "sessionId");

-- CreateIndex
CREATE INDEX "academic_events_termId_idx" ON "academic_events"("termId");

-- CreateIndex
CREATE INDEX "academic_events_schoolId_idx" ON "academic_events"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_configs_schoolId_key" ON "timetable_configs"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_timetable_configs_schoolId_key" ON "exam_timetable_configs"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "fee_structures_schoolId_sessionId_classId_term_key" ON "fee_structures"("schoolId", "sessionId", "classId", "term");

-- CreateIndex
CREATE UNIQUE INDEX "student_fees_studentId_sessionId_term_key" ON "student_fees"("studentId", "sessionId", "term");

-- CreateIndex
CREATE INDEX "assessment_components_schoolId_idx" ON "assessment_components"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_components_name_schoolId_key" ON "assessment_components"("name", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "result_settings_schoolId_key" ON "result_settings"("schoolId");

-- CreateIndex
CREATE INDEX "results_studentId_idx" ON "results"("studentId");

-- CreateIndex
CREATE INDEX "results_subjectId_idx" ON "results"("subjectId");

-- CreateIndex
CREATE INDEX "results_termId_idx" ON "results"("termId");

-- CreateIndex
CREATE INDEX "results_schoolId_idx" ON "results"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "results_studentId_subjectId_termId_key" ON "results"("studentId", "subjectId", "termId");

-- CreateIndex
CREATE INDEX "result_scores_resultId_idx" ON "result_scores"("resultId");

-- CreateIndex
CREATE UNIQUE INDEX "result_scores_resultId_componentId_key" ON "result_scores"("resultId", "componentId");

-- CreateIndex
CREATE UNIQUE INDEX "students_registrationNumber_key" ON "students"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "timetables_classId_term_schoolId_key" ON "timetables"("classId", "term", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- AddForeignKey
ALTER TABLE "school_applications" ADD CONSTRAINT "school_applications_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_admissionSessionId_fkey" FOREIGN KEY ("admissionSessionId") REFERENCES "academic_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_currentSessionId_fkey" FOREIGN KEY ("currentSessionId") REFERENCES "academic_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_screeningSlotId_fkey" FOREIGN KEY ("screeningSlotId") REFERENCES "screening_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_sessions" ADD CONSTRAINT "academic_sessions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_terms" ADD CONSTRAINT "academic_terms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_terms" ADD CONSTRAINT "academic_terms_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academic_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_events" ADD CONSTRAINT "academic_events_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_events" ADD CONSTRAINT "academic_events_termId_fkey" FOREIGN KEY ("termId") REFERENCES "academic_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_configs" ADD CONSTRAINT "timetable_configs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_timetable_configs" ADD CONSTRAINT "exam_timetable_configs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academic_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academic_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_studentFeeId_fkey" FOREIGN KEY ("studentFeeId") REFERENCES "student_fees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_components" ADD CONSTRAINT "assessment_components_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_settings" ADD CONSTRAINT "result_settings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_settings" ADD CONSTRAINT "result_settings_publishedTermId_fkey" FOREIGN KEY ("publishedTermId") REFERENCES "academic_terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_termId_fkey" FOREIGN KEY ("termId") REFERENCES "academic_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academic_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_scores" ADD CONSTRAINT "result_scores_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_scores" ADD CONSTRAINT "result_scores_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "assessment_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

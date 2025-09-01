/*
  Warnings:

  - You are about to drop the column `departmentId` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `exam_timetables` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `student_applications` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `classIds` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `teacherIds` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `subjectIds` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `timetables` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `timetables` table. All the data in the column will be lost.
  - You are about to drop the `departments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,levelId,schoolId]` on the table `classes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `levelId` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `levelId` to the `exam_timetables` table without a default value. This is not possible if the table is not empty.
  - Added the required column `levelId` to the `timetables` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."classes" DROP CONSTRAINT "classes_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."departments" DROP CONSTRAINT "departments_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_applications" DROP CONSTRAINT "student_applications_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."subjects" DROP CONSTRAINT "subjects_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."teachers" DROP CONSTRAINT "teachers_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."timetables" DROP CONSTRAINT "timetables_departmentId_fkey";

-- DropIndex
DROP INDEX "public"."classes_name_departmentId_schoolId_key";

-- AlterTable
ALTER TABLE "public"."classes" DROP COLUMN "departmentId",
DROP COLUMN "level",
ADD COLUMN     "levelId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."exam_timetables" DROP COLUMN "level",
ADD COLUMN     "levelId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."student_applications" DROP COLUMN "departmentId",
DROP COLUMN "level";

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "departmentId",
DROP COLUMN "level";

-- AlterTable
ALTER TABLE "public"."subjects" DROP COLUMN "classIds",
DROP COLUMN "departmentId",
DROP COLUMN "teacherIds";

-- AlterTable
ALTER TABLE "public"."teachers" DROP COLUMN "departmentId",
DROP COLUMN "subjectIds";

-- AlterTable
ALTER TABLE "public"."timetables" DROP COLUMN "departmentId",
DROP COLUMN "level",
ADD COLUMN     "levelId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."departments";

-- DropEnum
DROP TYPE "public"."Level";

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
CREATE TABLE "public"."_LevelToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LevelToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ClassToTeacher" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassToTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_SubjectToTeacher" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubjectToTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "levels_name_schoolId_key" ON "public"."levels"("name", "schoolId");

-- CreateIndex
CREATE INDEX "_LevelToSubject_B_index" ON "public"."_LevelToSubject"("B");

-- CreateIndex
CREATE INDEX "_ClassToTeacher_B_index" ON "public"."_ClassToTeacher"("B");

-- CreateIndex
CREATE INDEX "_SubjectToTeacher_B_index" ON "public"."_SubjectToTeacher"("B");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_levelId_schoolId_key" ON "public"."classes"("name", "levelId", "schoolId");

-- AddForeignKey
ALTER TABLE "public"."levels" ADD CONSTRAINT "levels_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timetables" ADD CONSTRAINT "timetables_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_timetables" ADD CONSTRAINT "exam_timetables_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_LevelToSubject" ADD CONSTRAINT "_LevelToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_LevelToSubject" ADD CONSTRAINT "_LevelToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ClassToTeacher" ADD CONSTRAINT "_ClassToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ClassToTeacher" ADD CONSTRAINT "_ClassToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SubjectToTeacher" ADD CONSTRAINT "_SubjectToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SubjectToTeacher" ADD CONSTRAINT "_SubjectToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

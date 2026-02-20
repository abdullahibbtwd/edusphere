/*
  Warnings:

  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "school_contents" ADD COLUMN     "classes" JSONB;

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "classAssignment" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerificationCode" TEXT,
ADD COLUMN     "emailVerificationExpires" TIMESTAMP(3),
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "passwordResetCode" TEXT,
ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ALTER COLUMN "clerkUserId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

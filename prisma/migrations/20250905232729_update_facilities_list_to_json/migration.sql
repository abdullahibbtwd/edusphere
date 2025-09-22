/*
  Warnings:

  - The `facilitiesList` column on the `schools` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."schools" DROP COLUMN "facilitiesList",
ADD COLUMN     "facilitiesList" JSONB;

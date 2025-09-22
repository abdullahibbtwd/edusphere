-- AlterTable
ALTER TABLE "public"."school_contents" ADD COLUMN     "aboutDescription" TEXT NOT NULL DEFAULT 'We are committed to building modern, user-friendly school websites that enhance communication between educators, students, and parents. Our platform is designed to be fast, secure, and customizable.',
ADD COLUMN     "aboutImage" TEXT,
ADD COLUMN     "aboutTitle" TEXT NOT NULL DEFAULT 'About Us',
ADD COLUMN     "bannerImage" TEXT,
ADD COLUMN     "bannerStats" JSONB,
ADD COLUMN     "bannerTitle" TEXT NOT NULL DEFAULT 'The Best Secondary School In Kano State';

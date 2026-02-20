-- Add USER to Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'USER';

-- Update default for existing users (optional - only if you want existing users to have USER role)
-- ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

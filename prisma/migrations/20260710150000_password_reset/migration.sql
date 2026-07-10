-- Add password reset code fields to User
ALTER TABLE "User" ADD COLUMN "resetCode" TEXT;
ALTER TABLE "User" ADD COLUMN "resetExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "resetAttempts" INTEGER NOT NULL DEFAULT 0;

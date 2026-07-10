-- Add email verification fields to User
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "verificationCode" TEXT;
ALTER TABLE "User" ADD COLUMN "verificationExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "verificationAttempts" INTEGER NOT NULL DEFAULT 0;

-- Existing accounts created before verification existed stay usable
UPDATE "User" SET "emailVerified" = true;

-- AlterTable
ALTER TABLE "AudioContribution" ADD COLUMN "reportedByUserIds" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "streakFreezes" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "streakFreezeDates" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "streakFreezeMilestone" INTEGER NOT NULL DEFAULT 0;

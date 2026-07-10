-- Optional learner profile basics collected after registration
ALTER TABLE "User" ADD COLUMN "learningLanguage" TEXT;
ALTER TABLE "User" ADD COLUMN "proficiencyLevel" TEXT;
ALTER TABLE "User" ADD COLUMN "dailyGoalMinutes" INTEGER;

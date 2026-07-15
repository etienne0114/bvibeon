-- CreateTable
CREATE TABLE "LearningPassage" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topic" TEXT,
    "source" TEXT NOT NULL DEFAULT 'ai_generated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningPassage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passageId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "accuracy" INTEGER NOT NULL DEFAULT 0,
    "mistakes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningPassage_language_level_contentType_idx" ON "LearningPassage"("language", "level", "contentType");

-- CreateIndex
CREATE INDEX "SkillSession_userId_skill_createdAt_idx" ON "SkillSession"("userId", "skill", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SkillSession_passageId_idx" ON "SkillSession"("passageId");

-- AddForeignKey
ALTER TABLE "SkillSession" ADD CONSTRAINT "SkillSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillSession" ADD CONSTRAINT "SkillSession_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "LearningPassage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

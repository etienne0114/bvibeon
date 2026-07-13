-- AlterTable
ALTER TABLE "LearningSession" ADD COLUMN     "topicId" TEXT;

-- CreateIndex
CREATE INDEX "DictionaryLookup_language_accessedCount_idx" ON "DictionaryLookup"("language", "accessedCount");

-- CreateIndex
CREATE INDEX "LearningSession_topicId_idx" ON "LearningSession"("topicId");

-- CreateIndex
CREATE INDEX "RolePlayScenario_category_idx" ON "RolePlayScenario"("category");

-- CreateIndex
CREATE INDEX "TechnologyTopic_category_idx" ON "TechnologyTopic"("category");

-- AddForeignKey
ALTER TABLE "LearningSession" ADD CONSTRAINT "LearningSession_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "TechnologyTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;


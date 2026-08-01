-- CreateTable
CREATE TABLE "AudioContribution" (
    "id" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "vocabularyItemId" TEXT,
    "audioData" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'audio/webm',
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudioContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AudioContribution_word_language_reportCount_idx" ON "AudioContribution"("word", "language", "reportCount");

-- CreateIndex
CREATE INDEX "AudioContribution_contributorId_createdAt_idx" ON "AudioContribution"("contributorId", "createdAt");

-- AddForeignKey
ALTER TABLE "AudioContribution" ADD CONSTRAINT "AudioContribution_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioContribution" ADD CONSTRAINT "AudioContribution_vocabularyItemId_fkey" FOREIGN KEY ("vocabularyItemId") REFERENCES "VocabularyItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

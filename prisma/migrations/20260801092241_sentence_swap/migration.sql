-- CreateTable
CREATE TABLE "SentenceSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentenceSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentenceCorrection" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "correctorId" TEXT NOT NULL,
    "correctedText" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentenceCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SentenceSubmission_language_status_createdAt_idx" ON "SentenceSubmission"("language", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SentenceSubmission_userId_createdAt_idx" ON "SentenceSubmission"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SentenceCorrection_submissionId_key" ON "SentenceCorrection"("submissionId");

-- CreateIndex
CREATE INDEX "SentenceCorrection_correctorId_idx" ON "SentenceCorrection"("correctorId");

-- AddForeignKey
ALTER TABLE "SentenceSubmission" ADD CONSTRAINT "SentenceSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentenceCorrection" ADD CONSTRAINT "SentenceCorrection_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "SentenceSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentenceCorrection" ADD CONSTRAINT "SentenceCorrection_correctorId_fkey" FOREIGN KEY ("correctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

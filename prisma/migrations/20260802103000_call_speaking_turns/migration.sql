-- Structured speaking turns for calls: raise-hand queue + per-speaker timer
ALTER TABLE "CallSession" ADD COLUMN "speakingMode" TEXT NOT NULL DEFAULT 'OPEN';
ALTER TABLE "CallSession" ADD COLUMN "speakerTimeSec" INTEGER;
ALTER TABLE "CallSession" ADD COLUMN "currentSpeakerId" TEXT;
ALTER TABLE "CallSession" ADD COLUMN "currentSpeakerStartedAt" TIMESTAMP(3);
ALTER TABLE "CallSession" ADD COLUMN "speakerQueue" TEXT NOT NULL DEFAULT '[]';

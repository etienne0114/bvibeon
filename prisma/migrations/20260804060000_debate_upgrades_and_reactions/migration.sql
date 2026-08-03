-- Debate policies/question/phases, audience voting, chat message reactions
ALTER TABLE "Channel" ADD COLUMN "debateQuestion" TEXT;
ALTER TABLE "Channel" ADD COLUMN "debatePolicies" TEXT;
ALTER TABLE "Channel" ADD COLUMN "debatePhases" TEXT;

ALTER TABLE "DebateRequest" ADD COLUMN "side" TEXT;

ALTER TABLE "CallSession" ADD COLUMN "currentPhaseIndex" INTEGER;

CREATE TABLE "MessageReaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageReaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MessageReaction_messageId_userId_emoji_key" ON "MessageReaction"("messageId", "userId", "emoji");
CREATE INDEX "MessageReaction_messageId_idx" ON "MessageReaction"("messageId");
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChannelMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "DebateVote" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DebateVote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DebateVote_channelId_userId_key" ON "DebateVote"("channelId", "userId");
CREATE INDEX "DebateVote_channelId_side_idx" ON "DebateVote"("channelId", "side");
ALTER TABLE "DebateVote" ADD CONSTRAINT "DebateVote_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DebateVote" ADD CONSTRAINT "DebateVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

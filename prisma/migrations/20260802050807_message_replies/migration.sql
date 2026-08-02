-- AlterTable
ALTER TABLE "ChannelMessage" ADD COLUMN "parentMessageId" TEXT;

-- CreateIndex
CREATE INDEX "ChannelMessage_parentMessageId_idx" ON "ChannelMessage"("parentMessageId");

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "ChannelMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

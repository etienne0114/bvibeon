-- Live in-call settings (host gear panel) + real join-request/approval flow
ALTER TABLE "CallSession" ADD COLUMN "requireApproval" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CallSession" ADD COLUMN "autoMuteOnJoin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CallSession" ADD COLUMN "topic" TEXT;

CREATE TABLE "CallJoinRequest" (
    "id" TEXT NOT NULL,
    "callSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CallJoinRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CallJoinRequest_callSessionId_userId_key" ON "CallJoinRequest"("callSessionId", "userId");
CREATE INDEX "CallJoinRequest_callSessionId_status_idx" ON "CallJoinRequest"("callSessionId", "status");

ALTER TABLE "CallJoinRequest" ADD CONSTRAINT "CallJoinRequest_callSessionId_fkey" FOREIGN KEY ("callSessionId") REFERENCES "CallSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CallJoinRequest" ADD CONSTRAINT "CallJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

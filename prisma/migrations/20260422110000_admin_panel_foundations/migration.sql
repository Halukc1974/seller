-- Admin panel foundations: user ban/suspend state, audit log, platform settings

-- UserStatus enum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BANNED');

-- User: add status / ban metadata
ALTER TABLE "User"
  ADD COLUMN "status"       "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "bannedAt"     TIMESTAMP(3),
  ADD COLUMN "bannedReason" TEXT;

-- CreatorProfile: suspend state
ALTER TABLE "CreatorProfile"
  ADD COLUMN "suspended"       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "suspendedAt"     TIMESTAMP(3),
  ADD COLUMN "suspendedReason" TEXT;

-- AdminAuditLog: every privileged action
CREATE TABLE "AdminAuditLog" (
    "id"         TEXT         NOT NULL,
    "actorId"    TEXT         NOT NULL,
    "actorEmail" TEXT,
    "action"     TEXT         NOT NULL,
    "targetType" TEXT,
    "targetId"   TEXT,
    "metadata"   JSONB,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdminAuditLog_actorId_idx"              ON "AdminAuditLog"("actorId");
CREATE INDEX "AdminAuditLog_action_idx"               ON "AdminAuditLog"("action");
CREATE INDEX "AdminAuditLog_targetType_targetId_idx"  ON "AdminAuditLog"("targetType", "targetId");
CREATE INDEX "AdminAuditLog_createdAt_idx"            ON "AdminAuditLog"("createdAt");

-- PlatformSettings: singleton row
CREATE TABLE "PlatformSettings" (
    "id"                  TEXT          NOT NULL DEFAULT 'singleton',
    "creatorRevenueShare" DECIMAL(3, 2) NOT NULL DEFAULT 0.80,
    "allowNewCreators"    BOOLEAN       NOT NULL DEFAULT true,
    "allowNewPurchases"   BOOLEAN       NOT NULL DEFAULT true,
    "maintenanceMessage"  TEXT,
    "updatedAt"           TIMESTAMP(3)  NOT NULL,
    "updatedBy"           TEXT,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- Seed singleton row
INSERT INTO "PlatformSettings" ("id", "creatorRevenueShare", "allowNewCreators", "allowNewPurchases", "updatedAt")
VALUES ('singleton', 0.80, true, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

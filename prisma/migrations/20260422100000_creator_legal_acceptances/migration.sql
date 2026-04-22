-- CreatorLegalAcceptance: per-creator, per-document audit trail for legal
-- acknowledgements captured during onboarding.

CREATE TABLE "CreatorLegalAcceptance" (
    "id" TEXT NOT NULL,
    "creatorProfileId" TEXT NOT NULL,
    "documentKey" TEXT NOT NULL,
    "documentVersion" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "CreatorLegalAcceptance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreatorLegalAcceptance_creatorProfileId_documentKey_key"
    ON "CreatorLegalAcceptance"("creatorProfileId", "documentKey");
CREATE INDEX "CreatorLegalAcceptance_creatorProfileId_idx"
    ON "CreatorLegalAcceptance"("creatorProfileId");
CREATE INDEX "CreatorLegalAcceptance_documentKey_idx"
    ON "CreatorLegalAcceptance"("documentKey");

ALTER TABLE "CreatorLegalAcceptance"
    ADD CONSTRAINT "CreatorLegalAcceptance_creatorProfileId_fkey"
    FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "public"."activity_badge_award" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "badgeName" TEXT NOT NULL,
    "badgeDescription" TEXT,
    "badgeIcon" TEXT,
    "badgeColor" TEXT,
    "badgeKeywords" TEXT[],
    "awardedById" TEXT NOT NULL,
    "awardedToId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_badge_award_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_badge_award_activityId_idx" ON "public"."activity_badge_award"("activityId");

-- CreateIndex
CREATE INDEX "activity_badge_award_awardedById_idx" ON "public"."activity_badge_award"("awardedById");

-- CreateIndex
CREATE INDEX "activity_badge_award_awardedToId_idx" ON "public"."activity_badge_award"("awardedToId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_badge_award_activityId_awardedById_awardedToId_bad_key" ON "public"."activity_badge_award"("activityId", "awardedById", "awardedToId", "badgeId");

-- AddForeignKey
ALTER TABLE "public"."activity_badge_award" ADD CONSTRAINT "activity_badge_award_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_badge_award" ADD CONSTRAINT "activity_badge_award_awardedById_fkey" FOREIGN KEY ("awardedById") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_badge_award" ADD CONSTRAINT "activity_badge_award_awardedToId_fkey" FOREIGN KEY ("awardedToId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "public"."vacancy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredCourses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modality" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "workload" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT,
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deadline" TIMESTAMP(3),
    "locationCity" TEXT,
    "locationState" TEXT,
    "locationCountry" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "contactUrl" TEXT,
    "contactNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "recruiterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vacancy_application" (
    "id" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "decidedById" TEXT,
    "coverLetter" TEXT,
    "resumeUrl" TEXT,
    "portfolioUrl" TEXT,
    "additionalInfo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decisionNote" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacancy_application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vacancy_status_idx" ON "public"."vacancy"("status");

-- CreateIndex
CREATE INDEX "vacancy_isDraft_idx" ON "public"."vacancy"("isDraft");

-- CreateIndex
CREATE INDEX "vacancy_modality_idx" ON "public"."vacancy"("modality");

-- CreateIndex
CREATE INDEX "vacancy_locationState_locationCity_idx" ON "public"."vacancy"("locationState", "locationCity");

-- CreateIndex
CREATE INDEX "vacancy_preferredCourses_idx" ON "public"."vacancy" USING GIN ("preferredCourses");

-- CreateIndex
CREATE INDEX "vacancy_keywords_idx" ON "public"."vacancy" USING GIN ("keywords");

-- CreateIndex
CREATE INDEX "vacancy_application_status_idx" ON "public"."vacancy_application"("status");

-- CreateIndex
CREATE INDEX "vacancy_application_vacancyId_idx" ON "public"."vacancy_application"("vacancyId");

-- CreateIndex
CREATE INDEX "vacancy_application_applicantId_idx" ON "public"."vacancy_application"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "vacancy_application_vacancyId_applicantId_key" ON "public"."vacancy_application"("vacancyId", "applicantId");

-- AddForeignKey
ALTER TABLE "public"."vacancy" ADD CONSTRAINT "vacancy_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vacancy_application" ADD CONSTRAINT "vacancy_application_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "public"."vacancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vacancy_application" ADD CONSTRAINT "vacancy_application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vacancy_application" ADD CONSTRAINT "vacancy_application_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

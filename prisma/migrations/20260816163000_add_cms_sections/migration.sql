-- CreateTable
CREATE TABLE "CmsSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "imageUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsSectionTranslation" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "eyebrow" TEXT,
    "title" TEXT,
    "text" TEXT,
    "imageAlt" TEXT,
    "ctaLabel" TEXT,

    CONSTRAINT "CmsSectionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CmsSection_key_key" ON "CmsSection"("key");

-- CreateIndex
CREATE INDEX "CmsSection_page_isActive_position_idx" ON "CmsSection"("page", "isActive", "position");

-- CreateIndex
CREATE UNIQUE INDEX "CmsSectionTranslation_sectionId_locale_key" ON "CmsSectionTranslation"("sectionId", "locale");

-- CreateIndex
CREATE INDEX "CmsSectionTranslation_locale_idx" ON "CmsSectionTranslation"("locale");

-- AddForeignKey
ALTER TABLE "CmsSectionTranslation" ADD CONSTRAINT "CmsSectionTranslation_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "CmsSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

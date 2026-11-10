-- AlterTable
ALTER TABLE "Product" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Product_isFeatured_idx" ON "Product"("isFeatured");

-- CreateTable
CREATE TABLE "HomeCollection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeCollectionTranslation" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,

    CONSTRAINT "HomeCollectionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationItem" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "image" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationItemTranslation" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "imageAlt" TEXT,

    CONSTRAINT "NavigationItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationGroup" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NavigationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationGroupTranslation" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "NavigationGroupTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationLink" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NavigationLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationLinkTranslation" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "NavigationLinkTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomeCollection_slug_key" ON "HomeCollection"("slug");

-- CreateIndex
CREATE INDEX "HomeCollection_isActive_position_idx" ON "HomeCollection"("isActive", "position");

-- CreateIndex
CREATE UNIQUE INDEX "HomeCollectionTranslation_collectionId_locale_key" ON "HomeCollectionTranslation"("collectionId", "locale");

-- CreateIndex
CREATE INDEX "HomeCollectionTranslation_locale_idx" ON "HomeCollectionTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationItem_key_key" ON "NavigationItem"("key");

-- CreateIndex
CREATE INDEX "NavigationItem_isActive_position_idx" ON "NavigationItem"("isActive", "position");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationItemTranslation_itemId_locale_key" ON "NavigationItemTranslation"("itemId", "locale");

-- CreateIndex
CREATE INDEX "NavigationItemTranslation_locale_idx" ON "NavigationItemTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationGroup_itemId_key_key" ON "NavigationGroup"("itemId", "key");

-- CreateIndex
CREATE INDEX "NavigationGroup_itemId_position_idx" ON "NavigationGroup"("itemId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationGroupTranslation_groupId_locale_key" ON "NavigationGroupTranslation"("groupId", "locale");

-- CreateIndex
CREATE INDEX "NavigationGroupTranslation_locale_idx" ON "NavigationGroupTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationLink_groupId_href_key" ON "NavigationLink"("groupId", "href");

-- CreateIndex
CREATE INDEX "NavigationLink_groupId_position_idx" ON "NavigationLink"("groupId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationLinkTranslation_linkId_locale_key" ON "NavigationLinkTranslation"("linkId", "locale");

-- CreateIndex
CREATE INDEX "NavigationLinkTranslation_locale_idx" ON "NavigationLinkTranslation"("locale");

-- AddForeignKey
ALTER TABLE "HomeCollectionTranslation" ADD CONSTRAINT "HomeCollectionTranslation_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "HomeCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationItemTranslation" ADD CONSTRAINT "NavigationItemTranslation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "NavigationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationGroup" ADD CONSTRAINT "NavigationGroup_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "NavigationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationGroupTranslation" ADD CONSTRAINT "NavigationGroupTranslation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "NavigationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationLink" ADD CONSTRAINT "NavigationLink_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "NavigationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationLinkTranslation" ADD CONSTRAINT "NavigationLinkTranslation_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "NavigationLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

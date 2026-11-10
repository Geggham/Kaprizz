-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoHeading" TEXT,
ADD COLUMN     "intro" TEXT,
ADD COLUMN     "editorialContent" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "seoDescription" TEXT;

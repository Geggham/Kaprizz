-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Order"
  ADD COLUMN "orderNumber" TEXT,
  ADD COLUMN "guestEmail" TEXT,
  ADD COLUMN "customerEmail" TEXT,
  ADD COLUMN "customerFirstName" TEXT,
  ADD COLUMN "customerLastName" TEXT,
  ADD COLUMN "customerPhone" TEXT,
  ADD COLUMN "clientRequestId" TEXT,
  ADD COLUMN "confirmationTokenHash" TEXT,
  ADD COLUMN "confirmationTokenExpiresAt" TIMESTAMP(3),
  ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID';

-- Existing orders receive a stable legacy number before the field becomes required.
UPDATE "Order" SET "orderNumber" = 'KAP-LEGACY-' || "id" WHERE "orderNumber" IS NULL;
ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "Order"
  ALTER COLUMN "userId" DROP NOT NULL,
  ALTER COLUMN "shippingAddressId" DROP NOT NULL;

ALTER TABLE "Order"
  ADD COLUMN "shippingFirstName" TEXT,
  ADD COLUMN "shippingLastName" TEXT,
  ADD COLUMN "shippingCountry" TEXT,
  ADD COLUMN "shippingCity" TEXT,
  ADD COLUMN "shippingAddressLine1" TEXT,
  ADD COLUMN "shippingAddressLine2" TEXT,
  ADD COLUMN "shippingPostalCode" TEXT,
  ADD COLUMN "shippingPhone" TEXT,
  ADD COLUMN "shippingCountryCode" TEXT,
  ADD COLUMN "shippingCountryName" TEXT,
  ADD COLUMN "shippingMethodName" TEXT,
  ADD COLUMN "shippingEstimatedMinDays" INTEGER,
  ADD COLUMN "shippingEstimatedMaxDays" INTEGER,
  ADD COLUMN "trackingNumber" TEXT,
  ADD COLUMN "trackingUrl" TEXT,
  ADD COLUMN "carrier" TEXT;

ALTER TABLE "OrderItem"
  ADD COLUMN "sku" TEXT,
  ADD COLUMN "personalisationType" "PersonalisationType",
  ADD COLUMN "personalisationValue" TEXT,
  ADD COLUMN "personalisationNotes" TEXT;

-- AlterTable
ALTER TABLE "ShippingCountry"
  ADD COLUMN "shippingPrice" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "Order_clientRequestId_key" ON "Order"("clientRequestId");
CREATE UNIQUE INDEX "Order_confirmationTokenHash_key" ON "Order"("confirmationTokenHash");
CREATE INDEX "Order_customerEmail_idx" ON "Order"("customerEmail");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");
CREATE INDEX "Order_confirmationTokenExpiresAt_idx" ON "Order"("confirmationTokenExpiresAt");
CREATE INDEX "Order_trackingNumber_idx" ON "Order"("trackingNumber");

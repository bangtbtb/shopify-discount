/*
  Warnings:

  - You are about to drop the `DiscountViews` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DiscountViews";

-- CreateTable
CREATE TABLE "DiscountAnalytics" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "views" BIGINT NOT NULL,
    "addCart" BIGINT NOT NULL,
    "discountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscountAnalytics_shop_createdAt_discountId_idx" ON "DiscountAnalytics"("shop", "createdAt", "discountId");

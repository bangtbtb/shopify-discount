/*
  Warnings:

  - You are about to drop the `OrderApplied` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DiscountApplied" DROP CONSTRAINT "DiscountApplied_orderAppliedId_fkey";

-- DropTable
DROP TABLE "OrderApplied";

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "wasApplied" BOOLEAN NOT NULL,
    "subTotalPrice" DECIMAL(65,30) NOT NULL,
    "products" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Orders_shop_createdAt_idx" ON "Orders"("shop", "createdAt");

-- AddForeignKey
ALTER TABLE "DiscountApplied" ADD CONSTRAINT "DiscountApplied_orderAppliedId_fkey" FOREIGN KEY ("orderAppliedId") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

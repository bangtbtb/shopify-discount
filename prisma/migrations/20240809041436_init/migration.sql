-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "label" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "DiscountApplied" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountApplied_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscountApplied_shop_createdAt_idx" ON "DiscountApplied"("shop", "createdAt");

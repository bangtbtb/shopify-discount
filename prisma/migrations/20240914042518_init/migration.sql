-- DropIndex
DROP INDEX "DiscountApplied_discountId_idx";

-- CreateIndex
CREATE INDEX "DiscountApplied_shop_createdAt_discountId_idx" ON "DiscountApplied"("shop", "createdAt", "discountId");

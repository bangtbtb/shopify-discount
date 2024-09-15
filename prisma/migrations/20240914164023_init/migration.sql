-- DropIndex
DROP INDEX "DiscountViews_shop_createdAt_idx";

-- CreateIndex
CREATE INDEX "DiscountViews_shop_createdAt_discountId_idx" ON "DiscountViews"("shop", "createdAt", "discountId");

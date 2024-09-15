-- CreateTable
CREATE TABLE "DiscountViews" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "views" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountViews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscountViews_shop_createdAt_idx" ON "DiscountViews"("shop", "createdAt");

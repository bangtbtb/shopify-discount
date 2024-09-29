-- CreateEnum
CREATE TYPE "ADT" AS ENUM ('None', 'Volume', 'Bundle', 'Shipping');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "metafield" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "type" "ADT" NOT NULL,
    "subType" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "productIds" TEXT[],
    "collectionIds" TEXT[],

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountTheme" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "setting" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,

    CONSTRAINT "DiscountTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountViews" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "views" BIGINT NOT NULL,
    "discountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountViews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "wasApplied" BOOLEAN NOT NULL,
    "subTotal" DECIMAL(30,4) NOT NULL,
    "subTotalUsd" DECIMAL(30,4) NOT NULL,
    "products" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountApplied" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "orderAppliedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountApplied_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillCheckpoint" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "total" DECIMAL(30,4) NOT NULL,
    "totalUsd" DECIMAL(30,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionBill" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "money" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionBill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Discount_shop_createdAt_idx" ON "Discount"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "Discount_label_idx" ON "Discount"("label");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountTheme_discountId_key" ON "DiscountTheme"("discountId");

-- CreateIndex
CREATE INDEX "DiscountViews_shop_createdAt_discountId_idx" ON "DiscountViews"("shop", "createdAt", "discountId");

-- CreateIndex
CREATE INDEX "Orders_shop_createdAt_idx" ON "Orders"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "DiscountApplied_shop_createdAt_discountId_idx" ON "DiscountApplied"("shop", "createdAt", "discountId");

-- CreateIndex
CREATE UNIQUE INDEX "BillCheckpoint_shop_key" ON "BillCheckpoint"("shop");

-- CreateIndex
CREATE INDEX "BillCheckpoint_updatedAt_idx" ON "BillCheckpoint"("updatedAt");

-- AddForeignKey
ALTER TABLE "DiscountTheme" ADD CONSTRAINT "DiscountTheme_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountApplied" ADD CONSTRAINT "DiscountApplied_orderAppliedId_fkey" FOREIGN KEY ("orderAppliedId") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountApplied" ADD CONSTRAINT "DiscountApplied_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

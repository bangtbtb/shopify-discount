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
CREATE TABLE "OrderApplied" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "wasApplied" BOOLEAN NOT NULL,
    "subTotalPrice" DECIMAL(65,30) NOT NULL,
    "products" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderApplied_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX "Discount_shop_createdAt_idx" ON "Discount"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "Discount_label_idx" ON "Discount"("label");

-- CreateIndex
CREATE INDEX "OrderApplied_shop_createdAt_idx" ON "OrderApplied"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "DiscountApplied_discountId_idx" ON "DiscountApplied"("discountId");

-- AddForeignKey
ALTER TABLE "DiscountApplied" ADD CONSTRAINT "DiscountApplied_orderAppliedId_fkey" FOREIGN KEY ("orderAppliedId") REFERENCES "OrderApplied"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountApplied" ADD CONSTRAINT "DiscountApplied_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

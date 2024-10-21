-- DropForeignKey
ALTER TABLE "DiscountApplied" DROP CONSTRAINT "DiscountApplied_discountId_fkey";

-- DropForeignKey
ALTER TABLE "DiscountTheme" DROP CONSTRAINT "DiscountTheme_discountId_fkey";

-- AlterTable
ALTER TABLE "DiscountApplied" ALTER COLUMN "discountId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DiscountTheme" ADD CONSTRAINT "DiscountTheme_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountApplied" ADD CONSTRAINT "DiscountApplied_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

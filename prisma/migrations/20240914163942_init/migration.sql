/*
  Warnings:

  - Added the required column `discountId` to the `DiscountViews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DiscountViews" ADD COLUMN     "discountId" TEXT NOT NULL;

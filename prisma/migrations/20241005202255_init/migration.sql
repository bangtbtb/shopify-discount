/*
  Warnings:

  - The values [Shipping] on the enum `ADT` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ADT_new" AS ENUM ('None', 'Volume', 'Recommend', 'Bundle', 'Total', 'ShippingTotal', 'ShippingVolume');
ALTER TABLE "Discount" ALTER COLUMN "type" TYPE "ADT_new" USING ("type"::text::"ADT_new");
ALTER TYPE "ADT" RENAME TO "ADT_old";
ALTER TYPE "ADT_new" RENAME TO "ADT";
DROP TYPE "ADT_old";
COMMIT;

import { Discount, Prisma } from "@prisma/client";
import sha1 from "sha1";
import db from "../db.server";

export async function createPrismaDiscount(discount: Discount) {
  return db.discount.create({ data: discount });
}

export async function updatePrismaDiscount(
  id: string,
  discount: Prisma.DiscountUncheckedUpdateInput,
) {
  return db.discount.update({
    where: { id: id },
    data: discount,
  });
}

export async function deletePrismaDiscount(discountId: string) {
  return db.discount.delete({ where: { id: discountId } });
}

type RFindDiscount = {
  shop: string;
  productId: string;
  collectionIds: string[];
};

export async function findDiscount(req: RFindDiscount) {
  return db.discount.findMany({
    where: {
      shop: req.shop,

      OR: [
        {
          productIds: {
            has: req.productId,
          },
        },
        {
          collectionIds: {
            hasSome: req.collectionIds,
          },
        },
      ],
    },
  });
}

export async function getPrismaDiscounts(shop: string, page: number) {
  const take = 20;

  var data = await db.$transaction([
    db.discount.count({ where: { shop: shop } }),
    db.discount.findMany({
      take: take,
      skip: (page - 1) * take,
      where: {
        shop: shop,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);
  return { total: data[0], discounts: data[1] };
}

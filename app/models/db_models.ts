import { Discount, Prisma, ADT } from "@prisma/client";
import db from "../db.server";
import { ODConfig } from "~/defs";

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

export async function findPrismaVolumeDiscount(req: RFindDiscount) {
  return db.discount.findMany({
    where: {
      shop: req.shop,
      type: "Volume",
      status: "ACTIVE",
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
    orderBy: {
      createdAt: "asc",
    },
    take: 3,
  });
}

type RFindBunbleDiscount = {
  shop: string;
  productId: string;
  collectionIds: string[];
};

export async function findPrismaBundleDiscount(req: RFindBunbleDiscount) {
  return await db.discount.findMany({
    where: {
      shop: req.shop,
      type: "Bundle",
      status: "ACTIVE",
      OR: [
        {
          subType: "total",
        },
        {
          subType: "contain",
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
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 3,
  });
}

type RFindShippingDiscount = {
  shop: string;
  productId: string;
  collectionIds: string[];
};

export async function findPrismaShippingDiscount(req: RFindShippingDiscount) {
  return await db.discount.findMany({
    where: {
      shop: req.shop,
      type: "Shipping",
      status: "ACTIVE",
      OR: [
        {
          subType: "total",
        },
        {
          subType: "contain",
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
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 3,
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

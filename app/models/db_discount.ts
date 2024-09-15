import { Discount, Prisma } from "@prisma/client";
import db from "../db.server";

export async function dbCreateDiscount(discount: Prisma.DiscountCreateInput) {
  return db.discount.create({ data: discount });
}

export async function dbUpdateDiscount(
  id: string,
  discount: Prisma.DiscountUncheckedUpdateInput,
) {
  return db.discount.update({
    where: { id: id },
    data: discount,
  });
}

type RGetDiscountByLabel = {
  shop: string;
  label: string;
};

export async function dbGetDiscountByLabel(req: RGetDiscountByLabel) {
  return db.discount.findFirst({
    where: {
      shop: req.shop,
      label: req.label,
      status: "ACTIVED",
    },
  });
}

export async function dbDeleteDiscount(discountId: string) {
  return db.discount.delete({ where: { id: discountId } });
}

type RFindVolumeDiscount = {
  shop: string;
  productId: string;
  collectionIds: string[];
};

export async function dbFindVolumeDiscount(req: RFindVolumeDiscount) {
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
      createdAt: "desc",
    },
    take: 3,
  });
}

type RFindBunbleDiscount = {
  shop: string;
  productId: string;
  collectionIds: string[];
};

export async function dbFindBundleDiscount(req: RFindBunbleDiscount) {
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
      createdAt: "desc",
    },
    take: 3,
  });
}

type RFindShippingDiscount = {
  shop: string;
  productId: string;
  collectionIds: string[];
};

export async function dbFindShippingDiscount(req: RFindShippingDiscount) {
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
          subType: "volume",
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
      createdAt: "desc",
    },
    take: 3,
  });
}

type RGetDiscounts = {
  shop: string;
  page: number;
  limit?: number;
};

export async function dbGetDiscounts(req: RGetDiscounts) {
  const take = 20;

  var data = await db.$transaction([
    db.discount.count({ where: { shop: req.shop } }),
    db.discount.findMany({
      take: req.limit ?? take,
      skip: (req.page - 1) * (req.limit ?? take),
      where: {
        shop: req.shop,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);
  return { total: data[0], discounts: data[1] };
}

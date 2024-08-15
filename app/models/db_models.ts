import { Discount, Prisma } from "@prisma/client";
import db from "../db.server";
import { LineItem, ODConfig, SDConfig, VDConfig } from "~/defs";

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

type FindFitDiscount = {
  shop: string;
  label: string;
  total: BigInt;
  discountAmount: BigInt;
  lineItems: LineItem[];
};

export async function prismaFindFitDiscount(req: FindFitDiscount) {
  var offset = 0;
  var take = 10;
  var done = false;

  while (!done) {
    var discounts = await db.discount.findMany({
      where: {
        shop: req.shop,
        label: req.label,
      },
      skip: offset,
      take,
      orderBy: {
        createdAt: "asc",
      },
    });

    for (const d of discounts) {
      isDiscountMatch(req, d);
    }
  }
}

function isDiscountMatch(req: FindFitDiscount, discount: Discount) {
  if (discount.type === "Bundle") {
    return isDiscountMatchOD(req, discount);
  }

  if (discount.type === "Shipping") {
    return isDiscountMatchSD(req, discount);
  }

  if (discount.type === "Volume") {
    return isDiscountMatchVD(req, discount);
  }
  return false;
}

function isDiscountMatchOD(req: FindFitDiscount, discount: Discount) {
  var config: ODConfig = JSON.parse(discount.metafield);

  if (discount.subType === "total") {
    return false;
  }

  if (discount.subType === "contain") {
    return false;
  }

  return false;
}

function isDiscountMatchSD(req: FindFitDiscount, discount: Discount) {
  var config: SDConfig = JSON.parse(discount.metafield);

  if (discount.subType === "total") {
    return false;
  }

  if (discount.subType === "contain") {
    return false;
  }

  return false;
}

function isDiscountMatchVD(req: FindFitDiscount, discount: Discount) {
  var config: VDConfig = JSON.parse(discount.metafield);

  if (discount.subType === "collection") {
    return false;
  }

  if (discount.subType === "products") {
    return false;
  }

  return false;
}

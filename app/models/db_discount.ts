import { ADT, Discount, Prisma } from "@prisma/client";
import db from "../db.server";
import {
  DiscountApplication,
  LineItem,
  ODConfig,
  SDConfig,
  VDConfig,
} from "~/defs";

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

export async function deletePrismaDiscount(discountId: string) {
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
};

export async function dbGetDiscounts(req: RGetDiscounts) {
  const take = 20;

  var data = await db.$transaction([
    db.discount.count({ where: { shop: req.shop } }),
    db.discount.findMany({
      take: take,
      skip: (req.page - 1) * take,
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

// type FindFitDiscount = {
//   shop: string;
//   label: string;
//   totalPrice: bigint;
//   subTotal: bigint;
//   lineItems: LineItem[];
//   discount: DiscountApplication;
// };

// export async function dbFindFitDiscount(req: FindFitDiscount) {
//   var offset = 0;
//   var take = 10;
//   var done = false;

//   var cond: Prisma.DiscountWhereInput = {
//     shop: req.shop,
//     label: req.label,
//     status: "ACTIVED",
//   };

//   if (req.discount?.target_type === "shipping_line") {
//     cond.type = "Shipping";
//   } else {
//     cond.type = {
//       in: ["Bundle", "Volume"],
//     };
//   }

//   while (!done) {
//     var discounts = await db.discount.findMany({
//       where: cond,
//       skip: offset,
//       take,
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     for (const d of discounts) {
//       isDiscountMatch(req, d);
//     }
//   }
// }

// function isDiscountMatch(req: FindFitDiscount, discount: Discount) {
//   if (discount.type === "Bundle") {
//     return isDiscountMatchOD(req, discount);
//   }

//   if (discount.type === "Volume") {
//     return isDiscountMatchVD(req, discount);
//   }

//   if (discount.type === "Shipping") {
//     return isDiscountMatchSD(req, discount);
//   }

//   return false;
// }

// function isDiscountMatchOD(req: FindFitDiscount, discount: Discount) {
//   var config: ODConfig = JSON.parse(discount.metafield);

//   if (discount.subType === "total") {
//     var step = config.total?.steps.reduce((prev, current) => {
//       return prev;
//     }, null);

//     return false;
//   }

//   if (discount.subType === "contain") {
//     var products = countProduct(req.lineItems);
//     var containAll = true;
//     config.contain?.productIds.forEach((v) => {
//       if (!products.has(v)) {
//         containAll = false;
//       }
//     });

//     if (!containAll) {
//       return false;
//     }

//     if (
//       config.contain?.value.type === "fix" &&
//       req.discount.value_type === "fixed_amount"
//     ) {
//       return req.discount.value == BigInt(config.contain?.value.value || 0);
//     }

//     if (
//       config.contain?.value.type === "percent" &&
//       req.discount.value_type === "percentage"
//     ) {
//       return req.discount.value == BigInt(config.contain?.value.value || 0);
//     }

//     return false;
//   }

//   return false;
// }

// function isDiscountMatchVD(req: FindFitDiscount, discount: Discount) {
//   var config: VDConfig = JSON.parse(discount.metafield);
//   var step = config.steps.reduce((prev, cur) => {
//     if (
//       cur.value.type == "fix" &&
//       req.discount.value_type === "fixed_amount" &&
//       cur.value.value === Number(req.discount.value)
//     ) {
//     }
//     return prev;
//   }, null);

//   if (discount.subType === "collection") {
//     return false;
//   }

//   if (discount.subType === "products") {
//     return false;
//   }

//   return false;
// }

// function isDiscountMatchSD(req: FindFitDiscount, discount: Discount): boolean {
//   var config: SDConfig = JSON.parse(discount.metafield);

//   if (discount.subType === "total") {
//     var step = config.steps?.reduce((prev, cur) =>
//       req.totalPrice >= cur.require ? cur : prev,
//     );

//     if (!step || step.value.type) {
//       return false;
//     }

//     if (
//       step.value.type === "fix" &&
//       req.discount.value_type == "fixed_amount"
//     ) {
//       return req.discount.value == BigInt(step.value.value);
//     }

//     if (
//       step.value.type == "percent" &&
//       req.discount.value_type == "percentage"
//     ) {
//       return req.discount.value == BigInt(step.value.value);
//     }

//     return false;
//   }

//   if (discount.subType === "volume") {
//     var products = countProduct(req.lineItems);

//     return false;
//   }

//   return false;
// }

// interface ProductSum {
//   id: string;
//   total: number;
//   variants: Array<{
//     variant_id: number;
//     quantity: number;
//   }>;
// }

// function countProduct(lines: LineItem[]) {
//   // Count product
//   var pCounter = new Map<string, ProductSum>();
//   lines.forEach((line) => {
//     var productId = getGraphqlProductId(line.product_id);
//     var sum = pCounter.get(productId);
//     if (!sum) {
//       sum = {
//         id: productId,
//         total: 0,
//         variants: [],
//       };
//       pCounter.set(productId, sum);
//     }

//     sum.total += line.quantity;
//     sum.variants.push({
//       variant_id: line.variant_id,
//       quantity: line.quantity,
//     });
//   });
//   return pCounter;
// }

function getGraphqlProductId(id: string | number) {
  return "gid://shopify/Product/" + id;
}

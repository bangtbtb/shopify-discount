import { Prisma } from "@prisma/client";
import db from "../db.server";

export type DateGroup = "day" | "week" | "month" | "annual";

export type OrderAppliedReport = {
  orderCount: number;
  subTotalPrice: bigint;
  createdAt: Date;
};

export async function createOrderApplied(
  data: Prisma.OrderAppliedUncheckedCreateInput,
  dApplieds?: Prisma.DiscountAppliedCreateInput[] | undefined,
) {
  return db.orderApplied.create({
    data: {
      ...data,
      applied: dApplieds
        ? {
            create: dApplieds,
          }
        : undefined,
    },
  });
}

type OrderAppliedReportRequest = {
  shop: string;
  groupInterval: DateGroup;
  from: string; // yyyy-mm-dd
  to: string; // yyyy-mm-dd
};

export async function getOrderAppliedReport(req: OrderAppliedReportRequest) {
  var resp = await db.$queryRaw`
  WITH tbl AS (
  SELECT "subTotalPrice", 
        DATE_TRUNC(${req.groupInterval}, "createdAt") as "createdAt"
  FROM "OrderApplied"
  WHERE "shop" = ${req.shop} AND
           "createdAt" >=  ${new Date(req.from)} AND
           "createdAt" < ${new Date(req.to)}
  )
  SELECT  count("createdAt") as "orderCount", sum("subTotalPrice") as "subTotalPrice", "createdAt" 
  FROM tbl
  GROUP BY "createdAt"`;
  return resp;
  // return resp as Array<OrderAppliedReport>;
}

// WITH tbl AS (
//   SELECT id, "subTotalPrice",
//           DATE_TRUNC('${req.groupInterval}', "createdAt") as "createdAt"
// 		FROM "OrderApplied"
// 		WHERE "shop" = '${req.shop}' AND
//           "createdAt" >=  ${new Date(req.from)} AND
//           "createdAt" < ${new Date(req.to)}
//   )
//   SELECT  count("createdAt") as "orderCount", sum("subTotalPrice") as "subTotalPrice", "createdAt" FROM tbl
//   GROUP BY "createdAt"`

type GetOrderAppliedRequest = {
  shop: string;
  orderId: string;
  withApplied?: boolean;
};

export async function getOrderApplied(req: GetOrderAppliedRequest) {
  return db.orderApplied.findFirst({
    where: {
      id: req.orderId,
      shop: req.shop,
    },
    include: {
      applied: req.withApplied,
    },
  });
}

type GetOrderAppliedsRequest = {
  shop: string;
  offset: number;
  limit: number;
};

export async function getOrderApplieds(req: GetOrderAppliedsRequest) {
  return db.orderApplied.findMany({
    where: {
      shop: req.shop,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: req.offset,
    take: req.limit,
  });
}

type GetDiscountPerfomanceRequest = {
  shop: string;
  groupInterval: DateGroup;
  discountId: string;
  from: string; // yyyy-mm-dd
  to: string; // yyyy-mm-dd
};

export async function getDiscountPerfomance(req: GetDiscountPerfomanceRequest) {
  var resp = await db.$queryRaw`
  WITH tbl AS (
  SELECT "discountValue", "totalValue", DATE_TRUNC(${
    req.groupInterval
  }, "createdAt") as "createdAt"
  FROM "DiscountApplied"
  WHERE
    "shop" = ${req.shop} AND
    "discountId" = ${req.discountId} AND
    "createdAt" >= ${new Date(req.from)} AND
    "createdAt" < ${new Date(req.to)}
)
SELECT  count("createdAt") as "appliedCount", sum("discountValue") as "discountValue", "createdAt" FROM tbl
GROUP BY "createdAt"`;
  return resp;
}

// WITH tbl AS (
//   SELECT "discountValue", "totalValue", date_trunc('day', "createdAt") as createdAt
//   FROM "DiscountApplied"
//   WHERE
//     "shop" = 'zinza002.myshopify.com' AND
//     "discountId" = 'fake_d_1' AND
//     "createdAt" >= '2020-01-01' AND
//     "createdAt" < '2028-01-01'
//   )

// type GetDiscountAppliedRequest = {
//   shop: string;
//   discountId: string;
// };

// export async function getDiscountApplied(req: GetDiscountAppliedRequest) {
//   return db.discountApplied.findFirst({
//     where: {
//       shop: req.shop,
//       discountId: req.discountId,
//     },
//   });
// }

type GetDiscountAppliedsRequest = {
  shop: string;
  discountId: string;
  page: number;
};

export async function getDiscountApplieds(req: GetDiscountAppliedsRequest) {
  const take = 20;
  return db.discountApplied.findMany({
    take: take,
    skip: (req.page - 1) * take,
    where: {
      discountId: req.discountId,
      shop: req.shop,
    },
  });
}

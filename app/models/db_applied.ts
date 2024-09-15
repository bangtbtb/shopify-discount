import { Prisma } from "@prisma/client";
import db from "../db.server";
import { OrdersReport } from "~/defs/gui";

import { format } from "date-fns";

export type DateGroup = "day" | "week" | "month" | "annual";

export async function createOrders(
  data: Prisma.OrdersUncheckedCreateInput,
  dApplieds?: Prisma.DiscountAppliedCreateInput[] | undefined,
) {
  return db.orders.create({
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

type RawOrdersReport = {
  orderCount: number;
  subTotalPrice: bigint;
  wasApplied: boolean;
  createdAt: Date;
};

type OrdersReportRequest = {
  groupInterval: DateGroup;
  shop: string;
  from: Date;
  to: Date;
};

export async function getOrdersReport(req: OrdersReportRequest) {
  var resp: RawOrdersReport[] = await db.$queryRaw`
  WITH tbl AS (
        SELECT "subTotalPrice", "wasApplied",
              DATE_TRUNC(${req.groupInterval}, "createdAt") as "createdAt"
        FROM "Orders"
        WHERE "shop" = ${req.shop} AND
              "createdAt" >=  ${req.from} AND
              "createdAt" < ${req.to}
  )

  SELECT COUNT(DISTINCT("createdAt", "wasApplied") ) as "orderCount", 
  		SUM("subTotalPrice")::numeric(24) as "subTotalPrice", 
		 "wasApplied",
		 "createdAt" 
  FROM tbl
  GROUP BY "createdAt", "wasApplied" 
  ORDER BY "createdAt"`;

  return convertOrderReport(resp, req.groupInterval);
}

type GetOrdersRequest = {
  shop: string;
  orderId: string;
  withApplied?: boolean;
  page: number;
};

export async function getOrders(req: GetOrdersRequest) {
  return db.orders.findFirst({
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
  page: number;
  withApplied?: boolean;
};

export async function getOrderApplieds(req: GetOrderAppliedsRequest) {
  const take = 20;

  var where: Prisma.OrdersWhereInput = {
    shop: req.shop,
  };

  var data = await db.$transaction([
    db.orders.count({ where }),
    db.orders.findMany({
      take: take,
      skip: (req.page - 1) * take,
      where: where,
      include: {
        applied: req.withApplied,
      },
    }),
  ]);

  return { total: data[0], orders: data[1] };
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
    SELECT "discount", "total", DATE_TRUNC(${req.groupInterval}, "createdAt") as "createdAt"
    FROM "DiscountApplied"
    WHERE
      "shop" = ${req.shop} AND
      "createdAt" >= ${new Date(req.from)} AND
      "createdAt" < ${new Date(req.to)} AND
      "discountId" = ${req.discountId} 
  )
  SELECT  count("createdAt") as "appliedCount", 
          sum("discount") as "discount", 
          "createdAt" 
  FROM tbl
  GROUP BY "createdAt"`;
  return resp;
}

type GetDiscountAppliedsRequest = {
  shop: string;
  discountId: string;
  page: number;
};

export async function getDiscountApplieds(req: GetDiscountAppliedsRequest) {
  const take = 20;
  var where: Prisma.DiscountAppliedWhereInput = {
    discountId: req.discountId,
    shop: req.shop,
  };

  return db.discountApplied.findMany({
    take: take,
    skip: (req.page - 1) * take,
    where: where,
  });
}

function convertOrderReport(data: RawOrdersReport[], interval: DateGroup) {
  var rs: OrdersReport[] = [];
  if (interval === "annual") {
    rs = data.map((v) => ({
      orderCount: BigInt(v.orderCount),
      subTotalPrice: BigInt(v.subTotalPrice),
      wasApplied: v.wasApplied,
      date: format(v.createdAt, "yyyy"),
    }));
  } else if (interval === "month") {
    rs = data.map((v) => ({
      orderCount: BigInt(v.orderCount),
      subTotalPrice: BigInt(v.subTotalPrice),
      wasApplied: v.wasApplied,
      date: format(v.createdAt, "yyyy-MM"),
    }));
  } else if (interval === "week" || interval === "day") {
    console.log("Convert order report day or week");

    rs = data.map((v) => ({
      orderCount: BigInt(v.orderCount),
      subTotalPrice: BigInt(v.subTotalPrice),
      wasApplied: v.wasApplied,
      date: format(v.createdAt, "yyyy-MM-dd"),
    }));
  } else {
    rs = data.map((v) => ({
      orderCount: BigInt(v.orderCount),
      subTotalPrice: BigInt(v.subTotalPrice),
      wasApplied: v.wasApplied,
      date: format(v.createdAt, "yyyy-MM-dd"),
    }));
  }
  return rs;
}

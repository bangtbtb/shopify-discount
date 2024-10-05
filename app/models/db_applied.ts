import { DiscountApplied, Orders, Prisma } from "@prisma/client";
import { convertDate, DateGroup, defaultPageSize } from "./utils";
import db from "../db.server";

export type DiscountAppliedRelation = DiscountApplied & {
  OrderApplied?: Orders | null;
};

export type OrdersRelation = Orders & {
  applied?: Orders | null;
};

export async function createOrder(
  data: Omit<Prisma.OrdersCreateInput, "applied">,
  dApplieds?: Prisma.DiscountAppliedCreateInput[] | undefined,
) {
  var nVal = Number.parseFloat(data.subTotalUsd.toString());
  var resp = await db.$transaction([
    db.orders.create({
      data: {
        ...data,
        wasApplied: !!dApplieds?.length,
        applied: dApplieds
          ? {
              create: dApplieds,
            }
          : undefined,
      },
    }),
    db.billCheckpoint.upsert({
      update: {
        shop: data.shop,
        totalUsd: {
          increment: nVal,
        },
        updatedAt: new Date(),
      },
      create: {
        shop: data.shop,
        totalUsd: nVal,
        plan: "Free",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      where: {
        shop: data.shop,
      },
    }),
  ]);

  return { order: resp[0], billCheckpoint: resp[1] };
}

type RawOrdersReport = {
  orderCount: number;
  subTotal: number;
  wasApplied: boolean;
  date: Date;
};

type OrdersReportRequest = {
  groupInterval: DateGroup;
  shop: string;
  from: Date;
  to: Date;
};

export type OrdersReport = {
  orderCount: number;
  subTotal: number;
  wasApplied: boolean;
  date: string;
};

export async function getOrdersReport(req: OrdersReportRequest) {
  var data: RawOrdersReport[] = await db.$queryRaw`
  WITH tbl AS (
        SELECT "subTotal", "wasApplied",
              DATE_TRUNC(${req.groupInterval}, "createdAt") as "createdAt"
        FROM "Orders"
        WHERE "shop" = ${req.shop} AND
              "createdAt" >=  ${req.from} AND
              "createdAt" < ${req.to}
  )

  SELECT COUNT(DISTINCT("createdAt", "wasApplied") ) as "orderCount", 
  		SUM("subTotal")::numeric(24) as "subTotal", 
		 "wasApplied",
		 "createdAt" as "date" 
  FROM tbl
  GROUP BY "createdAt", "wasApplied" 
  ORDER BY "createdAt"`;

  var rs: OrdersReport[] = data.map((v) => ({
    ...v,
    date: convertDate(v.date, req.groupInterval),
  }));

  return rs;
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

type RGetAggregateApplied = {
  shop: string;
  groupInterval: DateGroup;
  discountId: string;
  from: Date; // yyyy-mm-dd
  to: Date; // yyyy-mm-dd
};

type DiscountPerformance = {
  appliedCount: number;
  discount: number;
  date: Date;
};

export async function getAggregateApplied(req: RGetAggregateApplied) {
  var data: DiscountPerformance[] = await db.$queryRaw`
  WITH tbl AS (
    SELECT "discount", "total", DATE_TRUNC(${req.groupInterval}, "createdAt") as "createdAt"
    FROM "DiscountApplied"
    WHERE
      "shop" = ${req.shop} AND
      "createdAt" >= ${req.from} AND
      "createdAt" < ${req.to} AND
      "discountId" = ${req.discountId} 
  )

  SELECT count("createdAt") as "appliedCount", 
          sum("discount") as "discount", 
          "createdAt"  as "date"
  FROM tbl
  GROUP BY "createdAt"
  ORDER BY "createdAt"`;

  var rs = data.map((v) => ({
    ...v,
    date: convertDate(v.date, req.groupInterval),
  }));
  return rs;
}

type GetDiscountAppliedsRequest = {
  shop: string;
  discountId: string;
  skip?: number;
  take?: number;
  wOrder?: boolean;
};

export type RsGetDiscountApplieds = {
  total: number;
  applies: DiscountAppliedRelation[];
};

export async function getDiscountApplieds(
  req: GetDiscountAppliedsRequest,
): Promise<RsGetDiscountApplieds> {
  const take = 20;
  var where: Prisma.DiscountAppliedWhereInput = {
    discountId: req.discountId,
    shop: req.shop,
  };

  var data = await db.$transaction([
    db.discountApplied.count({ where }),
    db.discountApplied.findMany({
      take: req.take || defaultPageSize,
      skip: req.skip,
      where: where,
      include: {
        OrderApplied: req.wOrder,
      },
    }),
  ]);

  return { total: data[0], applies: data[1] };
}

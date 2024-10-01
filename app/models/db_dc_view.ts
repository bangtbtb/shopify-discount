import db from "../db.server";
import shajs from "sha.js";
import { SeriesDateDP, SeriesDP } from "../defs/gui";
import { format } from "date-fns";
import { convertDate } from "./utils";

type DateGroup = "day" | "week" | "month" | "annual";

type RDbIncreaseView = {
  shop: string;
  discountId: string;
  createdAt?: Date;
};

export async function dbIncreaseView(req: RDbIncreaseView) {
  var ca = req.createdAt || new Date();
  var id = shajs("SHA")
    .update(`${req.discountId}-${format(ca, "yyyy-MM-dd")}`)
    .digest("base64");

  var resp = await db.discountAnalytics.upsert({
    update: {
      id: id,
      discountId: req.discountId,
      views: {
        increment: 1,
      },
    },
    create: {
      id: id,
      shop: req.shop,
      discountId: req.discountId,
      views: 1,
      addCart: 0,
      createdAt: ca,
    },

    where: {
      id: id,
      discountId: req.discountId,
    },
  });
  return resp;
}

type RDbGetDiscountView = {
  groupInterval: DateGroup;
  discountId: string;
  shop: string;
  from: Date; // yyyy-mm-dd
  to: Date; // yyyy-mm-dd
};

export async function dbGetDiscountView(req: RDbGetDiscountView) {
  var data: SeriesDateDP[] = await db.$queryRaw`
    WITH tbl AS (
          SELECT "views",
                DATE_TRUNC(${req.groupInterval}, "createdAt") as "createdAt"
          FROM "DiscountAnalytics"
          WHERE "shop" = ${req.shop} AND
                "createdAt" >=  ${req.from} AND
                "createdAt" < ${req.to} AND 
                "discountId" = ${req.discountId}
    )

    SELECT  SUM("views") as "data", 
           "createdAt" as "date"
    FROM tbl
    GROUP BY "createdAt"
    ORDER BY "createdAt"`;

  return data.map((v) => ({
    ...v,
    date: convertDate(v.date, req.groupInterval),
  }));
}

type RDbGetShopDiscountView = {
  groupInterval: DateGroup;
  shop: string;
  from: Date; // yyyy-mm-dd
  to: Date; // yyyy-mm-dd
};

export async function dbGetShopDiscountView(req: RDbGetShopDiscountView) {
  var data: SeriesDateDP[] = await db.$queryRaw`
    WITH tbl AS (
          SELECT "views",
                DATE_TRUNC(${req.groupInterval}, "createdAt") as "createdAt"
          FROM "DiscountAnalytics"
          WHERE "shop" = ${req.shop} AND
                "createdAt" >=  ${req.from} AND
                "createdAt" < ${req.to}
    )

    SELECT  SUM("views") as "data", 
           "createdAt" as "date"
    FROM tbl
    GROUP BY "createdAt"
    ORDER BY "createdAt"`;

  return data.map((v) => ({
    ...v,
    date: convertDate(v.date, req.groupInterval),
  }));
}

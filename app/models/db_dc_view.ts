import db from "../db.server";
import shajs from "sha.js";
import { SeriesDateDP, SeriesDP } from "../defs/gui";
import { format } from "date-fns";

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

  var resp = await db.discountViews.upsert({
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
          FROM "DiscountViews"
          WHERE "shop" = ${req.shop} AND
                "createdAt" >=  ${req.from} AND
                "createdAt" < ${req.to} AND 
                "discountId" = ${req.discountId}
    )

    SELECT  SUM("views") as "totalView", 
           "createdAt" 
    FROM tbl
    GROUP BY "createdAt"
    ORDER BY "createdAt"`;

  return convertDateSeries(data, req.groupInterval);
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
          FROM "DiscountViews"
          WHERE "shop" = ${req.shop} AND
                "createdAt" >=  ${req.from} AND
                "createdAt" < ${req.to}
    )

    SELECT  SUM("views") as "data", 
           "createdAt" as "date"
    FROM tbl
    GROUP BY "createdAt"
    ORDER BY "createdAt"`;

  return convertDateSeries(data, req.groupInterval);
}

export function convertDateSeries(data: SeriesDateDP[], interval: DateGroup) {
  var rs: SeriesDP[] = [];
  if (interval === "annual") {
    rs = data.map((v) => ({
      data: v.data,
      date: format(v.date, "yyyy"),
    }));
  } else if (interval === "month") {
    rs = data.map((v) => ({
      data: v.data,
      date: format(v.date, "yyyy-MM"),
    }));
  } else if (interval === "week" || interval === "day") {
    rs = data.map((v) => ({
      data: v.data,
      date: format(v.date, "yyyy-MM-dd"),
    }));
  } else {
    rs = data.map((v) => ({
      data: v.data,
      date: format(v.date, "yyyy-MM-dd"),
    }));
  }
  return rs;
}

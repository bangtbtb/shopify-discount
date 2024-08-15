import { Prisma } from "@prisma/client";
import db from "../db.server";

export async function createDiscountApplied(
  data: Prisma.DiscountAppliedUncheckedCreateInput,
) {
  return db.discountApplied.create({
    data: data,
  });
}

export function getAppliedTotal(shop: string) {}

type GetAppliedOrderRequest = {
  shop: string;
  discountId?: string;
};

export function getAppliedOrder(req: GetAppliedOrderRequest) {
  return db.discountApplied.count({
    where: {
      shop: req.shop,
      discountId: req.discountId ?? undefined,
    },
  });
}

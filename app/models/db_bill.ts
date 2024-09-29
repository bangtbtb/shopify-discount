import db from "../db.server";
import { SubscriptionBill } from "@prisma/client";

type dbGetBillCheckpointRequest = {
  shop: string;
  plan?: string;
};

export function dbGetBillCheckpoint(req: dbGetBillCheckpointRequest) {
  return db.billCheckpoint.upsert({
    update: {},
    create: {
      shop: req.shop,
      totalUsd: 0,
      plan: req.plan || "Free",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    where: {
      shop: req.shop,
    },
  });
}

type dbUpdateBillCheckpointPlanRequest = {
  shop: string;
  plan: string;
};

export function dbUpdateBillCheckpointPlan(
  req: dbUpdateBillCheckpointPlanRequest,
) {
  return db.billCheckpoint.upsert({
    update: {
      plan: req.plan,
    },
    create: {
      shop: req.shop,
      totalUsd: 0,
      plan: req.plan,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    where: {
      shop: req.shop,
    },
  });
}

type dbCreateSubscriptionRequest = {
  shop: string;
  amount: number; // Subscription Money request  (USD)
  subCheckpoint: number;
  sendSubscription: (sub: SubscriptionBill) => Promise<void>;
};

export function dbCreateSubscription(req: dbCreateSubscriptionRequest) {
  db.$transaction(async (tx) => {
    // Create subscription
    var subscription = await tx.subscriptionBill.create({
      data: {
        shop: req.shop,
        money: req.amount,
        createdAt: new Date(),
      },
    });

    // Subtract checkpoint
    var billCheckpoint = await tx.billCheckpoint.update({
      where: {
        shop: req.shop,
      },
      data: {
        totalUsd: {
          decrement: req.amount,
        },
        updatedAt: new Date(),
      },
    });

    await req.sendSubscription(subscription);

    return { subscription, billCheckpoint };
    //  END
  });
}

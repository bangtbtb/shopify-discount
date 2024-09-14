import { Message, PubSub } from "@google-cloud/pubsub";
import { Storage } from "@google-cloud/storage";
import { AttributesEvent, DiscountEvent, OrderCreateEvent } from "./defs";
import {
  deletePrismaDiscount,
  updatePrismaDiscount,
} from "./models/db_discount";

const ggProject = process.env.GOOGLE_PROJECT;
const ggSub = process.env.GOOGLE_SUB;

var init = false;

// const ggProject = process.env.GOOGLE_PROJECT || "earnest-command-226202";
// const ggSub = process.env.GOOGLE_SUB || "vd_discount-sub";

// const topicId = "vd_discount";

// export async function subscribe(topicId: string) {
//   for (const b of buckets) {
//     log(` - ${b.name}`);
//   }

//   const pubsub = new PubSub({
//     projectId: projectId,
//   });

//   pubsub.getSubscriptions({
//     topic: topicId,
//   });
// }

// console.log("Import GooglePubSub");

export async function startGooglePubsub() {
  if (init) {
    console.log("Google pubsub was init");
    return;
  }

  init = true;
  console.log(
    ` ------------Start GooglePubSub Project:${ggProject} Sub:${ggSub} init: ${init}`,
  );

  // const pubSub = new PubSub({
  //   projectId: ggProject,
  // });

  // const subscription = pubSub.subscription("vd_discount-sub");
  // subscription.on("message", handleMessage);
}

function handleMessage(msg: Message) {
  var data = JSON.parse(msg.data.toString("utf-8"));
  var attrs = msg.attributes as unknown as AttributesEvent;

  switch (attrs["X-Shopify-Topic"]) {
    case "discounts/create":
      onDiscountCreate(msg, attrs, data);
      break;
    case "discounts/update":
      onDiscountUpdate(msg, attrs, data);
      break;
    case "discounts/delete":
      onDiscountDelete(msg, attrs, data);
      break;

    case "orders/create":
      onCreateOrder(msg, attrs, data);
      break;

    default:
      break;
  }
}

async function onDiscountCreate(
  msg: Message,
  attr: AttributesEvent,
  data: DiscountEvent,
) {
  msg.ack();
  // var discount = data as DiscountEvent;
  // try {
  //   await deletePrismaDiscount(discount.admin_graphql_api_id);
  // } catch (error) {
  //   console.error("Handle event discount delete error: ", error);
  // }
}

async function onDiscountUpdate(
  msg: Message,
  attrs: AttributesEvent,
  discount: DiscountEvent,
) {
  try {
    await updatePrismaDiscount(discount.admin_graphql_api_id, {
      title: discount.title,
      status: discount.status,
    });
    msg.ack();
  } catch (error) {
    console.error("Handle event update discount error: ", error);
    msg.nack();
  }
}

async function onDiscountDelete(
  msg: Message,
  attr: AttributesEvent,
  data: DiscountEvent,
) {
  var discount = data as DiscountEvent;
  try {
    await deletePrismaDiscount(discount.admin_graphql_api_id);
  } catch (error) {
    console.error("Handle event discount delete error: ", error);
  }
}

async function onCreateOrder(
  msg: Message,
  attr: AttributesEvent,
  data: OrderCreateEvent,
) {}

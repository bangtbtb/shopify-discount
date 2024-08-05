import { PubSub } from "@google-cloud/pubsub";
import { Storage } from "@google-cloud/storage";
import { log } from "console";

const ggProject = process.env.GOOGLE_PROJECT;
const ggSub = process.env.GOOGLE_SUB;

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

export async function startGooglePubsub() {
  console.log(
    ` ------------Start GooglePubSub Project:${ggProject} Sub:${ggSub}`,
  );
}

async function onDiscountDelete() {}

async function onDiscountUpdate() {}

async function onCreateOrder() {}

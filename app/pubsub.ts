import { PubSub } from "@google-cloud/pubsub";
import { Storage } from "@google-cloud/storage";
import { log } from "console";

console.log("Start pubsub");

const projectId = "earnest-command-226202";
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

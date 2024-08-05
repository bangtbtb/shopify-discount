import { ActionFunctionArgs, json } from "@remix-run/node";
import { findPrismaDiscount } from "~/models/db_models";
import { authenticate } from "~/shopify.server";

type RequestPayload = {
  pid: string;
  cids: Array<string>;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log(`------------------- Call pick bundle discount`);
  const { admin, session } = await authenticate.public.appProxy(request);

  var payload: RequestPayload = await request.json();
  console.log("Bunble form data: ", payload);
  if (payload.pid) {
    payload.pid = "gid://shopify/Product/" + payload.pid;
  }

  if (payload.cids && payload.cids.length) {
    payload.cids = payload.cids.map((v) => "gid://shopify/Collection/" + v);
  }

  var sds = await findPrismaDiscount({
    shop: session?.shop || "",
    type: "Bundle",
    productId: payload.pid,
    collectionIds: payload.cids,
  });

  if (sds.length) {
    return json(JSON.parse(sds[0].metafield));
  }

  return json({});
};

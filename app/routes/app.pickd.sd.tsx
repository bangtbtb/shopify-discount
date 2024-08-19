import { ActionFunctionArgs, json } from "@remix-run/node";
import { dbFindShippingDiscount } from "~/models/db_discount";
import { authenticate } from "~/shopify.server";

type RequestPayload = {
  pid: string;
  cids: Array<string>;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log(`------------------- Call pick shipping discount`);
  const { admin, session } = await authenticate.public.appProxy(request);

  var payload: RequestPayload = await request.json();
  console.log("Form data: ", payload);
  if (payload.pid) {
    payload.pid = "gid://shopify/Product/" + payload.pid;
  }

  if (payload.cids && payload.cids.length) {
    payload.cids = payload.cids.map((v) => "gid://shopify/Collection/" + v);
  }

  var ds = await dbFindShippingDiscount({
    shop: session?.shop || "",
    productId: payload.pid,
    collectionIds: payload.cids,
  });

  if (ds.length) {
    var rs = { ...JSON.parse(ds[0].metafield), title: ds[0].title };
    // return json(JSON.parse(.metafield));
    return json(rs);
  }

  return json({});
};

import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { dbFindVolumeDiscount } from "~/models/db_discount";
import { authenticate } from "~/shopify.server";

type RequestPayload = {
  pid: string;
  cids: Array<string>;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log(`------------------- Call loader proxy`);
  const { admin, session } = await authenticate.public.appProxy(request);
  return json({
    content: "hello",
    shop: session?.shop,
    id: session?.id || "no_id",
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log(`------------------- Call action VD proxy`);

  const { admin, session } = await authenticate.public.appProxy(request);
  var payload: RequestPayload = await request.json();
  console.log("Form data: ", payload);
  if (payload.pid) {
    payload.pid = "gid://shopify/Product/" + payload.pid;
  }

  if (payload.cids && payload.cids.length) {
    payload.cids = payload.cids.map((v) => "gid://shopify/Collection/" + v);
  }

  var ds = await dbFindVolumeDiscount({
    shop: session?.shop || "",
    productId: payload.pid,
    collectionIds: payload.cids,
  });

  if (ds.length) {
    var rs = { ...JSON.parse(ds[0].metafield), title: ds[0].title };
    return json(rs);
  }

  console.log("Cant found any discount ");
  return json({});
};

// export const action = async ({ request }: ActionFunctionArgs) => {
//   console.log(`------------------- Call action proxy`);
//   // if (request.method.toLocaleLowerCase() == "get") {
//   //   console.log("Return empty");

//   //   return json({ abc: "def" });
//   // }
//   // var data = { ...Object.fromEntries(form) };

//   var data: RequestPayload = await request.json();
//   console.log("Form data: ", data);
//   if (data.pid) {
//     data.pid = "gid://shopify/Product/" + data.pid;
//   }
//   if (data.cids && data.cids.length) {
//     data.cids = data.cids.map((v) => "gid://shopify/Collection/" + v);
//   }

//   const { admin } = await authenticate.public.appProxy(request);
//   if (!admin) {
//     console.log("Authen invalid");
//     return json({});
//   }

//   var dcFuncs = await gqlGetFunction(admin?.graphql, {
//     apiType: "product_discounts",
//   });

//   if (!dcFuncs || !dcFuncs.length) {
//     console.log("Can't found function");
//     return json({});
//   }

//   var dc = await findVolumeDiscount(admin?.graphql, {
//     funcId: dcFuncs[0].id,
//     productId: data?.pid || "",
//     collectionIds: data?.cids || [],
//   });

//   if (dc && dc.metafields.edges.length) {
//     return json(JSON.parse(dc.metafields.edges[0].node.value));
//   }
//   console.log("Cant found any discount ");
//   return json({});
// };

import { Discount } from "@prisma/client";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { getDataLinkHrefs } from "@remix-run/react/dist/links";
import { ODConfig } from "~/defs/discount";
import { dbIncreaseView } from "~/models/db_dc_analytics";
import { dbFindBundleDiscount, getADTFromString } from "~/models/db_discount";
import { getProductHandle } from "~/models/gql_resource";
import { authenticate } from "~/shopify.server";

type RequestPayload = {
  pid: string;
  cids?: Array<string>;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  console.log(`------------------- Call pick discount by type`);
  const { admin, session } = await authenticate.public.appProxy(request);

  // console.log(`------------------- authen success`);

  var payload: RequestPayload = await request.json();

  // console.log(`------------------- Payload`, payload);

  if (!admin?.graphql) {
    return json({ message: "Unauthorized to get graphql" }, { status: 401 });
  }

  const dcType = getADTFromString(params.dcType || "");
  switch (dcType) {
    case "Bundle":
      var discount = await dbFindBundleDiscount({
        productId: payload.pid,
        collectionIds: payload.cids ?? [],
        shop: session?.shop ?? "",
        wTheme: true,
      });

      if (discount?.id) {
        dbIncreaseView({ discountId: discount?.id, shop: session.shop });
      }
      var config: ODConfig = JSON.parse(discount?.metafield ?? "{}");
      return json({
        theme: JSON.parse(discount?.Theme?.theme || "{}"),
        config: config.bundle,
        productHandles: await getProductHandle(
          admin.graphql,
          discount?.productIds || [],
        ),
        endsAt: discount?.endAt,
      });

    default:
      break;
  }

  // if (payload.pid) {
  //   payload.pid =  payload.pid;
  // }

  // if (payload.cids && payload.cids.length) {
  //   payload.cids = payload.cids.map((v) => "gid://shopify/Collection/" + v);
  // }

  // var ds = await dbFindShippingDiscount({
  //   shop: session?.shop || "",
  //   productId: payload.pid,
  //   collectionIds: payload.cids,
  // });

  // if (ds.length) {
  //   var rs = { ...JSON.parse(ds[0].metafield), title: ds[0].title };
  //   // return json(JSON.parse(.metafield));
  //   return json(rs);
  // }

  return json({});
};

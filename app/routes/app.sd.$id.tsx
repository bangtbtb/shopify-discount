import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "@shopify/polaris";
import { getShippingDiscount } from "~/models/sd_models";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const discountId = params.id ?? "";
  const { admin, session } = await authenticate.admin(request);

  var sd = await getShippingDiscount(admin.graphql, { discountId });
  console.log("Loaded bundle: ", sd.config.id);

  return json(sd);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return json({});
};

export default function ShippingDetailPage() {
  return <Page title="Shipping discount detail"></Page>;
}

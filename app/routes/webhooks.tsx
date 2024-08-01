import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("-----------------------WebhooksCalled ");
  const { topic, shop, session, admin, payload } =
    await authenticate.webhook(request);
  console.log("-----------------------Webhooks ", topic);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  // The topics handled here should be declared in the shopify.app.toml.
  // More info: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;
    case "PRODUCTS_UPDATE":
      console.log(`Topic: ${topic} Payload: `, payload);
      break;
    case "ORDERS_CREATE":
      console.log("Order created: ", payload);
      break;
    case "DISCOUNTS_CREATE":
      console.log("DISCOUNT created: ", payload);
      break;
    case "DISCOUNTS_UPDATE":
      console.log("DISCOUNT UPDATED: ", payload);
      break;
    case "DISCOUNTS_DELETE":
      console.log("DISCOUNT deleted: ", payload);
      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response("Handle success", { status: 200 });
};

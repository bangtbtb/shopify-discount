import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "@shopify/polaris";

import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await authenticate.public.appProxy(request);
    console.log("Call loader");

    return json({ abc: "def" });
  } catch (error) {
    console.log("Error: ", error);

    return json({ abc: "" });
  }
};

export const action = async () => {
  console.log("Call action");
  return json({ abc: "def" });
};

export default function ABCIndex() {
  return <Page title="ABC index"></Page>;
}

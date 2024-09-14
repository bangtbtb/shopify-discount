import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "@shopify/polaris";

export const loader = async ({}: LoaderFunctionArgs) => {
  return json({});
};

export const action = async ({}: ActionFunctionArgs) => {
  return json({});
};

export default function DiscountDetail(props: any) {
  return <Page title=""></Page>;
}

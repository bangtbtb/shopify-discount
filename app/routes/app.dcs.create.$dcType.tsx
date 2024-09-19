import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "@shopify/polaris";

import {
  CreateDiscountCard,
  FixBundleIllustration,
} from "~/components/Discounts/CreateDiscountCard";
import { DiscountCreateDesc } from "~/defs/discount";

const discountType: DiscountCreateDesc[] = [
  {
    id: "bundle_total",
    title: "Discount on total bill value",
    usecase: [],
  },
];

export const loader = async ({}: LoaderFunctionArgs) => {
  return json({});
};

export const action = async ({}: ActionFunctionArgs) => {
  return json({});
};

export default function DiscountsCreate(props: any) {
  return <Page title="Select Discount unknown"></Page>;
}

import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Page } from "@shopify/polaris";

import {
  BundleValueIllustratrion,
  CreateDiscountCard,
  FixBundleIllustration,
  ShippingBillIllustratrion,
  ShippingVolumeBreakIllustratrion,
  VolumeBreakIllustratrion,
} from "~/components/Discounts/CreateDiscountCard";
import { DiscountCreateDesc } from "~/defs/discount";

const discountTypes: DiscountCreateDesc[] = [
  {
    id: "bundle",
    title: "Bundle",
    desc: "Apply a discount when a customer's order includes all required products.",
    illustration: <FixBundleIllustration />,
  },
  {
    id: "total_order",
    title: "Total Order Discount",
    desc: "Apply a discount when a customer's order exceeds the required value.",
    illustration: <BundleValueIllustratrion />,
  },
  {
    id: "volume",
    title: "Volume/Quantity breaks",
    desc: "Apply the discount to any product exceeding the minimum required volume.",
    illustration: <VolumeBreakIllustratrion />,
  },
  {
    id: "shipping_total",
    title: "Bulk shipping discounts",
    desc: " Apply a shipping discount when a customer's order exceeds the required value",
    illustration: <ShippingBillIllustratrion />,
  },
  {
    id: "shipping_volume",
    title: "Quantity Shipping Discount",
    desc: "Apply a shipping discount  when a customer's order includes products that exceed the minimum required volume for a quantity break",
    illustration: <ShippingVolumeBreakIllustratrion />,
  },
];

export const loader = async ({}: LoaderFunctionArgs) => {
  return json({});
};

export const action = async ({}: ActionFunctionArgs) => {
  return json({});
};

export default function SelectDiscountsToCreate(props: any) {
  return (
    <Page title="Select Discount Type">
      <BlockStack gap={"400"}>
        {discountTypes.map((v, idx) => (
          <CreateDiscountCard
            key={`discount-type-${idx}`}
            title={v.title}
            desc={v.desc}
            illustration={v.illustration}
            usecases={v.usecase}
            path={`/app/dcs/create/${v.id}`}
          />
        ))}
      </BlockStack>
    </Page>
  );
}

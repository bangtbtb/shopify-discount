import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useNavigate, useNavigation } from "@remix-run/react";
import { BlockStack, Breadcrumbs, Page, Text } from "@shopify/polaris";

import {
  BundleValueIllustratrion,
  CreateDiscountCard,
  FixBundleIllustration,
  FunnelDiscountDescCard,
  ShippingBillIllustratrion,
  ShippingVolumeBreakIllustratrion,
  TickedText,
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
  const nav = useNavigate();
  return (
    <Page
      title="Select Funnel"
      backAction={{
        content: "",
        url: " /app",
      }}
    >
      <BlockStack gap={"400"}>
        <FunnelDiscountDescCard
          title="Bundle"
          example="*Example: If a customer is purchasing a laptop, you can offer a bundle that includes the laptop, a laptop bag, a mouse, and an external hard drive at a discounted price."
          onPrimary={() => nav("/app/dcs/create/bundle")}
        >
          <Text as="p" variant="bodyMd">
            Offer a group of related products at a special price to encourage
            customers to buy more.
          </Text>
          <TickedText text="Increased Revenue" />
          <TickedText text="Enhanced Shopping Experience" />
          <TickedText text="Customizable Offers" />
        </FunnelDiscountDescCard>

        <FunnelDiscountDescCard
          title="Recommendation Product"
          example="*Example: Recommend a laptop stand, external hard drive, and laptop cooling pad with a 10% discount when bought together."
          onPrimary={() => nav("/app/dcs/create/attached")}
        >
          <Text as="p" variant="bodyMd">
            Complement the main item, encouraging customers to explore and buy
            more.
          </Text>
          <TickedText text="Boost sales by highlighting relevant products" />
          <TickedText text="Offer attractive discounts when multiple items are purchased together" />
          <TickedText text="Increase customer engagement by providing personalized recommendations" />
        </FunnelDiscountDescCard>

        <FunnelDiscountDescCard
          title="Up-sell volume"
          example="*Example: Offer “Buy 3, get 10% off the fourth” or “Buy 10 or more, get 20% off” for t-shirts."
          onPrimary={() => nav("/app/dcs/create/volume")}
        >
          <Text as="p" variant="bodyMd">
            Provide discounts based on the quantity of products purchased to
            encourage bulk buying.
          </Text>
          <TickedText text="Increased Revenue" />
          <TickedText text="Inventory Management" />
          <TickedText text="Customizable Rules" />
        </FunnelDiscountDescCard>

        {/* {discountTypes.map((v, idx) => (
          <CreateDiscountCard
            key={`discount-type-${idx}`}
            title={v.title}
            desc={v.desc}
            illustration={v.illustration}
            usecases={v.usecase}
            path={`/app/dcs/create/${v.id}`}
          />
        ))} */}
      </BlockStack>
    </Page>
  );
}

import { Discount } from "@prisma/client";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page } from "@shopify/polaris";
import { useState } from "react";
import { BundleDetail } from "~/components/Discounts/Bundle";
import { BundleTotalDetail } from "~/components/Discounts/BundleTotal";
import { SDVolumeDetail } from "~/components/Discounts/SDVolume";
import { VolumeDiscountComponent } from "~/components/Discounts/Volume";
import { DiscountTypeGUI } from "~/defs/discount";
import { dbGetDiscount } from "~/models/db_discount";
import { authenticate } from "~/shopify.server";
import { DiscountAutomaticAppInput } from "~/types/admin.types";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const id = params.id;
  if (!id) {
    return json(
      { discount: null, theme: null },
      { status: 400, statusText: "Bad request" },
    );
  }
  var discount = await dbGetDiscount({
    id: id,
    shop: session.shop,
    wTheme: true,
  });

  return json({ discount, theme: discount?.Theme });
};

export const action = async ({}: ActionFunctionArgs) => {
  return json({});
};

export default function DiscountEditThemePage() {
  const { discount, theme } = useLoaderData<typeof loader>();
  const [dcType] = useState(getDiscountGUIType(discount));

  const [themeParsed, setThemeParsed] = useState(
    JSON.parse(theme?.content ?? "{}"),
  );

  const onSubmit = (
    discount: DiscountAutomaticAppInput,
    config: any,
    theme: string,
    themeContent: string,
  ): void => {};

  return (
    <Page title={`Edit Theme ${discount?.title}`}>
      {dcType === "bundle" && (
        <BundleDetail
          isCreate={false}
          disableSetting={true}
          onSubmit={onSubmit}
          discount={{
            title: discount?.title,
          }}
        />
      )}
      {dcType === "total_order" && (
        <BundleTotalDetail
          isCreate={false}
          disableSetting={true}
          onSubmit={onSubmit}
        />
      )}
      {dcType === "volume" && (
        <VolumeDiscountComponent
          isCreate={false}
          disableSetting={true}
          onSubmit={onSubmit}
        />
      )}
      {dcType === "shipping_volume" && (
        <SDVolumeDetail
          isCreate={false}
          disableSetting={true}
          onSubmit={onSubmit}
        />
      )}
      {dcType === "shipping_total" && (
        <VolumeDiscountComponent
          isCreate={false}
          disableSetting={true}
          onSubmit={onSubmit}
        />
      )}
    </Page>
  );
}

function getDiscountGUIType(
  discount?: SerializeFrom<Discount> | null,
): DiscountTypeGUI {
  if (discount) {
    switch (discount.type) {
      case "Bundle":
        return discount.subType == "bundle" ? "bundle" : "total_order";

      case "Volume":
        break;
      case "Shipping":
        break;
      case "Bundle":
        break;
    }
  }

  return "bundle";
}

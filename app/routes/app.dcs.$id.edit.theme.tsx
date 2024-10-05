import { ADT, Discount } from "@prisma/client";
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
import { RecommendedDetail } from "~/components/Discounts/Recommended";
import { SDTotalDetail } from "~/components/Discounts/SDTotal";
import { SDVolumeDetail } from "~/components/Discounts/SDVolume";
import { VolumeDiscountDetail } from "~/components/Discounts/Volume";
import { dbGetDiscount } from "~/models/db_discount";
import { gqlGetDiscount } from "~/models/gql_discount";
import { getGraphqlDiscountId } from "~/models/utils_id";
import { authenticate } from "~/shopify.server";
import { DiscountAutomaticAppInput } from "~/types/admin.types";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const id = params.id;
  if (!id) {
    return json(
      { discount: null, theme: null, dType: "None" as ADT },
      { status: 400, statusText: "Bad request" },
    );
  }
  var orgDiscount = await dbGetDiscount({
    id: id,
    shop: session.shop,
    wTheme: true,
  });

  var gDiscount = orgDiscount
    ? await gqlGetDiscount(admin.graphql, getGraphqlDiscountId(orgDiscount.id))
    : null;

  return json({
    discount: gDiscount,
    theme: orgDiscount?.Theme,
    dType: orgDiscount?.type,
  });
};

export const action = async ({}: ActionFunctionArgs) => {
  return json({});
};

export default function DiscountEditThemePage() {
  const { discount, theme, dType } = useLoaderData<typeof loader>();
  const [dcType] = useState<ADT>(dType || "None");

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
      {dcType === "Bundle" && (
        <BundleDetail
          isCreate={false}
          disableSetting={true}
          onSubmit={onSubmit}
          discount={{
            title: discount?.title,
          }}
          gui={{
            content: theme?.content ? JSON.parse(theme.content) : undefined,
            theme: theme?.theme ? JSON.parse(theme.theme) : undefined,
            setting: theme?.setting ? JSON.parse(theme.setting) : undefined,
          }}
        />
      )}
      {dcType === "Total" && (
        <BundleTotalDetail
          isCreate={false}
          disableSetting={true}
          onSubmit={onSubmit}
        />
      )}
      {dcType === "Recommend" && (
        <RecommendedDetail isCreate={true} onSubmit={onSubmit} />
      )}

      {dcType === "Volume" && (
        <VolumeDiscountDetail
          isCreate={false}
          disableSetting={true}
          onSubmit={onSubmit}
        />
      )}

      {dcType === "ShippingVolume" && (
        <SDVolumeDetail
          isCreate={false}
          disableSetting={true}
          onSubmit={onSubmit}
        />
      )}
      {dcType === "ShippingTotal" && (
        <SDTotalDetail
          isCreate={false}
          disableSetting={true}
          onSubmit={onSubmit}
        />
      )}
    </Page>
  );
}

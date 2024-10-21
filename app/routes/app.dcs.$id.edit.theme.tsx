import { ADT, Discount } from "@prisma/client";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { Page } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { BundleDetail } from "~/components/Discounts/Bundle";
import { BundleTotalDetail } from "~/components/Discounts/BundleTotal";
import { RecommendedDetail } from "~/components/Discounts/Recommended";
import { SDTotalDetail } from "~/components/Discounts/SDTotal";
import { SDVolumeDetail } from "~/components/Discounts/SDVolume";
import { VolumeDiscountDetail } from "~/components/Discounts/Volume";
import { ActionStatus, ActionType } from "~/defs";
import { dbGetDiscount, dbUpdateTheme } from "~/models/db_discount";
import { gqlGetDiscount } from "~/models/gql_discount";
import { getGraphqlDiscountId } from "~/models/utils_id";
import { authenticate } from "~/shopify.server";
import { DiscountAutomaticAppInput, Metafield } from "~/types/admin.types";

type SimpleMetaField = Pick<Metafield, "id" | "value">;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const id = params.id;
  if (!id) {
    return json(
      {
        dcType: "none" as ADT,
        origin: null,
        theme: null,
        combinesWith: null,
        errors: { message: "Discount type is not support" },
      },
      { status: 400, statusText: "Bad request" },
    );
  }
  var orgDiscount = await dbGetDiscount({
    id: id,
    shop: session.shop,
    wTheme: true,
  });

  console.log("id: ", getGraphqlDiscountId(orgDiscount?.id || ""));

  var gDiscount = orgDiscount
    ? await gqlGetDiscount(admin.graphql, orgDiscount.id)
    : null;

  return json({
    dcType: orgDiscount?.type || "None",
    combines: gDiscount?.discount.combinesWith,
    origin: orgDiscount ? { ...orgDiscount, Theme: undefined } : null,
    combinesWith: gDiscount?.discount.combinesWith,
    theme: orgDiscount?.Theme,
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const discountId = params.id;

  const themeContent = formData.get("content")?.toString() || "";
  const theme = formData.get("theme")?.toString() || "";

  var status: ActionStatus = "failed";
  if (discountId) {
    try {
      await dbUpdateTheme({
        discountId: discountId,
        shop: session.shop,
        theme: {
          content: themeContent,
          theme: theme,
        },
      });
      status = "success";
    } catch (error) {
      status = "failed";
    }
  }

  return json({ status });
};

export default function DiscountEditThemePage() {
  const submitForm = useSubmit();
  const { origin, theme, dcType } = useLoaderData<typeof loader>();

  const [themeParsed, setThemeParsed] = useState<any | null>(
    theme?.theme ? JSON.parse(theme.theme) : undefined,
  );
  const [contentParsed, setContentParsed] = useState(
    theme?.content ? JSON.parse(theme.content) : undefined,
  );

  const [configParsed, setConfigParsed] = useState(
    origin?.metafield ? JSON.parse(origin.metafield) : undefined,
  );

  const actData = useActionData<typeof action>();

  useEffect(() => {
    if (!actData || !actData.status) {
      return;
    }

    if (actData.status === "success") {
      window.shopify.toast.show("Create discount success", {
        duration: 5000,
      });
    }

    if (actData.status === "failed") {
      window.shopify.toast.show("Create discount failed", {
        duration: 5000,
        isError: true,
      });
    }
  }, [actData]);

  const onSubmit = (
    discount: DiscountAutomaticAppInput,
    config: any,
    theme: string,
    themeContent: string,
  ): void => {
    submitForm(
      {
        content: themeContent,
        theme: theme,
      },
      { method: "post" },
    );
  };

  return (
    <Page title={`Edit Theme ${origin?.title}`}>
      {dcType === "Bundle" && (
        <BundleDetail
          isCreate={false}
          disableSetting={true}
          onSubmit={onSubmit}
          discount={origin}
          gui={{
            content: contentParsed,
            theme: themeParsed,
            setting: theme?.setting ? JSON.parse(theme.setting) : undefined,
          }}
          config={configParsed}
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

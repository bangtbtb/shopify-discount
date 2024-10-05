import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { Page } from "@shopify/polaris";
import { useEffect, useMemo, useState } from "react";
import { BundleDetail } from "~/components/Discounts/Bundle";
import { BundleTotalDetail } from "~/components/Discounts/BundleTotal";
import { SDVolumeDetail } from "~/components/Discounts/SDVolume";
import { VolumeDiscountDetail } from "~/components/Discounts/Volume";
import { ActionStatus, ActionType } from "~/defs";
import { ODConfig, SDConfig, PDConfig } from "~/defs/discount";
import { createBundleDiscount } from "~/models/od_models";
import { JSONParse, randomDigit } from "~/models/utils";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import { authenticate } from "~/shopify.server";
import {
  GQLDiscountError,
  GQLDiscountResponse,
  gqlGetDiscount,
} from "~/models/gql_discount";
import { createVolumeDiscount } from "~/models/vd_model";
import { createShippingDiscount } from "~/models/sd_models";
import { RecommendedDetail } from "~/components/Discounts/Recommended";
import { dbGetDiscount } from "~/models/db_discount";
import { getGraphqlDiscountId } from "~/models/utils_id";
import { ADT } from "@prisma/client";
import { SDTotalDetail } from "~/components/Discounts/SDTotal";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  const url = new URL(request.url);
  const cloneId = url.searchParams.get("cloneId");
  console.log("Clone id: ", cloneId);

  var orgDiscount = cloneId
    ? await dbGetDiscount({
        id: cloneId,
        shop: session.shop,
        wTheme: true,
      })
    : null;
  var gDiscount = orgDiscount
    ? await gqlGetDiscount(admin.graphql, getGraphqlDiscountId(orgDiscount.id))
    : null;

  const dcType = params.dcType as ADT | undefined;
  if (!dcType) {
    return json({
      dcType: "none" as ADT,
      origin: null,
      theme: null,
      errors: { message: "Discount type is not support" },
    });
  }

  return json({
    dcType: dcType as ADT,
    combines: gDiscount?.discount.combinesWith,
    origin: gDiscount ? gDiscount.discount : null,
    theme: orgDiscount?.Theme,
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const dcType = params.dcType as ADT | undefined;
  const formData = await request.formData();
  const discount: DiscountAutomaticAppInput = JSON.parse(
    formData.get("discount")?.toString() || "{}",
  );
  const configStr = formData.get("config")?.toString();
  const theme = formData.get("theme")?.toString() || "";
  const themeContent = formData.get("themeContent")?.toString() ?? "";

  var baseReq = {
    discount,
    shop: session.shop,
    content: themeContent,
    theme: theme,
    setting: "",
  };

  // var config: ODConfig | SDConfig | PDConfig | null = null;
  var rsDiscount: GQLDiscountResponse | undefined = undefined;
  var errors: GQLDiscountError | undefined = undefined;

  switch (dcType) {
    // Bundle discount
    case "Bundle":
    case "Total":
      var configBundle: ODConfig = {
        ...JSON.parse(configStr || "{}"),
        label: `BUNDLE_${randomDigit()}`,
      };

      var rs = await createBundleDiscount(admin.graphql, {
        ...baseReq,
        config: configBundle,
      });
      rsDiscount = rs?.automaticAppDiscount;
      errors = rs?.userErrors;
      break;
    // Volume discount
    case "Volume":
    case "Recommend":
      var configVD: PDConfig = {
        ...JSON.parse(configStr || "{}"),
        label: `VOLUME_${randomDigit()}`,
      };
      var rs = await createVolumeDiscount(admin.graphql, {
        ...baseReq,
        config: configVD,
      });

      rsDiscount = rs?.automaticAppDiscount;
      errors = rs?.userErrors;
      break;
    case "ShippingTotal":
    case "ShippingVolume":
      var configSD: SDConfig = {
        ...JSON.parse(formData.get("config")?.toString() || "{}"),
        label: `SHIPPING_${randomDigit()}`,
      };
      var rs = await createShippingDiscount(admin.graphql, {
        ...baseReq,
        config: configSD,
      });

      rsDiscount = rs?.automaticAppDiscount;
      errors = rs?.userErrors;
      break;
    default:
      break;
  }

  var status: ActionStatus = errors?.length ? "failed" : "success";

  return json({ status, errors });
};

export default function DiscountsCreatePage(props: any) {
  const submitForm = useSubmit();
  const navigation = useNavigation();

  const { dcType, origin, theme } = useLoaderData<typeof loader>();
  const actData = useActionData<ActionType>();
  const [discountName] = useState(dcType.toUpperCase().replaceAll("_", " "));

  useEffect(() => {
    if (!actData || !actData.status) {
      return;
    }

    if (actData.status === "success") {
      window.shopify.toast.show("Create discount success", { duration: 5000 });
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
        discount: JSON.stringify(discount),
        config: JSON.stringify(config),
        theme: theme,
        themeContent: themeContent,
      },
      { method: "POST" },
    );
    // return { status: "success" };
  };

  return (
    <Page title={`Create Discount ${dcType}`}>
      {dcType === "Bundle" && (
        <BundleDetail
          isCreate={true}
          onSubmit={onSubmit}
          discount={origin}
          gui={{
            content: theme?.content ? JSON.parse(theme.content) : undefined,
            theme: theme?.theme ? JSON.parse(theme.theme) : undefined,
            setting: theme?.setting ? JSON.parse(theme.setting) : undefined,
          }}
        />
      )}

      {dcType === "Total" && (
        <BundleTotalDetail
          isCreate={true}
          discount={origin}
          onSubmit={onSubmit}
        />
      )}

      {dcType === "Recommend" && (
        <RecommendedDetail
          isCreate={true}
          discount={origin}
          onSubmit={onSubmit}
        />
      )}

      {dcType === "Volume" && (
        <VolumeDiscountDetail
          isCreate={true}
          discount={origin}
          onSubmit={onSubmit}
        />
      )}

      {dcType === "ShippingVolume" && (
        <SDVolumeDetail isCreate={true} discount={origin} onSubmit={onSubmit} />
      )}

      {dcType === "ShippingTotal" && (
        <SDTotalDetail isCreate={true} discount={origin} onSubmit={onSubmit} />
      )}
    </Page>
  );
}

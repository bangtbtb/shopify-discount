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
import { VolumeDiscountComponent } from "~/components/Discounts/Volume";
import { ActionStatus, ActionType } from "~/defs";
import { ODConfig, SDConfig, PDConfig } from "~/defs/discount";
import { DiscountTypeGUI } from "~/defs/discount";
import { createBundleDiscount } from "~/models/od_models";
import { randomDigit } from "~/models/utils";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import { authenticate } from "~/shopify.server";
import { GQLDiscountError, GQLDiscountResponse } from "~/models/gql_discount";
import { createVolumeDiscount } from "~/models/vd_model";
import { createShippingDiscount } from "~/models/sd_models";
import { AttachedProductDetail } from "~/components/Discounts/AttachedProduct";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const cloneId = url.searchParams;
  console.log("Clone id: ", cloneId);

  const dcType = params.dcType as DiscountTypeGUI | undefined;
  if (!dcType) {
    return json({
      dcType: "none" as DiscountTypeGUI,
      errors: { message: "Discount type is not support" },
    });
  }

  return json({ dcType: dcType as DiscountTypeGUI });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const dcType = params.dcType as DiscountTypeGUI | undefined;
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
    case "bundle":
    case "total_order":
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
    case "volume":
    case "attached":
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
    case "shipping_total":
    case "shipping_volume":
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

  const { dcType } = useLoaderData<typeof loader>();
  const actData = useActionData<ActionType>();
  const [discountName] = useState(dcType.toUpperCase().replaceAll("_", " "));

  const todaysDate = useMemo(() => new Date().toString(), []);
  const isLoading = navigation.state == "submitting";

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
    <Page title={`Create Discount ${discountName}`}>
      {dcType === "attached" && (
        <AttachedProductDetail isCreate={true} onSubmit={onSubmit} />
      )}

      {dcType === "bundle" && (
        <BundleDetail isCreate={true} onSubmit={onSubmit} />
      )}

      {dcType === "total_order" && (
        <BundleTotalDetail isCreate={true} onSubmit={onSubmit} />
      )}

      {dcType === "volume" && (
        <VolumeDiscountComponent isCreate={true} onSubmit={onSubmit} />
      )}

      {dcType === "shipping_volume" && (
        <SDVolumeDetail isCreate={true} onSubmit={onSubmit} />
      )}
      {dcType === "shipping_total" && (
        <VolumeDiscountComponent isCreate={true} onSubmit={onSubmit} />
      )}
    </Page>
  );
}

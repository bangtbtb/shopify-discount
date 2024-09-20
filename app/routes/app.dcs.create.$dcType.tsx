import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { Page } from "@shopify/polaris";
import { useEffect, useMemo } from "react";
import { BundleDetail } from "~/components/Discounts/BundleDiscount";
import { ActionType, ODConfig, SDConfig, VDConfig } from "~/defs";
import { DiscountTypeGUI } from "~/defs/discount";
import { DiscountAutomaticAppInput } from "~/types/admin.types";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const dcType: string | undefined = params.dcType;
  if (!dcType) {
    return json({
      dcType: "none" as DiscountTypeGUI,
      errors: { message: "Discount type is not support" },
    });
  }

  return json({ dcType: dcType as DiscountTypeGUI });
};

export const action = async ({}: ActionFunctionArgs) => {
  return json({});
};

export default function DiscountsCreate(props: any) {
  const submitForm = useSubmit();
  const navigation = useNavigation();

  const { dcType } = useLoaderData<typeof loader>();
  const actData = useActionData<ActionType>();

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
    config: ODConfig | SDConfig | VDConfig,
  ) => {
    submitForm(
      {
        discount: JSON.stringify(discount),
        config: JSON.stringify(config),
      },
      { method: "POST" },
    );
    return { status: "success" };
  };

  return (
    <Page title="Select Discount unknown">
      <BundleDetail></BundleDetail>
    </Page>
  );
}

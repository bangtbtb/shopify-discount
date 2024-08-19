import { ActionFunctionArgs, json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import {
  ActiveDatesCard,
  CombinableDiscountTypes,
  CombinationCard,
  DateTime,
  DiscountClass,
} from "@shopify/discount-app-components";
import {
  BlockStack,
  Box,
  Card,
  Layout,
  Page,
  PageActions,
  TextField,
} from "@shopify/polaris";
import { useField, useForm } from "@shopify/react-form";
import { useEffect, useMemo } from "react";
import { StepData } from "~/components/ConfigStep";
import ODConfigCard from "~/components/ODConfigCard";
import { ProductInfo } from "~/components/SelectProduct";
import { ActionStatus, DVT, ODApplyType, ODConfig } from "~/defs";
import { createBundleDiscount } from "~/models/od_models";
import { randomNumber } from "~/models/utils";
import { authenticate } from "~/shopify.server";
import {
  DiscountAutomaticAppInput,
  DiscountUserError,
} from "~/types/admin.types";

type ActionType = {
  status: ActionStatus;
  errors: DiscountUserError[] | undefined;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();

  const discount: DiscountAutomaticAppInput = JSON.parse(
    formData.get("discount")?.toString() || "{}",
  );

  const config: ODConfig = {
    ...JSON.parse(formData.get("config")?.toString() || "{}"),
    label: `BUNDLE_${randomNumber()}`,
  };

  var resp = await createBundleDiscount(admin.graphql, {
    discount,
    config,
    shop: session.shop,
  });

  var errors = resp?.userErrors;
  var status: ActionStatus = "success";
  if (errors?.length) {
    console.log("Create discount error: ", errors);
    status = "failed";
  } else {
    errors = undefined;
  }

  return json({ status, errors });
};

export default function NewODPage() {
  const submitForm = useSubmit();

  const navigation = useNavigation();

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

  const {
    fields: { title, combinesWith, startDate, endDate, config },
    submit,
  } = useForm({
    fields: {
      title: useField(""),
      combinesWith: useField<CombinableDiscountTypes>({
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: true,
      }),
      startDate: useField<DateTime>(todaysDate),
      endDate: useField<DateTime | null>(null),
      config: {
        label: useField(""),
        type: useField<ODApplyType>("contain"),
        totalSteps: useField<Array<StepData>>([
          { type: "percent", value: "5", require: "2" },
          { type: "percent", value: "15", require: "3" },
          { type: "percent", value: "15", require: "4" },
        ]),
        allOrder: useField(true),
        containProduct: useField<Array<ProductInfo>>([]),
        containValue: useField({
          type: "percent",
          value: "10",
        }),
      },
    },
    onSubmit: async (form) => {
      var discount: DiscountAutomaticAppInput = {
        title: form.title,
        combinesWith: form.combinesWith,
        startsAt: form.startDate,
        endsAt: form.endDate,
      };

      var formConfig: ODConfig = {
        label: form.config.label,
        applyType: form.config.type,
        contain:
          form.config.type === "contain"
            ? {
                productIds: form.config.containProduct.map((v) => v.id),
                value: {
                  type: form.config.containValue.type as DVT,
                  value: Number.parseFloat(form.config.containValue.value),
                },
                allOrder: form.config.allOrder,
              }
            : undefined,
        total:
          form.config.type === "total"
            ? {
                steps: form.config.totalSteps.map((v) => ({
                  require: Number.parseFloat(v.require),
                  value: {
                    type: v.type,
                    value: Number.parseFloat(v.value),
                  },
                })),
              }
            : undefined,
      };
      console.log("Config: ", formConfig);

      submitForm(
        {
          discount: JSON.stringify(discount),
          config: JSON.stringify(formConfig),
        },
        { method: "POST" },
      );
      return { status: "success" };
    },
  });

  return (
    <Page title="Bundle discount detail">
      <Layout>
        {/* Information */}
        <Layout.Section>
          <BlockStack align="space-around" gap={"200"}>
            <Card>
              <Box paddingBlockEnd={"500"}>
                <TextField
                  label={"Title"}
                  autoComplete="off"
                  {...title}
                  helpText="This text will show in dashboard of admin"
                />
              </Box>
            </Card>

            <ODConfigCard
              odType={config.type}
              products={config.containProduct}
              steps={config.totalSteps}
            />

            <CombinationCard
              combinableDiscountTypes={combinesWith}
              discountClass={DiscountClass.Product}
              discountDescriptor="Discount"
            />

            <ActiveDatesCard
              startDate={startDate}
              endDate={endDate}
              timezoneAbbreviation="EST"
            />
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <PageActions
            primaryAction={{
              content: "Create",
              onAction: submit,
              loading: isLoading,
            }}
            secondaryActions={[
              {
                content: "Discard",
                onAction: () => {
                  console.log("Call discard");
                },
              },
            ]}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

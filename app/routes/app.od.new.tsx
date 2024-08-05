import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useNavigation, useSubmit } from "@remix-run/react";
import {
  ActiveDatesCard,
  CombinableDiscountTypes,
  CombinationCard,
  DateTime,
  DiscountClass,
  DiscountStatus,
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
import { useMemo } from "react";
import { StepData } from "~/components/ConfigStep";
import ODConfigCard from "~/components/ODConfigCard";
import { ProductInfo } from "~/components/SelectProduct";
import { ActionStatus, DVT, ODApplyType, ODConfig } from "~/defs";
import { createPrismaDiscount } from "~/models/db_models";
import { gqlGetFunction } from "~/models/gql_func";
import { createBundleDiscount } from "~/models/od_models";
import { authenticate } from "~/shopify.server";
import { DiscountAutomaticAppInput } from "~/types/admin.types";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();

  var odFunc = await gqlGetFunction(admin.graphql, {
    apiType: "order_discounts",
  });

  if (!odFunc?.length) {
    console.log("Discount function is empty");

    return json({
      status: "failed",
      errors: { message: "Bundle discount function not found" },
    });
  }

  const discount: DiscountAutomaticAppInput = JSON.parse(
    formData.get("discount")?.toString() || "{}",
  );

  discount.startsAt = new Date(discount.startsAt);
  if (discount.endsAt) {
    discount.endsAt = new Date(discount.endsAt);
  }
  discount.functionId = odFunc[0].id;

  const config: ODConfig = JSON.parse(
    formData.get("config")?.toString() || "{}",
  );

  var resp = await createBundleDiscount(admin.graphql, {
    discount,
    config,
  });

  const errors = resp?.discountAutomaticAppCreate?.userErrors;
  var status: ActionStatus = "success";
  if (resp?.discountAutomaticAppCreate?.automaticAppDiscount) {
    await createPrismaDiscount({
      id: resp.discountAutomaticAppCreate.automaticAppDiscount.discountId,
      shop: session.shop,
      metafield: JSON.stringify(config),
      status: DiscountStatus.Active,
      title: discount.title || "",
      type: "Bundle",
      subType: config.applyType,
      startAt: new Date(discount.startsAt),
      endAt: discount.endsAt ? new Date(discount.endsAt) : null,
      createdAt: new Date(),
      productIds: config.contain?.productIds ? config.contain?.productIds : [],
      collectionIds: [],
    });
  }
  if (errors?.length) {
    console.log("Create discount error: ", errors);
    status = "failed";
  }

  return json({});
};

export default function NewODPage() {
  const submitForm = useSubmit();

  const navigation = useNavigation();

  const todaysDate = useMemo(() => new Date().toString(), []);
  const isLoading = navigation.state == "submitting";

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
              }
            : undefined,
        total:
          form.config.type === "total"
            ? {
                steps: form.config.totalSteps.map((v) => ({
                  total: Number.parseFloat(v.require),
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

              <Box>
                <TextField
                  label={"Label"}
                  autoComplete="off"
                  {...config.label}
                  helpText="This text will show in checkout ui of customer"
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

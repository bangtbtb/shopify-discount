import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import {
  ActiveDatesCard,
  CombinableDiscountTypes,
  CombinationCard,
  DateTime,
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
import { useEffect, useMemo } from "react";
import { StepData } from "~/components/ConfigStep";
import { SDConfigCard } from "~/components/SDConfigCard";
import { CollectionInfo } from "~/components/SelectCollection";
import { ProductInfo } from "~/components/SelectProduct";
import { ActionStatus, SDApplyType, SDConfig } from "~/defs";
import { createPrismaDiscount } from "~/models/db_models";
import { gqlGetFunction } from "~/models/gql_func";
import { createShippingDiscount } from "~/models/sd_models";
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

  var sdFunc = await gqlGetFunction(admin.graphql, {
    apiType: "shipping_discounts",
  });

  if (!sdFunc?.length) {
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
  discount.functionId = sdFunc[0].id;

  const config: SDConfig = JSON.parse(
    formData.get("config")?.toString() || "{}",
  );

  var resp = await createShippingDiscount(admin.graphql, {
    discount,
    config,
  });

  var errors = resp?.discountAutomaticAppCreate?.userErrors;
  var rsDiscount = resp?.discountAutomaticAppCreate?.automaticAppDiscount;
  var status: ActionStatus = "success";
  if (errors?.length) {
    console.log("Create shipping discount error: ", errors);
    status = "failed";
  } else {
    if (rsDiscount) {
      await createPrismaDiscount({
        id: rsDiscount.discountId,
        shop: session.shop,
        metafield: JSON.stringify(config),
        status: DiscountStatus.Active,
        title: discount.title || "",
        type: "Shipping",
        subType: config.applyType,
        startAt: new Date(discount.startsAt),
        endAt: discount.endsAt ? new Date(discount.endsAt) : null,
        createdAt: new Date(),
        productIds: config.productIds ? config.productIds : [],
        collectionIds: config.collIds ? config.collIds : [],
      });
    }

    errors = undefined;
  }

  return json({ status, errors });
};

export default function NewSDPage() {
  const submitForm = useSubmit();

  const navigation = useNavigation();
  const actData = useActionData<ActionType>();

  const todaysDate = useMemo(() => new Date().toString(), []);
  const isLoading = navigation.state == "submitting";

  const {
    fields: { title, combinesWith, startDate, endDate, config },
    submit,
  } = useForm({
    fields: {
      title: useField(""),
      combinesWith: useField<CombinableDiscountTypes>({
        orderDiscounts: true,
        productDiscounts: true,
        shippingDiscounts: false,
      }),
      startDate: useField<DateTime>(todaysDate),
      endDate: useField<DateTime | null>(null),
      config: {
        label: useField(""),
        applyType: useField<SDApplyType>("total"),
        steps: useField<Array<StepData>>([
          { type: "percent", value: "5", require: "2" },
          { type: "percent", value: "15", require: "3" },
          { type: "percent", value: "15", require: "4" },
        ]),
        products: useField<Array<ProductInfo>>([]),
        colls: useField<Array<CollectionInfo>>([]),
      },
    },
    onSubmit: async (form) => {
      var discount: DiscountAutomaticAppInput = {
        title: form.title,
        combinesWith: form.combinesWith,
        startsAt: form.startDate,
        endsAt: form.endDate,
      };

      var formConfig: SDConfig = {
        label: form.config.label,
        applyType: form.config.applyType,
        steps: form.config.steps.map((v) => ({
          require: Number.parseFloat(v.require),
          value: {
            type: v.type,
            value: Number.parseFloat(v.value),
          },
        })),
        collIds: form.config.colls.map((v) => v.id),
        productIds: form.config.products.map((v) => v.id),
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

  useEffect(() => {
    if (!actData || !actData.status) {
      return;
    }
    if (actData.status === "success") {
      window.shopify.toast.show("Update discount success", { duration: 5000 });
    }

    if (actData.status === "failed") {
      window.shopify.toast.show("Update discount failed", {
        duration: 5000,
        isError: true,
      });
    }
  }, [actData]);

  return (
    <Page title="Create shipping discount">
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

            <SDConfigCard
              sdType={config.applyType}
              steps={config.steps}
              products={config.products}
              colls={config.colls}
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

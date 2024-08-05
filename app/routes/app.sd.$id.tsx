import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
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
import { SDApplyType, SDConfig } from "~/defs";
import { createPrismaDiscount, updatePrismaDiscount } from "~/models/db_models";
import {
  getShippingDiscount,
  SDConfigExt,
  updateShippingDiscount,
} from "~/models/sd_models";
import { authenticate } from "~/shopify.server";
import {
  DiscountAutomaticAppInput,
  DiscountUserError,
} from "~/types/admin.types";

type ActionType = {
  status: string;
  errors: DiscountUserError[] | undefined;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const discountId = params.id ?? "";
  const { admin, session } = await authenticate.admin(request);

  var sd = await getShippingDiscount(admin.graphql, { discountId });

  // console.log("Loaded bundle config: ", sd.config);

  return json(sd);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { id } = params ?? "";
  const { admin } = await authenticate.admin(request);
  if (!id) {
    return json({ message: "Missing discount id" });
  }

  const formData = await request.formData();

  var discount: DiscountAutomaticAppInput = JSON.parse(
    formData.get("discount")?.toString() || "{}",
  );

  var formConfig: SDConfigExt = JSON.parse(
    formData.get("config")?.toString() || "{}",
  );
  console.log("Update with sd config: ", JSON.stringify(formConfig));

  var resp = await updateShippingDiscount(admin.graphql, {
    discountId: id ?? "",
    data: discount,
    config: formConfig,
  });
  var errors = resp?.discountAutomaticAppUpdate?.userErrors;
  const rsDiscount = resp?.discountAutomaticAppUpdate?.automaticAppDiscount;

  var status = "success";
  if (errors && errors.length) {
    console.log("Error: ", errors);
    status = "failed";
  } else {
    if (rsDiscount) {
      console.log("Discount response: ", rsDiscount);
      await updatePrismaDiscount(rsDiscount.discountId, {
        title: rsDiscount.title,
        status: rsDiscount.status,
        subType: formConfig.applyType,
        metafield: JSON.stringify(formConfig),
        collectionIds: formConfig.collIds ? formConfig.collIds : [],
        productIds: formConfig.productIds ? formConfig.productIds : [],
        startAt: new Date(rsDiscount.startsAt),
        endAt: rsDiscount.endsAt ? new Date(rsDiscount.endsAt) : null,
      });
    }
    errors = undefined;
  }

  return json({ status, errors });
};

export default function ShippingDetailPage() {
  const submitForm = useSubmit();

  const navigation = useNavigation();
  const ldata = useLoaderData<typeof loader>();
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
      console.log("Submit form config: ", formConfig);

      submitForm(
        {
          discount: JSON.stringify(discount),
          config: JSON.stringify({ id: ldata.config.id, ...formConfig }),
        },
        { method: "POST" },
      );
      return { status: "success" };
    },
  });

  useEffect(() => {
    // console.log("Update loader data 1");
    const discount = ldata.discount;
    const srcConfig = ldata.config;
    console.log("Loader data: ", ldata);

    if (!discount || !srcConfig) {
      return;
    }
    // console.log("Update loader data 2");

    title.onChange(discount.title);
    combinesWith.onChange(discount.combinesWith);
    startDate.onChange(discount.startsAt);
    discount.endsAt && endDate.onChange(discount.endsAt);

    config.label.onChange(srcConfig.label ?? "");
    config.applyType.onChange(srcConfig.applyType ?? "total");
    srcConfig.steps &&
      config.steps.onChange(
        srcConfig.steps.map((v) => ({
          require: v.require.toString(),
          type: v.value.type,
          value: v.value.value.toString(),
        })),
      );
    config.products.onChange(srcConfig.products || []);
    config.colls.onChange(srcConfig.collections || []);
  }, [ldata]);

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
    <Page title="Shipping discount detail">
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
              timezoneAbbreviation="CXT"
            />
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <PageActions
            primaryAction={{
              content: "Update",
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

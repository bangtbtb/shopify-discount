import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import {
  ActiveDatesCard,
  CombinableDiscountTypes,
  DateTime,
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
import { DVT, ODApplyType, ODConfig } from "~/defs";
import { updatePrismaDiscount } from "~/models/db_models";
import {
  getBundleDiscount,
  ODConfigExt,
  updateBundleDiscount,
} from "~/models/od_models";
import { authenticate } from "~/shopify.server";
import { DiscountAutomaticAppInput } from "~/types/admin.types";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const discountId = params.id ?? "";
  const { admin, session } = await authenticate.admin(request);

  var od = await getBundleDiscount(admin.graphql, { discountId });
  console.log("Loaded bundle: ", od.config.id);

  return json(od);
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

  var config: ODConfigExt = JSON.parse(
    formData.get("config")?.toString() || "{}",
  );

  console.log("Update with od config: ", config);

  var resp = await updateBundleDiscount(admin.graphql, {
    discountId: id ?? "",
    data: discount,
    config: config,
  });

  const errors = resp?.discountAutomaticAppUpdate?.userErrors;
  const rsDiscount = resp?.discountAutomaticAppUpdate?.automaticAppDiscount;
  if (!errors && rsDiscount) {
    await updatePrismaDiscount(id, {
      id: rsDiscount.discountId,
      title: rsDiscount.title,
      status: rsDiscount.status,
      metafield: JSON.stringify(config),
      collectionIds: [],
      productIds: config.contain?.productIds ? config.contain.productIds : [],
      startAt: new Date(rsDiscount.startsAt),
      endAt: rsDiscount.endsAt ? new Date(rsDiscount.endsAt) : null,
    });
  }
  console.log("Error: ", resp);

  return json({ errors });
};

export default function BundleDetailPage() {
  const submitForm = useSubmit();
  const ldata = useLoaderData<typeof loader>();
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
        type: form.config.type,
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
    if (!discount || !srcConfig) {
      return;
    }
    // console.log("Update loader data 2");

    title.onChange(discount.title);
    combinesWith.onChange(discount.combinesWith);
    startDate.onChange(discount.startsAt);
    discount.endsAt && endDate.onChange(discount.endsAt);

    config.label.onChange(srcConfig.label ?? "");
    config.type.onChange(srcConfig.type ?? "total");
    srcConfig.total?.steps &&
      config.totalSteps.onChange(
        srcConfig.total?.steps.map((v) => ({
          require: v.total.toString(),
          type: v.value.type,
          value: v.value.value.toString(),
        })),
      );
    config.containProduct.onChange(srcConfig.products || []);
  }, [ldata]);

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

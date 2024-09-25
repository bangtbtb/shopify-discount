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
import { DiscountProvider } from "~/components/providers/DiscountProvider";
import ODConfigCard from "~/components/Discounts/ODConfigCard";
import { StepData } from "~/components/Discounts/ConfigStep";
import { ProductInfo } from "~/components/Shopify/SelectProduct";
import { ActionStatus, DVT, ODApplyType, ODConfig } from "~/defs";
import {
  getBundleDiscount,
  ODConfigExt,
  updateBundleDiscount,
} from "~/models/od_models";
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
  const { admin } = await authenticate.admin(request);

  console.log("Discount id: ", discountId);

  var od = await getBundleDiscount(admin.graphql, { discountId });
  // console.log("Loaded bundle: ", od.config.id);

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
    discount: discount,
    config: config,
  });

  var errors = resp?.userErrors;
  var status: ActionStatus = "success";

  if (errors?.length) {
    console.log("Update bundle discount error: ", errors);
    status = "failed";
  } else {
    errors = undefined;
  }

  return json({ status, errors });
};

export default function BundleDetailPage() {
  const submitForm = useSubmit();
  const ldata = useLoaderData<typeof loader>();
  const actData = useActionData<ActionType>();
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
        applyType: useField<ODApplyType>("contain"),
        totalSteps: useField<Array<StepData>>([
          { type: "percent", value: 5, require: 2 },
          { type: "percent", value: 10, require: 3 },
          { type: "percent", value: 15, require: 4 },
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
        applyType: form.config.applyType,
        contain:
          form.config.applyType === "contain"
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
          form.config.applyType === "total"
            ? {
                steps: form.config.totalSteps.map((v) => ({
                  require: v.require,
                  value: {
                    type: v.type,
                    value: v.value,
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
    console.log("On loader data: ", ldata);
    const discount = ldata.discount;
    const srcConfig = ldata.config;
    if (!discount || !srcConfig) {
      return;
    }

    title.onChange(discount.title);
    combinesWith.onChange(discount.combinesWith);
    startDate.onChange(discount.startsAt);
    discount.endsAt && endDate.onChange(discount.endsAt);

    config.label.onChange(srcConfig.label ?? "");
    config.applyType.onChange(srcConfig.applyType ?? "total");
    srcConfig.total?.steps &&
      config.totalSteps.onChange(
        srcConfig.total?.steps.map((v) => ({
          type: v.value.type,
          require: v.require,
          value: v.value.value,
        })),
      );
    config.containProduct.onChange(srcConfig.products || []);
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
    <Page title="Bundle discount detail">
      <Layout>
        <DiscountProvider>
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

                {/* <Box>
                <TextField
                  label={"Label"}
                  autoComplete="off"
                  {...config.label}
                  helpText="This text will show in checkout ui of customer"
                />
              </Box> */}
              </Card>

              <ODConfigCard
                odType={config.applyType}
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
        </DiscountProvider>

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

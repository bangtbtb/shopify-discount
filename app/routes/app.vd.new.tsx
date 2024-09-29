import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  useActionData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  ActiveDatesCard,
  CombinationCard,
  DiscountClass,
  CombinableDiscountTypes,
  DateTime,
} from "@shopify/discount-app-components";
import {
  Banner,
  BlockStack,
  Card,
  Form,
  Layout,
  Page,
  PageActions,
  TextField,
} from "@shopify/polaris";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import { useField, useForm } from "@shopify/react-form";
import { useEffect, useMemo } from "react";
import { authenticate } from "~/shopify.server";
import { createVolumeDiscount } from "~/models/vd_model";
import { VDApplyType, VDConfig } from "~/defs/discount";
import { CollectionInfo } from "~/components/Shopify/SelectCollection";
import { ProductInfo } from "~/components/Shopify/SelectProduct";
import VDConfigCard, {
  VDStepConfigComponent,
} from "~/components/Discounts/VDConfigCard";
import { StepData } from "~/components/Discounts/ConfigStep";
import { randomDigit } from "~/models/utils";
import { DiscountProvider } from "~/components/providers/DiscountProvider";
import { ActionStatus } from "~/defs";

interface ActionData {
  status: ActionStatus;
  errors: Array<{ code: number; message: string; field: [string] }>;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();

  var discount: DiscountAutomaticAppInput = JSON.parse(
    formData.get("discount")?.toString() || "{}",
  );

  const config: VDConfig = {
    ...JSON.parse(formData.get("config")?.toString() || "{}"),
    label: `VOLUME_${randomDigit()}`,
  };

  var resp = await createVolumeDiscount(admin.graphql, {
    discount: discount,
    config: config,
    shop: session.shop,
  });

  var status: ActionStatus = resp?.userErrors?.length ? "failed" : "success";
  var errors = resp?.userErrors?.length ? resp?.userErrors?.length : undefined;

  return json({ status, errors });
};

export default function VolDiscountCreate() {
  const submitForm = useSubmit();
  const actData = useActionData<ActionData>();
  const navigation = useNavigation();

  const todaysDate = useMemo(() => new Date().toString(), []);
  const isLoading = navigation.state == "submitting";
  const submitErrors = actData?.errors ?? [];

  useEffect(() => {
    if (actData?.status === "success") {
      window.shopify.toast.show("Create volume discount success", {
        duration: 5000,
      });
    }

    if (actData?.status === "failed") {
      window.shopify.toast.show("Create volume discount failed", {
        duration: 5000,
        isError: true,
      });
    }
    // console.log("Navigation State: ", navigation, actData);
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
        steps: useField<Array<StepData>>([
          { type: "percent", value: 5, require: 2 },
          { type: "percent", value: 10, require: 3 },
          { type: "percent", value: 15, require: 4 },
        ]),
        applyType: useField<VDApplyType>("collection"),
        colls: useField<Array<CollectionInfo>>([]),
        products: useField<Array<ProductInfo>>([]),
      },
    },
    onSubmit: async (form) => {
      var discount: DiscountAutomaticAppInput = {
        title: form.title,
        combinesWith: form.combinesWith,
        startsAt: form.startDate,
        endsAt: form.endDate,
      };

      var fcg: VDConfig = {
        label: form.config.label,
        steps: form.config.steps.map((v) => ({
          require: v.require,
          value: {
            type: v.type,
            value: v.value,
          },
        })),
        applyType: form.config.applyType,
        collIds:
          form.config.applyType == "collection"
            ? form.config.colls.map((v) => v.id)
            : [],
        productIds:
          form.config.applyType == "products"
            ? form.config.products.map((v) => v.id)
            : [],
      };
      console.log("Form config: ", fcg);
      console.log("Discount: ", discount);

      submitForm(
        {
          discount: JSON.stringify(discount),
          config: JSON.stringify(fcg),
        },
        { method: "post" },
      );
      return { status: "success" };
    },
  });

  // console.log("Step on vd new: ", config.steps);

  const errorBanner =
    submitErrors?.length > 0 ? (
      <Layout.Section>
        <Banner tone="critical">
          <p>There were some issues with your form submission</p>
          <ul>
            {submitErrors.map(({ message, field }, index) => (
              <li key={index}>
                {field.join(".")} {message}
              </li>
            ))}
          </ul>
        </Banner>
      </Layout.Section>
    ) : null;

  return (
    <Page
      title="Create volume discount"
      primaryAction={{
        content: "Save",
        onAction: submit,
        loading: isLoading,
      }}
    >
      <Layout>
        {errorBanner}
        <Layout.Section>
          <Form method="post" onSubmit={() => {}}>
            <BlockStack align="space-around" gap={"200"}>
              <Card>
                <TextField label={"Title"} autoComplete="off" {...title} />
                {/* <TextField
                  label={"Label"}
                  autoComplete="off"
                  {...config.label}
                /> */}
              </Card>
              <VDStepConfigComponent steps={config.steps} />

              <VDConfigCard
                applyType={config.applyType}
                colls={config.colls}
                products={config.products}
              />

              <DiscountProvider>
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
              </DiscountProvider>
            </BlockStack>
          </Form>
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

// https://shopify.dev/docs/apps/build/discounts/experience/build-ui

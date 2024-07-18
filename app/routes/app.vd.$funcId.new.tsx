import { ActionFunctionArgs, json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
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

import { useField, useForm } from "@shopify/react-form";
import { useEffect, useMemo } from "react";
import { authenticate } from "~/shopify.server";
import VDConfigCard from "~/components/VDConfigCard";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { funcId } = params;
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const { title, combinesWith, startsAt, endsAt, config } = JSON.parse(
    formData.get("discount")?.toString() || "{}",
  );

  const baseDiscount = {
    functionId: funcId,
    title,
    combinesWith,
    startsAt: new Date(startsAt),
    endsAt: endsAt && new Date(endsAt),
  };

  const resp = await admin.graphql(
    `#graphql
      mutation createAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
        discountAutomaticAppCreate(automaticAppDiscount: $discount) {
          automaticAppDiscount {
            discountId
          }
          userErrors {
            code
            message
            field
          }
        }
      }
      `,
    {
      variables: {
        discount: {
          ...baseDiscount,
          metafields: [
            {
              namespace: "$app:vol_discount",
              key: "func_config",
              type: "json",
              value: JSON.stringify({
                label: baseDiscount.title,
                minQuantity: config.minQuantity,
                maxQuantity: config.maxQuantity,
                percent: config.percent,
                applyType: config.applyType,
                colId: config.colId,
              }),
            },
          ],
        },
      },
    },
  );

  const respJson = await resp.json();
  const errors = respJson.data?.discountAutomaticAppCreate?.userErrors;
  return json({ errors });
};

interface ActionData {
  errors: Array<{ code: number; message: string; field: [string] }>;
}

export default function VolDiscountCreate() {
  const submitForm = useSubmit();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const todaysDate = useMemo(() => new Date().toString(), []);
  const isLoading = navigation.state == "submitting";
  const submitErrors = actionData?.errors ?? [];

  // const redirect = Redirect.create(app);

  useEffect(() => {
    // if (actionData?.errors?.length === 0) {
    //   redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
    //     name: Redirect.ResourceType.Discount,
    //   });
    // }
    console.log("Create success");
  }, [actionData]);

  const x = useForm({
    fields: {},
    onSubmit: async (form) => {
      return { status: "success" };
    },
  });

  const {
    fields: { discountTitle, combinesWith, startDate, endDate, config },
    submit,
  } = useForm({
    fields: {
      discountTitle: useField(""),
      combinesWith: useField<CombinableDiscountTypes>({
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: false,
      }),
      startDate: useField<DateTime>(todaysDate),
      endDate: useField<DateTime | null>(null),
      config: {
        minQuantity: useField("1"),
        maxQuantity: useField("2"),
        percent: useField("0"),
        applyType: useField<"all" | "collection">("collection"),
        collection: useField({
          id: "",
          title: "",
          image: "",
          imageAlt: "",
        }),
      },
    },
    onSubmit: async (form) => {
      var colId =
        form.config.applyType == "all" ? null : form.config.collection.id;
      const discount = {
        title: form.discountTitle,
        combinesWith: form.combinesWith,
        startsAt: form.startDate,
        endsAt: form.endDate,
        config: {
          minQuantity: parseInt(form.config.minQuantity),
          maxQuantity: parseInt(form.config.maxQuantity),
          percent: parseFloat(form.config.percent),
          applyType: form.config.applyType,
          colId: colId,
        },
      };
      submitForm({ discount: JSON.stringify(discount) }, { method: "post" });
      return { status: "success" };
    },
  });

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
      // backAction={{ content: "Discounts", onAction: () => onBrea }}
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
                <TextField
                  label={"Title"}
                  autoComplete="off"
                  {...discountTitle}
                />
              </Card>

              <VDConfigCard
                label=""
                minQuantity={config.minQuantity}
                maxQuantity={config.maxQuantity}
                percent={config.percent}
                applyType={config.applyType}
                collection={config.collection}
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

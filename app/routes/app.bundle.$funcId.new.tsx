import { ActionFunctionArgs, json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

import {
  ActiveDatesCard,
  CombinationCard,
  DiscountClass,
  MethodCard,
  SummaryCard,
  DiscountMethod,
  RequirementType,
  UsageLimitsCard,
  CombinableDiscountTypes,
  PositiveNumericString,
  DateTime,
  DiscountStatus,
} from "@shopify/discount-app-components";
import {
  Banner,
  BlockStack,
  Card,
  Form,
  Layout,
  Page,
  PageActions,
  Text,
  TextField,
} from "@shopify/polaris";
import { useField, useForm } from "@shopify/react-form";
import { useEffect, useMemo } from "react";
import { authenticate } from "~/shopify.server";
import { CurrencyCode } from "@shopify/react-i18n";
import VDConfigCard from "~/components/VDConfigCard";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { funcId } = params;
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const {
    title,
    method,
    code,
    combinesWith,
    usageLimit,
    appliesOncePerCustomer,
    startsAt,
    endsAt,
    config,
  } = JSON.parse(formData.get("discount")?.toString() || "{}");

  const baseDiscount = {
    functionId: funcId,
    title,
    combinesWith,
    startsAt: new Date(startsAt),
    endsAt: endsAt && new Date(endsAt),
  };

  if (method === DiscountMethod.Code) {
    const baseCodeDiscount = {
      ...baseDiscount,
      title: code,
      code,
      usageLimit,
      appliesOncePerCustomer,
    };
    const resp = await admin.graphql(
      `#graphql
        mutation createCodeDiscount($discount: DiscountCodeAppInput!) {
          discountCodeAppCreate(codeAppDiscount: $discount) {
            userErrors {
              code
              message
              field
            }
          }
        }`,
      {
        variables: {
          discount: {
            ...baseCodeDiscount,
            metafields: [
              {
                namespace: "$app:od",
                key: "func_config",
                type: "json",
                value: JSON.stringify({
                  minQuantity: config.minQuantity,
                  maxQuantity: config.maxQuantity,
                  percent: config.percent,
                }),
              },
            ],
          },
        },
      },
    );
    const respJson = await resp.json();
    const errors = respJson.data?.discountCodeAppCreate?.userErrors;

    return json({ errors });
  } else {
    const resp = await admin.graphql(
      `#graphql
      mutation createBundleDiscount($discount: DiscountAutomaticAppInput!) {
        discountAutomaticAppCreate(automaticAppDiscount: $discount) {
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
                namespace: "$app:od",
                key: "func_config",
                type: "json",
                value: JSON.stringify({
                  minQuantity: config.minQuantity,
                  maxQuantity: config.maxQuantity,
                  percent: config.percent,
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
  }
};

interface ActionData {
  errors: Array<{ code: number; message: string; field: [string] }>;
}

export default function VolDiscountNew() {
  const submitForm = useSubmit();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const app = useAppBridge();

  const todaysDate = useMemo(() => new Date().toString(), []);
  const isLoading = navigation.state == "submitting";
  const currencyCode = CurrencyCode.Vnd;
  const submitErrors = actionData?.errors ?? [];

  //   const redirect = Redirect.create(app);

  useEffect(() => {
    // if (actionData?.errors?.length === 0) {
    //   redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
    //     name: Redirect.ResourceType.Discount,
    //   });
    // }
    console.log("Create success");
  }, [actionData]);

  const {
    fields: {
      discountTitle,
      discountCode,
      discountMethod,
      combinesWith,
      requirementType,
      requirementSubTotal,
      requirementQuantity,
      usageLimit,
      appliesOncePerCustomer,
      startDate,
      endDate,
      config,
    },
    submit,
  } = useForm({
    fields: {
      discountTitle: useField(""),
      discountMethod: useField(DiscountMethod.Automatic),
      discountCode: useField(""),
      combinesWith: useField<CombinableDiscountTypes>({
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: false,
      }),
      requirementType: useField(RequirementType.None),
      requirementSubTotal: useField("0"),
      requirementQuantity: useField("0"),
      usageLimit: useField<PositiveNumericString | null>(null),
      appliesOncePerCustomer: useField(false),
      startDate: useField<DateTime>(todaysDate),
      endDate: useField<DateTime | null>(null),
      config: {
        minQuantity: useField("1"),
        maxQuantity: useField("2"),
        percent: useField("5"),
      },
    },
    onSubmit: async (form) => {
      const discount = {
        title: form.discountTitle,
        method: form.discountMethod,
        code: form.discountCode,
        combinesWith: form.combinesWith,
        usageLimit: form.usageLimit == null ? null : parseInt(form.usageLimit),
        appliesOncePerCustomer: form.appliesOncePerCustomer,
        startsAt: form.startDate,
        endsAt: form.endDate,
        config: {
          minQuantity: parseInt(form.config.minQuantity),
          maxQuantity: parseInt(form.config.maxQuantity),
          percent: parseFloat(form.config.percent),
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

  // return (
  //   <Page>
  //     <Text as={"p"}>dfdf</Text>
  //     <TextField label="Test text fields" value="dfd" onChange={(v) => {}} />
  //   </Page>
  // );
  return (
    <Page
      title="Create order discount"
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
              {/* <VDConfigCard
                label=""
                minQuantity={config.minQuantity}
                maxQuantity={config.maxQuantity}
                percent={config.percent}
                applyType={null}

              /> */}

              {discountMethod.value === DiscountMethod.Code && (
                <UsageLimitsCard
                  totalUsageLimit={usageLimit}
                  oncePerCustomer={appliesOncePerCustomer}
                />
              )}
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
          <SummaryCard
            header={{
              discountMethod: discountMethod.value,
              discountDescriptor:
                discountMethod.value === DiscountMethod.Automatic
                  ? discountTitle.value
                  : discountCode.value,
              appDiscountType: "Volume",
              isEditing: false,
            }}
            performance={{
              status: DiscountStatus.Scheduled,
              usageCount: 0,
              discountMethod: discountMethod.value,
            }}
            minimumRequirements={{
              requirementType: requirementType.value,
              subtotal: requirementSubTotal.value,
              quantity: requirementQuantity.value,
              currencyCode: currencyCode,
            }}
            usageLimits={{
              oncePerCustomer: appliesOncePerCustomer.value,
              totalUsageLimit: usageLimit.value,
            }}
            activeDates={{
              startDate: startDate.value,
              endDate: endDate.value,
            }}
          />
        </Layout.Section>
        <Layout.Section>
          <PageActions
            primaryAction={{
              content: "Create discount",
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

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
  DiscountStatus,
} from "@shopify/discount-app-components";
import {
  Banner,
  BlockStack,
  Card,
  Form,
  Icon,
  Layout,
  Page,
  PageActions,
  TextField,
} from "@shopify/polaris";
import { XIcon } from "@shopify/polaris-icons";
import { useField, useForm } from "@shopify/react-form";
import { useEffect, useMemo } from "react";
import { authenticate } from "~/shopify.server";
import VDConfigCard, { VDStepConfigComponent } from "~/components/VDConfigCard";
import { createVolumeDiscount } from "~/models/vd_model";
import { ActionStatus, VDApplyType, VDConfig, VDStep } from "~/defs";
import { ProductInfo } from "~/components/SelectProduct";
import { gqlGetFunction } from "~/models/gql_func";
import { StepData } from "~/components/ConfigStep";
import { createPrismaDiscount } from "~/models/db_models";
import { DiscountAutomaticAppInput } from "~/types/admin.types";

interface ActionData {
  status: string;
  errors: Array<{ code: number; message: string; field: [string] }>;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();

  var vdFunc = await gqlGetFunction(admin.graphql, {
    apiType: "product_discounts",
  });

  if (!vdFunc?.length) {
    return json({
      status: "failed",
      errors: { message: "Volume discount function not found" },
    });
  }

  var discount: DiscountAutomaticAppInput = JSON.parse(
    formData.get("discount")?.toString() || "{}",
  );
  discount.functionId = vdFunc[0].id;
  discount.startsAt = new Date(discount.startsAt);
  if (discount.endsAt) {
    discount.endsAt = new Date(discount.endsAt);
  }

  const config: VDConfig = JSON.parse(
    formData.get("config")?.toString() || "{}",
  );

  var resp = await createVolumeDiscount(admin.graphql, {
    discount: discount,
    config: config,
  });

  const rsDiscount = resp?.discountAutomaticAppCreate?.automaticAppDiscount;
  const errors = resp?.discountAutomaticAppCreate?.userErrors;
  var status: ActionStatus = "success";
  if (errors?.length) {
    console.log("Create discount error: ", errors);
    status = "failed";
  } else {
    if (rsDiscount) {
      await createPrismaDiscount({
        id: rsDiscount.discountId,
        shop: session.shop,
        metafield: JSON.stringify(config),
        status: rsDiscount.status,
        title: discount.title ?? "",
        type: "Volume",
        subType: config.applyType,
        startAt: discount.startsAt,
        endAt: discount.endsAt ? discount.endsAt : null,
        createdAt: new Date(),
        productIds: config.productIds ? config.productIds : [],
        collectionIds: config.colId ? [config.colId] : [],
      });
    }
  }

  return json({ status: status, errors });
};

export default function VolDiscountCreate() {
  const submitForm = useSubmit();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const todaysDate = useMemo(() => new Date().toString(), []);
  const isLoading = navigation.state == "submitting";
  const submitErrors = actionData?.errors ?? [];

  const nav = useNavigate();

  // const redirect = Redirect.create(app);

  useEffect(() => {
    // if (actionData?.errors?.length === 0) {
    //   redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
    //     name: Redirect.ResourceType.Discount,
    //   });
    // }

    if (actionData?.status === "success") {
      nav("/app");
    }
    console.log("Navigation State: ", navigation, actionData);
  }, [actionData]);

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
          { type: "percent", value: "5", require: "2" },
          { type: "percent", value: "15", require: "3" },
          { type: "percent", value: "15", require: "4" },
        ]),
        applyType: useField<VDApplyType>("collection"),
        collection: useField({
          id: "",
          title: "",
          image: "",
          imageAlt: "",
        }),
        products: useField<Array<ProductInfo>>([]),
      },
    },
    onSubmit: async (form) => {
      var colId =
        form.config.applyType == "collection"
          ? form.config.collection.id
          : null;
      var productIds =
        form.config.applyType == "products"
          ? form.config.products.map((v) => v.id)
          : [];
      var steps: VDStep[] = form.config.steps.map((v) => ({
        require: Number.parseInt(v.require),
        value: {
          type: v.type,
          value: Number.parseInt(v.value),
        },
      }));

      var discount: DiscountAutomaticAppInput = {
        title: form.title,
        combinesWith: form.combinesWith,
        startsAt: form.startDate,
        endsAt: form.endDate,
      };

      var formConfig: VDConfig = {
        label: form.config.label,
        steps,
        applyType: form.config.applyType,
        colId: colId ?? "",
        productIds: productIds,
      };
      console.log("Product: ", productIds);
      console.log("Collection: ", colId);
      console.log("Discount: ", discount);

      submitForm(
        {
          discount: JSON.stringify(discount),
          config: JSON.stringify(formConfig),
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
                <TextField
                  label={"Label"}
                  autoComplete="off"
                  {...config.label}
                />
              </Card>
              <VDStepConfigComponent steps={config.steps} />

              <VDConfigCard
                applyType={config.applyType}
                collection={config.collection}
                products={config.products}
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

import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Form,
  InlineGrid,
  Layout,
  Page,
  PageActions,
  TextField,
} from "@shopify/polaris";

import { DeleteIcon } from "@shopify/polaris-icons";
import { authenticate } from "~/shopify.server";
import { DiscountAutomaticApp, UserError } from "~/types/admin.types";
import { useEffect, useMemo } from "react";
import { useField, useForm } from "@shopify/react-form";
import {
  ActiveDatesCard,
  CombinableDiscountTypes,
  CombinationCard,
  DateTime,
  DiscountClass,
} from "@shopify/discount-app-components";
import VDConfigCard, {
  VDStepConfigComponent,
} from "~/components/Discounts/VDConfigCard";
import { StepData } from "~/components/Discounts/ConfigStep";
import { CollectionInfo } from "~/components/Shopify/SelectCollection";
import { ProductInfo } from "~/components/Shopify/SelectProduct";
import {
  getVolumeDiscount,
  updateVolumeDiscount,
  VDConfigExt,
} from "~/models/vd_model";
import { ActionStatus, VDApplyType, VDConfig } from "~/defs";
import { DiscountProvider } from "~/components/providers/DiscountProvider";

interface AciontDataResponse {
  id: string;
  discount: DiscountAutomaticApp;
  config: VDConfigExt;
  errors: [UserError];
  status: ActionStatus;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const discountId = params.id;

  const { admin } = await authenticate.admin(request);
  const data = await getVolumeDiscount(admin.graphql, {
    discountId: discountId ?? "",
  });

  return json({ ...data });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { id } = params;
  const { admin } = await authenticate.admin(request);
  // var rmed = request.method.toLowerCase()
  // if (rmed === "delete") {
  //   return json({})
  // }

  const formData = await request.formData();

  const discount: DiscountAutomaticApp = JSON.parse(
    formData.get("discount")?.toString() || "{}",
  );

  const config: VDConfigExt = JSON.parse(
    formData.get("config")?.toString() ?? "{}",
  );

  var configValue = JSON.stringify(config);

  var resp = await updateVolumeDiscount(admin.graphql, {
    discountId: id ?? "",
    discount: discount,
    configId: config?.id,
    config: config as VDConfig,
  });

  var status: ActionStatus = "success";
  var errors = resp?.userErrors;
  if (errors?.length) {
    status = "failed";
  } else {
    errors = undefined;
  }
  return json({ status, errors });
};

export default function VolumeDiscountDetailPage() {
  const submitForm = useSubmit();
  const ldata = useLoaderData<AciontDataResponse>();
  const actData = useActionData<AciontDataResponse>();
  const navigation = useNavigation();

  const todaysDate = useMemo(() => new Date().toString(), []);

  const isLoading = navigation.state == "submitting";
  const submitErrors = actData?.errors ?? [];

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
        label: useField(""),
        steps: useField<Array<StepData>>([]),
        applyType: useField<VDApplyType>("collection"),
        colls: useField<Array<CollectionInfo>>([]),
        products: useField<Array<ProductInfo>>([]),
      },
    },
    onSubmit: async (form) => {
      const discount = {
        title: form.discountTitle,
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

      submitForm(
        {
          discount: JSON.stringify(discount),
          config: JSON.stringify({ id: ldata.config.id, ...fcg }),
        },
        { method: "post" },
      );
      return { status: "success" };
    },
  });

  useEffect(() => {
    if (!ldata.discount) {
      return;
    }

    const srcDis = ldata.discount;
    const srcConfig = ldata.config;

    discountTitle.onChange(srcDis?.title);
    combinesWith.onChange(srcDis.combinesWith);
    startDate.onChange(srcDis.startsAt);
    endDate.onChange(srcDis.endsAt);

    config.label.onChange(srcConfig.label);
    config.steps.onChange(
      srcConfig.steps.map((v) => ({
        require: v.require,
        type: v.value.type,
        value: v.value.value,
      })),
    );

    config.applyType.onChange(srcConfig.applyType);
    config.colls.onChange(srcConfig.colls);
    config.products.onChange(srcConfig.products ?? []);

    console.log("Loader data: ", ldata);
  }, [ldata]);

  useEffect(() => {
    if (!actData) {
      return;
    }

    if (actData.status === "success") {
      window.shopify.toast.show("Update volume discount success", {
        duration: 5000,
      });
    }

    if (actData.status === "failed") {
      window.shopify.toast.show("Update volume discount failed", {
        duration: 5000,
        isError: true,
      });
    }

    console.log("Action data: ", actData);
  }, [actData]);

  const errorBanner =
    submitErrors?.length > 0 ? (
      <Layout.Section>
        <Banner tone="critical">
          <p>There were some issues with your form submission</p>
          <ul>
            {submitErrors.map(({ message, field }, index) => (
              <li key={index}>
                {field?.join(".")} {message}
              </li>
            ))}
          </ul>
        </Banner>
      </Layout.Section>
    ) : null;

  return (
    <Page title="Detail of volume discount">
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
          <InlineGrid alignItems="center">
            <Button icon={DeleteIcon} variant="tertiary">
              Delete
            </Button>
          </InlineGrid>

          <PageActions
            primaryAction={{
              content: "Save discount",
              onAction: submit,
              loading: isLoading,
            }}
            secondaryActions={[
              {
                content: "Delete",
                icon: DeleteIcon,
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

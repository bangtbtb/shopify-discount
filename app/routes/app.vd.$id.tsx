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
  Card,
  Form,
  Layout,
  Page,
  PageActions,
  Text,
  TextField,
} from "@shopify/polaris";
import { authenticate, unauthenticated } from "~/shopify.server";
import {
  DiscountAutomaticApp,
  DiscountAutomaticAppInput,
  Metafield,
  UserError,
} from "~/types/admin.types";
import { useEffect, useMemo } from "react";
import { useField, useForm } from "@shopify/react-form";
import {
  ActiveDatesCard,
  CombinableDiscountTypes,
  CombinationCard,
  DateTime,
  DiscountClass,
} from "@shopify/discount-app-components";
import VDConfigCard, { VDStepConfigComponent } from "~/components/VDConfigCard";
import { CollectionInfo } from "~/components/SelectCollection";
import { getVolumeDiscount, updateVolumeDiscount } from "~/models/vd_model";
import { VDApplyType, VDConfig, VDStep } from "~/defs";
import { ProductInfo } from "~/components/SelectProduct";
import { getSimleProductInfo, getSimpleCollection } from "~/models/sfont";
import { updatePrismaDiscount } from "~/models/db_models";
import { title } from "process";
import { StepData } from "~/components/ConfigStep";

type VDConfigExt = VDConfig &
  Metafield & {
    products: Array<ProductInfo>;
    collection: CollectionInfo | null;
  };

interface AciontDataResponse {
  id: string;
  discount: DiscountAutomaticApp;
  config: VDConfigExt;
  errors: [UserError];
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const discountId = params.id;
  // const funcId = params.funcId;
  // console.log(`funcId:${funcId}  discountid:${discountId}`);

  const { admin, session } = await authenticate.admin(request);
  const data = await getVolumeDiscount(admin.graphql, {
    discountId: discountId ?? "",
  });

  var config: VDConfigExt = { ...data.config, collection: null, products: [] };
  if (data.config.applyType === "collection" && config.colId) {
    var colResp = await getSimpleCollection(
      admin.graphql,
      data.config.colId ?? "",
    );
    config.collection = colResp;
  }

  if (data.config.applyType === "products" && data.config.productIds?.length) {
    var products: Array<ProductInfo> = [];
    for (let i = 0; i < data.config.productIds.length; i++) {
      const pid = data.config.productIds[i];
      var product = await getSimleProductInfo(admin.graphql, pid);
      product && products.push(product);
      console.log("Product: ", product);
    }
    config.products = products;
  }

  return { ...data, config: config };
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { id } = params;
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const discount: DiscountAutomaticApp = JSON.parse(
    formData.get("discount")?.toString() || "{}",
  );

  const config: Metafield = JSON.parse(
    formData.get("config")?.toString() ?? "{}",
  );
  var data: DiscountAutomaticAppInput = { ...discount };

  if (config.id && config.value) {
    data.metafields = [
      {
        id: config.id,
        key: config.key,
        namespace: config.namespace,
        type: config.type,
        value: config.value,
      },
    ];
  } else {
    data.metafields = undefined;
  }
  var cValue: VDConfig = JSON.parse(config.value);

  var resp = await updateVolumeDiscount(admin.graphql, {
    discountId: id ?? "",
    data,
    configId: config?.id,
    configValue: config?.value,
  });

  const errors = resp?.discountAutomaticAppUpdate?.userErrors;
  if (!errors) {
    await updatePrismaDiscount(discount.discountId, {
      id: discount.discountId,
      title: discount.title,
      type: "Volume",
      status: discount.status,
      metafield: config.value,
      collectionIds: cValue.colId ? [cValue.colId] : [],
      productIds: cValue.productIds ? cValue.productIds : [],
      startAt: new Date(discount.startsAt),
      endAt: discount.endsAt ? new Date(discount.endsAt) : null,
    });
  }

  return json({ errors });
};

export default function VolumeDiscountDetail() {
  const submitForm = useSubmit();
  const loaderData = useLoaderData<AciontDataResponse>();
  const actionData = useActionData<AciontDataResponse>();
  const navigation = useNavigation();

  const todaysDate = useMemo(() => new Date().toString(), []);

  const isLoading = navigation.state == "submitting";
  const submitErrors = actionData?.errors ?? [];

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
        collection: useField<CollectionInfo | null>({
          id: "",
          title: "",
          image: "",
          imageAlt: "",
        }),
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
      var colId =
        form.config.applyType == "collection"
          ? parseFloat(form.config.collection?.id ?? "")
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
      var fcg = {
        id: loaderData.config.id,
        key: loaderData.config.key,
        namespace: loaderData.config.namespace,
        type: loaderData.config.type,
        value: JSON.stringify({
          label: form.config.label,
          steps,
          applyType: form.config.applyType,
          colId: colId ?? "",
          productIds: productIds,
        }),
      };

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

  useEffect(() => {
    if (!loaderData.discount) {
      return;
    }

    const srcDis = loaderData.discount;
    const srcConfig = loaderData.config;

    discountTitle.onChange(srcDis?.title);
    combinesWith.onChange(srcDis.combinesWith);
    startDate.onChange(srcDis.startsAt);
    endDate.onChange(srcDis.endsAt);

    config.label.onChange(srcConfig.label);
    config.steps.onChange(
      srcConfig.steps.map((v) => ({
        require: v.require.toString(),
        type: v.value.type,
        value: v.value.value.toString(),
      })),
    );

    config.applyType.onChange(srcConfig.applyType);
    config.collection.onChange(srcConfig.collection);
    config.products.onChange(srcConfig.products ?? []);

    console.log("Loader data: ", loaderData);
  }, [loaderData]);

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
              content: "Save discount",
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

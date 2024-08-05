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
  TextField,
} from "@shopify/polaris";

import { DeleteIcon } from "@shopify/polaris-icons";
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
import {
  getVolumeDiscount,
  updateVolumeDiscount,
  VDConfigExt,
} from "~/models/vd_model";
import { ActionStatus, VDApplyType, VDConfig, VDStep } from "~/defs";
import { ProductInfo } from "~/components/SelectProduct";
import { getSimleProductInfo, getSimpleCollection } from "~/models/sfont";
import { updatePrismaDiscount } from "~/models/db_models";
import { StepData } from "~/components/ConfigStep";

interface AciontDataResponse {
  id: string;
  discount: DiscountAutomaticApp;
  config: VDConfigExt;
  errors: [UserError];
  status: ActionStatus;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const discountId = params.id;

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

  var data: DiscountAutomaticAppInput = {
    ...discount,
    startsAt: new Date(discount.startsAt),
    endsAt: discount.endsAt || undefined,
  };
  var configValue = JSON.stringify(config);

  var resp = await updateVolumeDiscount(admin.graphql, {
    discountId: id ?? "",
    data,
    configId: config?.id,
    configValue,
  });

  var status: ActionStatus = "success";
  var errors = resp?.discountAutomaticAppUpdate?.userErrors;
  const rsDiscount = resp?.discountAutomaticAppUpdate?.automaticAppDiscount;
  if (errors?.length) {
    status = "failed";
  } else {
    if (rsDiscount) {
      await updatePrismaDiscount(rsDiscount.discountId, {
        title: rsDiscount.title,
        status: rsDiscount.status,
        metafield: configValue,
        subType: config.applyType,
        collectionIds: config.colId ? [config.colId] : [],
        productIds: config.productIds ? config.productIds : [],
        startAt: new Date(rsDiscount.startsAt),
        endAt: rsDiscount.endsAt ? new Date(rsDiscount.endsAt) : null,
      });
    }
    errors = undefined;
  }
  return json({ status, errors });
};

export default function VolumeDiscountDetail() {
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
          ? form.config.collection?.id
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

      var fcg: VDConfig = {
        label: form.config.label,
        steps,
        applyType: form.config.applyType,
        colId: colId ?? "",
        productIds: productIds,
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
        require: v.require.toString(),
        type: v.value.type,
        value: v.value.value.toString(),
      })),
    );

    config.applyType.onChange(srcConfig.applyType);
    config.collection.onChange(srcConfig.collection);
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

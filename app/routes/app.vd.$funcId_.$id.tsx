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
} from "../types/admin.types";
import { useEffect, useMemo } from "react";
import { useField, useForm } from "@shopify/react-form";
import {
  ActiveDatesCard,
  CombinableDiscountTypes,
  CombinationCard,
  DateTime,
  DiscountClass,
} from "@shopify/discount-app-components";
import VDConfigCard from "~/components/VDConfigCard";
import { CollectionInfo } from "~/components/SelectCollection";

interface VDConfig extends Metafield {
  minQuantity: number;
  maxQuantity: number;
  percent: number;
  applyType: "all" | "collection";
  colId?: string;
  collection: CollectionInfo;
}

interface AciontDataResponse {
  id: string;
  discount: DiscountAutomaticApp;
  config: VDConfig;
  errors: [UserError];
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const funcId = params.funcId;
  const discountId = params.id;
  // console.log(`funcId:${funcId}  discountid:${discountId}`);

  const { admin, session } = await authenticate.admin(request);

  var resp = await admin.graphql(
    `#graphql
query getDiscountDetail($id: ID!) {
  discountNode(id: $id) {
    __typename
    id
    discount {
      ... on DiscountAutomaticApp {
        title
        status
        appDiscountType {
          title
          targetType
          functionId
          discountClass
        }
        combinesWith {
          orderDiscounts
          productDiscounts
          shippingDiscounts
        }
        startsAt
        endsAt
        createdAt
      }
    }
    metafields(first: 10, namespace: "$app:vol_discount") {
      nodes {
        id
        key
        type 
        value
        namespace
      }
    }
  }
}`,
    {
      variables: { id: `gid://shopify/DiscountAutomaticNode/${discountId}` },
    },
  );
  var respJson = await resp.json();

  var config = {};
  var metafield = respJson.data?.discountNode?.metafields?.nodes[0] ?? {};
  if (respJson.data?.discountNode?.metafields.nodes?.length) {
    console.log(
      "metafields: ",
      respJson.data?.discountNode?.metafields?.nodes[0],
    );
    config = JSON.parse(
      respJson.data?.discountNode?.metafields?.nodes[0].value ?? "{}",
    );
  }

  // console.log("config:  ", { ...config, ...metafield });

  return {
    id: respJson.data?.discountNode?.id,
    config: { ...config, ...metafield },
    discount: respJson.data?.discountNode?.discount,
  };
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { funcId, id } = params;
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const discount: DiscountAutomaticApp = JSON.parse(
    formData.get("discount")?.toString() || "{}",
  );
  const config: Metafield = JSON.parse(
    formData.get("config")?.toString() ?? "{}",
  );
  var data: DiscountAutomaticAppInput = { ...discount };

  // console.log("Raw config: ", formData.get("config")?.toString() ?? "{}");
  // console.log("Config parse: ", config);
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
  // console.log("Update with data: ", JSON.stringify(data));

  const resp = await admin.graphql(
    `#graphql
mutation updateDiscount($id: ID!, $data: DiscountAutomaticAppInput!){
  discountAutomaticAppUpdate(
    id: $id,
    automaticAppDiscount: $data
  ) {
      userErrors {
      code
      field
      message
    }
  }
}`,
    {
      variables: {
        id: `gid://shopify/DiscountAutomaticNode/${id}`,
        data: data,
      },
    },
  );
  const respJson = await resp.json();
  // const errors = respJson?.data?.userErrors;

  return json({});
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
        minQuantity: useField("0"),
        maxQuantity: useField("0"),
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
      console.log(
        `Update with config: min:${config.minQuantity.value} max:${config.maxQuantity.value}`,
      );
      console.log(
        `Update with config in form: min:${form.config.minQuantity} max:${form.config.maxQuantity}`,
      );

      const discount = {
        title: form.discountTitle,
        combinesWith: form.combinesWith,
        startsAt: form.startDate,
        endsAt: form.endDate,
      };
      var fcg = {
        id: loaderData.config.id,
        key: loaderData.config.key,
        namespace: loaderData.config.namespace,
        type: loaderData.config.type,
        value: JSON.stringify({
          minQuantity: parseInt(form.config.minQuantity),
          maxQuantity: parseInt(form.config.maxQuantity),
          percent: parseFloat(form.config.percent),
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

    config.minQuantity.onChange(srcConfig.minQuantity.toString());
    config.maxQuantity.onChange(srcConfig.maxQuantity.toString());
    config.percent.onChange(srcConfig.percent.toString());
    config.applyType.onChange(srcConfig.applyType);
    config.collection.onChange(srcConfig.collection);

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
              </Card>

              <VDConfigCard
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

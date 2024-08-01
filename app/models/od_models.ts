import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput, Metafield } from "~/types/admin.types";
import { getDiscounts } from "./discount";
import { DiscountStatus } from "@shopify/discount-app-components";
import { ODConfig } from "~/defs";
import { config } from "process";
import { ProductInfo } from "~/components/SelectProduct";
import { getSimleProductInfo } from "./sfont";

export type ODConfigExt = ODConfig & {
  id: string;
  products: Array<ProductInfo>;
};

export type CreateODRequest = {
  discount: DiscountAutomaticAppInput;
  config: ODConfig;
};

export type UpdateODRequest = {
  discountId: string;
  data: DiscountAutomaticAppInput;
  config: ODConfigExt;
};

export type GetODRequest = {
  discountId: string;
};

export async function createBundleDiscount(
  graphql: GraphQLClient<AdminOperations>,
  req: CreateODRequest,
) {
  const resp = await graphql(
    `
      #graphql
      mutation createOD($discount: DiscountAutomaticAppInput!) {
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
          ...req.discount,
          metafields: [
            {
              namespace: "$app:od",
              key: "od_config",
              type: "json",
              value: JSON.stringify(config),
            },
          ],
        },
      },
    },
  );

  const respJson = await resp.json();
  return respJson.data;
}

export async function updateBundleDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId, data, config }: UpdateODRequest,
) {
  if (config.id) {
    data.metafields = [
      {
        id: config.id,
        value: JSON.stringify(config),
      },
    ];
    console.log("Metafield update: ", data.metafields[0]);
  } else {
    data.metafields = undefined;
  }

  const resp = await graphql(
    `
      #graphql
      mutation updateBundleDiscount(
        $id: ID!
        $data: DiscountAutomaticAppInput!
      ) {
        discountAutomaticAppUpdate(id: $id, automaticAppDiscount: $data) {
          automaticAppDiscount {
            discountId
            title
            startsAt
            endsAt
            status
          }
          userErrors {
            code
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        id: `gid://shopify/DiscountAutomaticNode/${discountId}`,
        data: data,
      },
    },
  );

  const respJson = await resp.json();

  console.log("Response data: ", respJson.data);
  return respJson.data;
}

export async function getBundleDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId }: GetODRequest,
) {
  var resp = await graphql(
    `
      #graphql
      query getBundleDiscount($id: ID!) {
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
          metafields(first: 10, namespace: "$app:od") {
            nodes {
              id
              value
            }
          }
        }
      }
    `,
    {
      variables: { id: `gid://shopify/DiscountAutomaticNode/${discountId}` },
    },
  );
  var respJson = await resp.json();

  var metafield = respJson.data?.discountNode?.metafields?.nodes[0];
  var config: ODConfigExt = {
    id: metafield?.id,
    products: [],
    ...JSON.parse(metafield?.value ?? "{}"),
  };

  if (config.contain?.productIds.length) {
    for (let i = 0; i < config.contain.productIds.length; i++) {
      var p = await getSimleProductInfo(graphql, config.contain.productIds[i]);
      p && config.products.push(p);
    }
  }

  return {
    id: respJson.data?.discountNode?.id,
    config: config,
    discount: respJson.data?.discountNode?.discount,
  };
}

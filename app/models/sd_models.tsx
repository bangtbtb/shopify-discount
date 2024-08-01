import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput, Metafield } from "~/types/admin.types";
import { getDiscounts } from "./discount";
import { DiscountStatus } from "@shopify/discount-app-components";
import { SDConfig } from "~/defs";
import { config } from "process";
import { ProductInfo } from "~/components/SelectProduct";
import { getSimleProductInfo } from "./sfont";

export type SDConfigExt = SDConfig & {
  id: string;
  products: Array<ProductInfo>;
};

export type CreateSDRequest = {
  discount: DiscountAutomaticAppInput;
  config: SDConfig;
};

export type UpdateSDRequest = {
  discountId: string;
  data: DiscountAutomaticAppInput;
  config: SDConfigExt;
};

export type GetSDRequest = {
  discountId: string;
};

export async function createShippingDiscount(
  graphql: GraphQLClient<AdminOperations>,
  req: CreateSDRequest,
) {
  const resp = await graphql(
    `
      #graphql
      mutation createShippingDiscount($discount: DiscountAutomaticAppInput!) {
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
              namespace: "$app:sd",
              key: "sd_config",
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

export async function updateShippingDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId, data, config }: UpdateSDRequest,
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
      mutation updateShippingDiscount(
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

export async function getShippingDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId }: GetSDRequest,
) {
  var resp = await graphql(
    `
      #graphql
      query getShippingDiscount($id: ID!) {
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
          metafields(first: 10, namespace: "$app:sd") {
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
  var config: SDConfigExt = {
    id: metafield?.id,
    products: [],
    ...JSON.parse(metafield?.value ?? "{}"),
  };

  return {
    id: respJson.data?.discountNode?.id,
    config: config,
    discount: respJson.data?.discountNode?.discount,
  };
}

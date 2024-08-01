import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput, MetafieldInput } from "~/types/admin.types";

export type GqlCreateDiscountRequest = {
  discount: DiscountAutomaticAppInput;
  metafield: MetafieldInput;
};

export type GqlUpdateDiscountRequest = {
  discountId: string;
  data: DiscountAutomaticAppInput;
  config: MetafieldInput;
};

export async function gqlCreateDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discount, metafield }: GqlCreateDiscountRequest,
) {
  const resp = await graphql(
    `
      #graphql
      mutation createDiscount($discount: DiscountAutomaticAppInput!) {
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
          ...discount,
          metafields: [metafield],
        },
      },
    },
  );

  const respJson = await resp.json();
  return respJson.data;
}

export async function gqlUpdateDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId, data, config }: GqlUpdateDiscountRequest,
) {
  if (config.id && config.value) {
    data.metafields = [
      {
        ...config,
      },
    ];
  } else {
    data.metafields = undefined;
  }

  const resp = await graphql(
    `
      #graphql
      mutation updateDiscount($id: ID!, $data: DiscountAutomaticAppInput!) {
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
  return respJson.data;
}

export async function gqlGetDiscount(
  graphql: GraphQLClient<AdminOperations>,
  discountId: string,
  namespace: string,
) {
  var resp = await graphql(
    `
      #graphql
      query getDiscount($id: ID!, $namespace: String!) {
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
          metafields(first: 10, namespace: $namespace) {
            nodes {
              id
              value
            }
          }
        }
      }
    `,
    {
      variables: {
        id: `gid://shopify/DiscountAutomaticNode/${discountId}`,
        namespace: namespace,
      },
    },
  );
  var respJson = await resp.json();
  return respJson;
}

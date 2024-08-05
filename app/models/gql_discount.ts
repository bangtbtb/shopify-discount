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
      mutation gqlCreateDiscount($discount: DiscountAutomaticAppInput!) {
        discountAutomaticAppCreate(automaticAppDiscount: $discount) {
          automaticAppDiscount {
            discountId
            status
            startsAt
            endsAt
            title
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
  req: GqlUpdateDiscountRequest,
) {
  if (req.config.id) {
    if (!req.config.value) {
      req.config.value = JSON.stringify(req.config);
    }
    req.data.metafields = [
      {
        id: req.config.id,
        value: req.config.value,
      },
    ];
    // console.log("Metafield update: ", req.config);
  } else {
    req.data.metafields = undefined;
    console.log("Metafield has no id: ", req.config);
  }

  const resp = await graphql(
    `
      #graphql
      mutation gqlUpdateDiscount($id: ID!, $data: DiscountAutomaticAppInput!) {
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
            extraInfo
          }
        }
      }
    `,
    {
      variables: {
        id: `gid://shopify/DiscountAutomaticNode/${req.discountId}`,
        data: req.data,
      },
    },
  );

  const respJson = await resp.json();
  return respJson.data;
}

export async function gqlGetDiscount(
  graphql: GraphQLClient<AdminOperations>,
  discountId: string,
  namespace: string | undefined,
) {
  var resp = await graphql(
    `
      #graphql
      query gqlGetDiscount($id: ID!, $namespace: String) {
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
              asyncUsageCount
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

export async function gqlDelDiscount(
  graphql: GraphQLClient<AdminOperations>,
  discountId: string,
) {
  var resp = await graphql(
    `
      #graphql
      mutation discountAutomaticDelete($id: ID!) {
        discountAutomaticDelete(id: $id) {
          deletedAutomaticDiscountId
          userErrors {
            field
            code
            message
          }
        }
      }
    `,
    {
      variables: {
        id: `gid://shopify/DiscountAutomaticNode/${discountId}`,
      },
    },
  );
  var respJson = await resp.json();
  return respJson;
}

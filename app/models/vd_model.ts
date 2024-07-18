import { AdminOperations } from "@shopify/admin-api-client";
import { AuthenticateAdmin } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/authenticate/admin/types";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput } from "~/types/admin.types";

export type VDConfigValue = {
  minQuantity: number;
  maxQuantity: number;
  percent: number;
  applyType: "all" | "collection";
  colId?: string;
};

export type CreateVDRequest = {
  funcId: string;
  discount: DiscountAutomaticAppInput;
  config: VDConfigValue;
};

export type UpdateVDRequest = {
  discountId: string;
  data: DiscountAutomaticAppInput;
  configId?: string;
  configValue?: string;
};

export type GetVDRequest = {
  discountId: string;
};

export async function createVolumeDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discount, config }: CreateVDRequest,
) {
  const resp = await graphql(
    `
      #graphql
      mutation createVolumeDiscount($discount: DiscountAutomaticAppInput!) {
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
          metafields: [
            {
              namespace: "$app:vol_discount",
              key: "func_config",
              type: "json",
              value: JSON.stringify({
                label: discount.title,
                minQuantity: config.minQuantity,
                maxQuantity: config.maxQuantity,
                percent: config.percent,
                applyType: config.applyType,
                colId: config.colId,
              }),
            },
          ],
        },
      },
    },
  );

  const respJson = await resp.json();
  return respJson.data;
}

export async function updateVolumeDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId, data, configId, configValue }: UpdateVDRequest,
) {
  if (configId && configValue) {
    data.metafields = [
      {
        id: configId,
        value: configValue,
      },
    ];
  } else {
    data.metafields = undefined;
  }

  const resp = await graphql(
    `
      #graphql
      mutation updateVolumeDiscount(
        $id: ID!
        $data: DiscountAutomaticAppInput!
      ) {
        discountAutomaticAppUpdate(id: $id, automaticAppDiscount: $data) {
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

export async function getVolumeDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId }: GetVDRequest,
) {
  var resp = await graphql(
    `
      #graphql
      query getVolumeDiscount($id: ID!) {
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
      }
    `,
    {
      variables: { id: `gid://shopify/DiscountAutomaticNode/${discountId}` },
    },
  );
  var respJson = await resp.json();

  var config = {};
  var metafield = respJson.data?.discountNode?.metafields?.nodes[0] ?? {};
  if (respJson.data?.discountNode?.metafields.nodes?.length) {
    // console.log(
    //   "metafields: ",
    //   respJson.data?.discountNode?.metafields?.nodes[0],
    // );
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
}

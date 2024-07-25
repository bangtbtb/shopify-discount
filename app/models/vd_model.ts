import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput, Metafield } from "~/types/admin.types";
import { getDiscounts } from "./discount";
import { DiscountStatus } from "@shopify/discount-app-components";
import { VDConfigValue } from "~/defs";

export type CreateVDRequest = {
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

export type FindVolumeDiscount = {
  funcId: string;
  productId: string;
  collectionIds: string[];
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
                productIds: config.productIds,
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

  var metafield = respJson.data?.discountNode?.metafields?.nodes[0] ?? {};
  var config: Metafield & VDConfigValue = JSON.parse(
    respJson.data?.discountNode?.metafields?.nodes[0].value ?? "{}",
  );
  // if (respJson.data?.discountNode?.metafields.nodes?.length) {
  //   // console.log(
  //   //   "metafields: ",
  //   //   respJson.data?.discountNode?.metafields?.nodes[0],
  //   // );
  //   config = JSON.parse(
  //     respJson.data?.discountNode?.metafields?.nodes[0].value ?? "{}",
  //   );
  // }

  // console.log("config:  ", { ...config, ...metafield });

  return {
    id: respJson.data?.discountNode?.id,
    config: { ...config, ...metafield },
    discount: respJson.data?.discountNode?.discount,
  };
}

export async function findVolumeDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { funcId, productId, collectionIds }: FindVolumeDiscount,
) {
  var limit = 20;
  var after: string | null = null;
  var done = false;
  while (!done) {
    var resp = await getDiscounts(graphql, {
      limit,
      namespace: "$app:vol_discount",
      after: after,
    });

    var discounts = resp.data?.discountNodes.nodes;
    if (discounts) {
      for (let i = 0; i < (discounts?.length ?? 0); i++) {
        const d = discounts[i].discount;
        const m = discounts[i].metafields.edges;

        // console.log("Func id: ", funcId);
        // console.log("Discount: ", d);
        // console.log("Discount type: ", d.appDiscountType);

        if (
          d.appDiscountType?.functionId !== funcId ||
          d.status !== DiscountStatus.Active
        ) {
          continue;
        }

        if (d.appDiscountType.functionId == funcId && m.length) {
          var config: VDConfigValue = JSON.parse(m[0].node.value);
          if (config.applyType === "products") {
            if ((config.productIds ?? []).indexOf(productId) >= 0) {
              return discounts[i];
            }
          } else {
            if (collectionIds.indexOf(config.colId || "") >= 0) {
              return discounts[i];
            }
          }
        }
      }
    }

    after = resp.data?.discountNodes.pageInfo.endCursor ?? null;
    done = resp.data?.discountNodes.pageInfo.hasNextPage ?? false;
  }
  return null;
}

import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput, Metafield } from "~/types/admin.types";
import { getDiscounts } from "./discount";
import { DiscountStatus } from "@shopify/discount-app-components";
import { VDConfig } from "~/defs";
import { ProductInfo } from "~/components/SelectProduct";
import { CollectionInfo } from "~/components/SelectCollection";
import {
  gqlCreateDiscount,
  gqlGetDiscount,
  gqlUpdateDiscount,
} from "./gql_discount";

export type VDConfigExt = VDConfig & {
  id: string;
  products: Array<ProductInfo>;
  collection: CollectionInfo | null;
};

export type CreateVDRequest = {
  discount: DiscountAutomaticAppInput;
  config: VDConfig;
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
  req: CreateVDRequest,
) {
  // const resp = await graphql(
  //   `
  //     #graphql
  //     mutation createVolumeDiscount($discount: DiscountAutomaticAppInput!) {
  //       discountAutomaticAppCreate(automaticAppDiscount: $discount) {
  //         automaticAppDiscount {
  //           discountId
  //         }
  //         userErrors {
  //           code
  //           message
  //           field
  //         }
  //       }
  //     }
  //   `,
  //   {
  //     variables: {
  //       discount: {
  //         ...discount,
  //         metafields: [
  //           {
  //             namespace: "$app:vd",
  //             key: "vd_config",
  //             type: "json",
  //             value: JSON.stringify({
  //               label: config.label,
  //               applyType: config.applyType,
  //               steps: config.steps,
  //               colIds: config.colId,
  //               productIds: config.productIds,
  //             }),
  //           },
  //         ],
  //       },
  //     },
  //   },
  // );

  // const respJson = await resp.json();
  // return respJson.data;

  var resp = await gqlCreateDiscount(graphql, {
    discount: req.discount,
    metafield: {
      namespace: "$app:vd",
      key: "vd_config",
      type: "json",
      value: JSON.stringify(req.config),
    },
  });
  return resp;
}

export async function updateVolumeDiscount(
  graphql: GraphQLClient<AdminOperations>,
  req: UpdateVDRequest,
) {
  // if (configId && configValue) {
  //   data.metafields = [
  //     {
  //       id: configId,
  //       value: configValue,
  //     },
  //   ];
  // } else {
  //   data.metafields = undefined;
  // }

  // const resp = await graphql(
  //   `
  //     #graphql
  //     mutation updateVolumeDiscount(
  //       $id: ID!
  //       $data: DiscountAutomaticAppInput!
  //     ) {
  //       discountAutomaticAppUpdate(id: $id, automaticAppDiscount: $data) {
  //         automaticAppDiscount {
  //           discountId
  //           title
  //           startsAt
  //           endsAt
  //           status
  //         }
  //         userErrors {
  //           code
  //           field
  //           message
  //         }
  //       }
  //     }
  //   `,
  //   {
  //     variables: {
  //       id: `gid://shopify/DiscountAutomaticNode/${discountId}`,
  //       data: data,
  //     },
  //   },
  // );

  // const respJson = await resp.json();
  // return respJson.data;

  const respJson = await gqlUpdateDiscount(graphql, {
    discountId: req.discountId,
    data: req.data,
    config: {
      id: req.configId,
      value: req.configValue,
    },
  });
  // console.log("Config value: ", req.config);
  console.log("Response update volume discount: ", respJson);
  return respJson;
}

export async function getVolumeDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId }: GetVDRequest,
) {
  // var resp = await graphql(
  //   `
  //     #graphql
  //     query getVolumeDiscount($id: ID!) {
  //       discountNode(id: $id) {
  //         __typename
  //         id
  //         discount {
  //           ... on DiscountAutomaticApp {
  //             title
  //             status
  //             appDiscountType {
  //               title
  //               targetType
  //               functionId
  //               discountClass
  //             }
  //             combinesWith {
  //               orderDiscounts
  //               productDiscounts
  //               shippingDiscounts
  //             }
  //             startsAt
  //             endsAt
  //             createdAt
  //           }
  //         }
  //         metafields(first: 10, namespace: "$app:vd") {
  //           nodes {
  //             id
  //             value
  //           }
  //         }
  //       }
  //     }
  //   `,
  //   {
  //     variables: { id: `gid://shopify/DiscountAutomaticNode/${discountId}` },
  //   },
  // );
  // var respJson = await resp.json();

  var respJson = await gqlGetDiscount(graphql, discountId, "$app:vd");

  var metafield = respJson.data?.discountNode?.metafields?.nodes[0] ?? {};
  var config: Metafield & VDConfig = JSON.parse(
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
      namespace: "$app:vd",
      after: after,
    });

    var discounts = resp.data?.discountNodes.nodes;
    if (discounts) {
      for (let i = 0; i < (discounts?.length ?? 0); i++) {
        const d = discounts[i].discount;
        const m = discounts[i].metafields.edges;

        if (
          d.appDiscountType?.functionId !== funcId ||
          d.status !== DiscountStatus.Active
        ) {
          continue;
        }

        if (d.appDiscountType.functionId == funcId && m.length) {
          var config: VDConfig = JSON.parse(m[0].node.value);
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

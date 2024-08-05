import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import { SDConfig } from "~/defs";
import { ProductInfo } from "~/components/SelectProduct";
import { getSimleProductInfo, getSimpleCollection } from "./sfont";
import { CollectionInfo } from "~/components/SelectCollection";
import {
  gqlCreateDiscount,
  gqlGetDiscount,
  gqlUpdateDiscount,
} from "./gql_discount";

export type SDConfigExt = SDConfig & {
  id: string;
  products: Array<ProductInfo>;
  collections: Array<CollectionInfo>;
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
  // const resp = await graphql(
  //   `
  //     #graphql
  //     mutation createShippingDiscount($discount: DiscountAutomaticAppInput!) {
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
  //         ...req.discount,
  //         metafields: [
  //           {
  //             namespace: "$app:sd",
  //             key: "sd_config",
  //             type: "json",
  //             value: JSON.stringify(req.config),
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
      namespace: "$app:sd",
      key: "sd_config",
      type: "json",
      value: JSON.stringify(req.config),
    },
  });
  return resp;
}

export async function updateShippingDiscount(
  graphql: GraphQLClient<AdminOperations>,
  req: UpdateSDRequest,
) {
  const respJson = await gqlUpdateDiscount(graphql, {
    discountId: req.discountId,
    data: req.data,
    config: req.config,
  });
  // console.log("Config value: ", req.config);
  console.log("Response update shipping discount: ", respJson);
  return respJson;
}

export async function getShippingDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId }: GetSDRequest,
) {
  // var resp = await graphql(
  //   `
  //     #graphql
  //     query getShippingDiscount($id: ID!) {
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
  //         metafields(first: 10, namespace: "$app:sd") {
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

  var respJson = await gqlGetDiscount(graphql, discountId, "$app:sd");

  var metafield = respJson.data?.discountNode?.metafields?.nodes[0];
  var config: SDConfigExt = {
    id: metafield?.id,
    products: [],
    collections: [],
    ...JSON.parse(metafield?.value ?? "{}"),
  };
  for (const pid of config.productIds ?? []) {
    var pinfo = await getSimleProductInfo(graphql, pid);
    pinfo && config.products.push(pinfo);
  }

  for (const cid of config.collIds ?? []) {
    var cinfo = await getSimpleCollection(graphql, cid);
    cinfo && config.collections.push(cinfo);
  }

  return {
    id: respJson.data?.discountNode?.id,
    config: config,
    discount: respJson.data?.discountNode?.discount,
  };
}

import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput, Metafield } from "~/types/admin.types";
import { DiscountStatus } from "@shopify/discount-app-components";
import { VDConfig } from "~/defs";
import { ProductInfo } from "~/components/SelectProduct";
import { CollectionInfo } from "~/components/SelectCollection";
import {
  gqlCreateDiscount,
  gqlGetDiscount,
  gqlUpdateDiscount,
  gqlGetDiscounts,
} from "./gql_discount";

import { getSimleProductInfo, getSimpleCollection } from "./gql_resource";

export type VDConfigExt = VDConfig & {
  id: string;
  products: Array<ProductInfo>;
  colls: Array<CollectionInfo>;
};

export type CreateVDRequest = {
  discount: DiscountAutomaticAppInput;
  config: VDConfig;
  shop: string;
};

export type UpdateVDRequest = {
  discountId: string;
  discount: DiscountAutomaticAppInput;
  configId: string;
  config: VDConfig;
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
  var resp = await gqlCreateDiscount(graphql, {
    discount: req.discount,
    metafield: {
      namespace: "$app:vd",
      key: "vd_config",
      type: "json",
      value: JSON.stringify(req.config),
    },
    label: req.config.label,
    ftype: "product_discounts",
    shop: req.shop,
    subType: req.config.applyType,
    productIds: req.config.productIds ? req.config.productIds : [],
    collIds: req.config.collIds ? req.config.collIds : [],
  });
  return resp;
}

export async function updateVolumeDiscount(
  graphql: GraphQLClient<AdminOperations>,
  req: UpdateVDRequest,
) {
  const respJson = await gqlUpdateDiscount(graphql, {
    discountId: req.discountId,
    discount: req.discount,
    config: {
      id: req.configId,
      value: JSON.stringify(req.config),
    },
    label: req.config.label,
    subType: req.config.applyType,
    productIds: req.config.productIds ? req.config.productIds : [],
    collIds: req.config.collIds ? req.config.collIds : [],
  });
  console.log("Response update volume discount: ", respJson);
  return respJson;
}

export async function getVolumeDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId }: GetVDRequest,
) {
  var discount = await gqlGetDiscount(graphql, discountId, "$app:vd");

  var metafield = discount?.metafields?.nodes[0];
  var config: VDConfigExt = {
    id: metafield?.id ?? 0,
    products: [],
    colls: [],
    ...JSON.parse(discount?.metafields?.nodes[0].value ?? "{}"),
  };

  if (config.applyType === "collection" && config.collIds?.length) {
    for (let i = 0; i < config.collIds?.length; i++) {
      const collId = config.collIds[i];
      var coll = await getSimpleCollection(graphql, collId);
      coll && config.colls.push(coll);
    }
  }

  if (config.applyType === "products" && config.productIds?.length) {
    for (let i = 0; i < config.productIds.length; i++) {
      const pid = config.productIds[i];
      var product = await getSimleProductInfo(graphql, pid);
      product && config.products.push(product);
    }
  }

  return {
    config: config,
    discount: discount?.discount,
  };
}

// export async function findVolumeDiscount(
//   graphql: GraphQLClient<AdminOperations>,
//   { funcId, productId, collectionIds }: FindVolumeDiscount,
// ) {
//   var limit = 20;
//   var after: string | null = null;
//   var done = false;
//   while (!done) {
//     var resp = await gqlGetDiscounts(graphql, {
//       limit,
//       namespace: "$app:vd",
//       after: after,
//     });

//     var discounts = resp.data?.discountNodes.nodes;
//     if (discounts) {
//       for (let i = 0; i < (discounts?.length ?? 0); i++) {
//         const d = discounts[i].discount;
//         const m = discounts[i].metafields.edges;

//         if (
//           d.appDiscountType?.functionId !== funcId ||
//           d.status !== DiscountStatus.Active
//         ) {
//           continue;
//         }

//         if (d.appDiscountType.functionId == funcId && m.length) {
//           var config: VDConfig = JSON.parse(m[0].node.value);
//           if (config.applyType === "products") {
//             if ((config.productIds ?? []).indexOf(productId) >= 0) {
//               return discounts[i];
//             }
//           } else {
//             if (collectionIds.indexOf(config.colId || "") >= 0) {
//               return discounts[i];
//             }
//           }
//         }
//       }
//     }

//     after = resp.data?.discountNodes.pageInfo.endCursor ?? null;
//     done = resp.data?.discountNodes.pageInfo.hasNextPage ?? false;
//   }
//   return null;
// }

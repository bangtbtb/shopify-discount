import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import { ODConfig } from "~/defs";
import { getSimleProductInfo } from "./gql_resource";
import {
  gqlCreateDiscount,
  gqlGetDiscount,
  gqlUpdateDiscount,
} from "./gql_discount";
import { ProductInfo } from "~/components/Shopify/SelectProduct";

export type ODConfigExt = ODConfig & {
  id: string;
  products: Array<ProductInfo>;
};

export type CreateODRequest = {
  discount: DiscountAutomaticAppInput;
  config: ODConfig;
  shop: string;
};

export type UpdateODRequest = {
  discountId: string;
  discount: DiscountAutomaticAppInput;
  config: ODConfigExt;
};

export type GetODRequest = {
  discountId: string;
};

export async function createBundleDiscount(
  graphql: GraphQLClient<AdminOperations>,
  req: CreateODRequest,
) {
  var resp = await gqlCreateDiscount(graphql, {
    discount: req.discount,
    metafield: {
      namespace: "$app:od",
      key: "od_config",
      type: "json",
      value: JSON.stringify(req.config),
    },
    ftype: "order_discounts",
    label: req.config.label,
    subType: req.config.applyType,
    shop: req.shop,
    productIds: req.config.contain?.productIds
      ? req.config.contain?.productIds
      : [],
    collIds: [],
  });
  return resp;
}

export async function updateBundleDiscount(
  graphql: GraphQLClient<AdminOperations>,
  req: UpdateODRequest,
) {
  const respJson = await gqlUpdateDiscount(graphql, {
    discountId: req.discountId,
    discount: req.discount,
    config: req.config,
    label: req.config.label,
    subType: req.config.applyType,
    productIds: req.config.contain?.productIds
      ? req.config.contain?.productIds
      : [],
    collIds: [],
  });
  // console.log("Config value: ", req.config);
  return respJson;
}

export async function getBundleDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId }: GetODRequest,
) {
  var discount = await gqlGetDiscount(graphql, discountId, "$app:od");

  var metafield = discount?.metafields?.nodes[0];
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
    id: discount?.id,
    config: config,
    discount: discount?.discount,
  };
}

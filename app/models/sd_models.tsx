import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import { SDConfig } from "~/defs/discount";
import { getSimleProductInfo, getSimpleCollection } from "./gql_resource";
import {
  gqlCreateDiscount,
  gqlGetDiscount,
  gqlUpdateDiscount,
} from "./gql_discount";
import { ProductInfo } from "~/components/Shopify/SelectProduct";
import { CollectionInfo } from "~/components/Shopify/SelectCollection";
import { splitGQLId } from "./utils_id";

export type SDConfigExt = SDConfig & {
  id: string;
  products: Array<ProductInfo>;
  collections: Array<CollectionInfo>;
};

export type CreateSDRequest = {
  discount: DiscountAutomaticAppInput;
  config: SDConfig;
  shop: string;
  theme: string; // Theme gui
  content: string; // Theme content
  setting: string; // Theme setting
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
  var resp = await gqlCreateDiscount(graphql, {
    discount: req.discount,
    metafield: {
      namespace: "$app:beepify",
      key: "sd_config",
      type: "json",
      value: JSON.stringify(req.config),
    },
    type: req.config.applyType == "total" ? "ShippingTotal" : "ShippingVolume",
    shop: req.shop,
    label: req.config.label,
    productIds: req.config.productIds
      ? req.config.productIds.map((v) => splitGQLId(v))
      : [],
    collIds: req.config.collIds
      ? req.config.collIds.map((v) => splitGQLId(v))
      : [],
    theme: req.theme,
    content: req.content,
    setting: req.setting,
  });
  return resp;
}

export async function updateShippingDiscount(
  graphql: GraphQLClient<AdminOperations>,
  req: UpdateSDRequest,
) {
  const respJson = await gqlUpdateDiscount(graphql, {
    discountId: req.discountId,
    discount: req.data,
    config: req.config,
    label: req.config.label,
    subType: req.config.applyType,
    productIds: req.config.productIds
      ? req.config.productIds.map((v) => splitGQLId(v))
      : [],
    collIds: req.config.collIds
      ? req.config.collIds.map((v) => splitGQLId(v))
      : [],
  });
  // console.log("Config value: ", req.config);
  console.log("Response update shipping discount: ", respJson);
  return respJson;
}

export async function getShippingDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId }: GetSDRequest,
) {
  var discount = await gqlGetDiscount(graphql, discountId);
  var metafield = discount?.metafields?.nodes[0];
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
    id: discount?.id,
    config: config,
    discount: discount?.discount,
  };
}

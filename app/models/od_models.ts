import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import { ODConfig } from "~/defs/discount";
import { getSimleProductInfo } from "./gql_resource";
import {
  gqlCreateDiscount,
  gqlGetDiscount,
  gqlUpdateDiscount,
} from "./gql_discount";
import { ProductInfoBundle } from "~/components/Discounts/BundleTheme";
import { splitGQLId } from "./utils_id";

export type ODConfigExt = ODConfig & {
  id: string;
  products: Array<ProductInfoBundle>;
};

export type CreateODRequest = {
  discount: DiscountAutomaticAppInput;
  config: ODConfig;
  shop: string;
  theme: string; // Theme gui
  content: string; // Theme content
  setting: string; // Theme setting
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
      namespace: "$app:beepify",
      key: "od_config",
      type: "json",
      value: JSON.stringify(req.config),
    },
    type: req.config.applyType === "bundle" ? "Bundle" : "Total",
    label: req.config.label,
    shop: req.shop,
    productIds: req.config.bundle?.productIds
      ? req.config.bundle?.productIds.map((v) => splitGQLId(v))
      : [],
    collIds: [],
    theme: req.theme,
    content: req.content,
    setting: req.setting,
  });
  return resp;
}

export type UpdateODRequest = {
  discountId: string;
  discount: DiscountAutomaticAppInput;
  config: ODConfigExt;
};

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
    productIds: req.config.bundle?.productIds
      ? req.config.bundle?.productIds.map((v) => splitGQLId(v))
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
  var discount = await gqlGetDiscount(graphql, discountId);

  var metafield = discount?.metafields?.nodes[0];
  var config: ODConfigExt = {
    id: metafield?.id,
    products: [],
    ...JSON.parse(metafield?.value ?? "{}"),
  };

  if (config.bundle?.productIds.length) {
    for (let i = 0; i < config.bundle.productIds.length; i++) {
      var p = await getSimleProductInfo(graphql, config.bundle.productIds[i]);
      p &&
        config.products.push({
          ...p,
          requireVol: config.bundle.numRequires[i],
        });
    }
  }

  return {
    id: discount?.id,
    config: config,
    discount: discount?.discount,
  };
}

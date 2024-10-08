import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput } from "~/types/admin.types";
import { PDConfig } from "~/defs/discount";
import { ProductInfo } from "~/components/Shopify/SelectProduct";
import { CollectionInfo } from "~/components/Shopify/SelectCollection";
import {
  gqlCreateDiscount,
  gqlGetDiscount,
  gqlUpdateDiscount,
} from "./gql_discount";
import { splitGQLId } from "./utils_id";

export type PDConfigExt = PDConfig & {
  id: string;
  products: Array<ProductInfo>;
  colls: Array<CollectionInfo>;
  theme?: string; // json string
};

export type CreateVDRequest = {
  discount: DiscountAutomaticAppInput;
  config: PDConfig;
  shop: string;
  theme: string;
  content: string;
  setting: string;
};

export type UpdateVDRequest = {
  discountId: string;
  discount: DiscountAutomaticAppInput;
  configId: string;
  config: PDConfig;
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
  if (!req.config.volume) {
    throw new Error("Missing volume discount config in PDConfig", {});
  }

  var resp = await gqlCreateDiscount(graphql, {
    discount: req.discount,
    metafield: {
      namespace: "$app:beepify",
      key: "pd_config",
      type: "json",
      value: JSON.stringify(req.config),
    },
    label: req.config.label,
    type: "Volume",
    shop: req.shop,
    productIds: req.config.volume.productIds
      ? req.config.volume.productIds.map((v) => splitGQLId(v))
      : [],
    collIds: req.config.volume.collIds
      ? req.config.volume.collIds.map((v) => splitGQLId(v))
      : [],
    theme: req.theme,
    content: req.content,
    setting: req.setting,
  });
  return resp;
}

export async function updateVolumeDiscount(
  graphql: GraphQLClient<AdminOperations>,
  req: UpdateVDRequest,
) {
  if (!req.config.volume) {
    throw new Error("Missing volume discount config in PDConfig", {});
  }
  const respJson = await gqlUpdateDiscount(graphql, {
    discountId: req.discountId,
    discount: req.discount,
    config: {
      id: req.configId,
      value: JSON.stringify(req.config),
    },
    label: req.config.label,
    subType: req.config.applyType,
    productIds: req.config.volume.productIds
      ? req.config.volume.productIds.map((v) => splitGQLId(v))
      : [],
    collIds: req.config.volume.collIds
      ? req.config.volume.collIds.map((v) => splitGQLId(v))
      : [],
  });
  console.log("Response update volume discount: ", respJson);
  return respJson;
}

export async function getVolumeDiscount(
  graphql: GraphQLClient<AdminOperations>,
  { discountId }: GetVDRequest,
) {
  var discount = await gqlGetDiscount(graphql, discountId);

  var metafield = discount?.metafields?.nodes[0];
  var config: PDConfigExt = {
    id: metafield?.id ?? 0,
    products: [],
    colls: [],
    ...JSON.parse(discount?.metafields?.nodes[0].value ?? "{}"),
  };

  // if (config.applyType === "collection" && config.collIds?.length) {
  //   for (let i = 0; i < config.collIds?.length; i++) {
  //     const collId = config.collIds[i];
  //     var coll = await getSimpleCollection(graphql, collId);
  //     coll && config.colls.push(coll);
  //   }
  // }

  // if (config.applyType === "products" && config.productIds?.length) {
  //   for (let i = 0; i < config.productIds.length; i++) {
  //     const pid = config.productIds[i];
  //     var product = await getSimleProductInfo(graphql, pid);
  //     product && config.products.push(product);
  //   }
  // }

  return {
    config: config,
    discount: discount?.discount,
  };
}

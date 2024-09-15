import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { DiscountAutomaticAppInput, MetafieldInput } from "~/types/admin.types";
import { dbCreateDiscount, dbUpdateDiscount } from "./db_discount";
import { ADT } from "@prisma/client";

export type FuncType =
  | "product_discounts"
  | "order_discounts"
  | "shipping_discounts";

type GetFuncRequest = {
  apiType?: FuncType;
};

var mapFuncType = new Map<FuncType, ADT>([
  ["product_discounts", "Volume"],
  ["order_discounts", "Bundle"],
  ["shipping_discounts", "Shipping"],
]);

export async function gqlGetFunction(
  graphql: GraphQLClient<AdminOperations>,
  { apiType }: GetFuncRequest,
) {
  var resp = await graphql(
    `
      #grapql
      query gqlGetFunction($apiType: String) {
        shopifyFunctions(first: 20, apiType: $apiType) {
          nodes {
            id
            title
            apiType
          }
        }
      }
    `,
    {
      variables: {
        apiType: apiType,
      },
    },
  );
  var respJson = await resp.json();
  return respJson.data?.shopifyFunctions.nodes;
}

export type GqlCreateDiscountRequest = {
  discount: DiscountAutomaticAppInput;
  metafield: MetafieldInput;
  label: string;
  ftype: FuncType;
  subType: string;
  productIds: string[];
  collIds: string[];
  shop: string;
};

export async function gqlCreateDiscount(
  graphql: GraphQLClient<AdminOperations>,
  req: GqlCreateDiscountRequest,
) {
  var funcs = await gqlGetFunction(graphql, {
    apiType: req.ftype,
  });

  if (!funcs?.length) {
    console.log("Discount function is empty");
    return {
      automaticAppDiscount: null,
      userErrors: [{ message: "Bundle discount function not found" }],
    };
  }

  req.discount.functionId = funcs[0].id;
  req.discount.startsAt = new Date(req.discount.startsAt);
  if (req.discount.endsAt) {
    req.discount.endsAt = new Date(req.discount.endsAt);
  }

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
          ...req.discount,
          metafields: [req.metafield],
        },
      },
    },
  );

  const respJson = await resp.json();
  const rsDiscount =
    respJson?.data?.discountAutomaticAppCreate?.automaticAppDiscount;
  if (rsDiscount) {
    await dbCreateDiscount({
      id: rsDiscount.discountId,
      shop: req.shop,
      metafield: req.metafield.value ?? "",
      status: rsDiscount.status,
      title: rsDiscount.title ?? "",
      label: req.label,
      type: mapFuncType.get(req.ftype) ?? "None",
      subType: req.subType,
      startAt: new Date(rsDiscount.startsAt),
      endAt: rsDiscount.endsAt ? new Date(rsDiscount.endsAt) : null,
      createdAt: new Date(),
      productIds: req.productIds ? req.productIds : [],
      collectionIds: req.collIds ? req.collIds : [],
    });
  }
  return respJson.data?.discountAutomaticAppCreate;
}

export type GqlUpdateDiscountRequest = {
  discountId: string;
  discount: DiscountAutomaticAppInput;
  config: MetafieldInput;
  label: string;
  subType: string;
  productIds: string[];
  collIds: string[];
};

export async function gqlUpdateDiscount(
  graphql: GraphQLClient<AdminOperations>,
  req: GqlUpdateDiscountRequest,
) {
  if (req.config.id) {
    if (!req.config.value) {
      req.config.value = JSON.stringify(req.config);
    }
    req.discount.metafields = [
      {
        id: req.config.id,
        value: req.config.value,
      },
    ];
    // console.log("Metafield update: ", req.config);
  } else {
    req.discount.metafields = undefined;
    console.log("Metafield has no id: ", req.config);
  }

  if (req.discount.startsAt) {
    req.discount.startsAt = new Date(req.discount.startsAt);
  }

  if (req.discount.endsAt) {
    req.discount.endsAt = new Date(req.discount.endsAt);
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
        data: req.discount,
      },
    },
  );

  const respJson = await resp.json();
  var rs = respJson.data?.discountAutomaticAppUpdate;
  const rsDiscount = rs?.automaticAppDiscount;
  if (!rs?.userErrors.length && rsDiscount) {
    await dbUpdateDiscount(rsDiscount.discountId, {
      title: rsDiscount.title,
      status: rsDiscount.status,
      subType: req.subType,
      metafield: req.config.value ?? undefined,
      collectionIds: req.collIds ? req.collIds : [],
      productIds: req.productIds ? req.productIds : [],
      startAt: new Date(rsDiscount.startsAt),
      endAt: rsDiscount.endsAt ? new Date(rsDiscount.endsAt) : null,
    });
  }
  return rs;
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
  return respJson.data?.discountNode;
}

export async function gqlDelDiscount(
  graphql: GraphQLClient<AdminOperations>,
  discountId: string,
) {
  var resp = await graphql(
    `
      #graphql
      mutation gqlDelDiscount($id: ID!) {
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
  return respJson.data;
}
type GetDiscount = {
  limit: number;
  namespace: string;
  after: string | null;
};

export async function gqlGetDiscounts(
  graphql: GraphQLClient<AdminOperations>,
  { limit, namespace, after }: GetDiscount,
) {
  var resp = await graphql(
    `
      query gqlGetDiscounts($limit: Int!, $after: String, $namespace: String) {
        discountNodes(first: $limit, after: $after) {
          nodes {
            id
            discount {
              ... on DiscountAutomaticApp {
                title
                startsAt
                status
                discountClass
                appDiscountType {
                  title
                  functionId
                }
              }
            }
            metafields(first: 10, namespace: $namespace) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `,
    {
      variables: {
        limit,
        after,
        namespace,
      },
    },
  );
  var respJson = await resp.json();
  return respJson;
}

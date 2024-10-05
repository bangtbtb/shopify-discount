import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import {
  DiscountAutomaticApp,
  DiscountAutomaticAppInput,
  DiscountUserError,
  Maybe,
  MetafieldInput,
} from "~/types/admin.types";
import { dbCreateDiscount, dbUpdateDiscount } from "./db_discount";
import { ADT, DiscountTheme, Prisma } from "@prisma/client";
import { splitGQLId } from "./utils_id";

export type FuncType =
  | "product_discounts"
  | "order_discounts"
  | "shipping_discounts";

type GetFuncRequest = {
  apiType?: FuncType;
};

var mapFuncType = new Map<ADT, FuncType>([
  ["Volume", "product_discounts"],
  ["Recommend", "product_discounts"],
  ["Total", "order_discounts"],
  ["Bundle", "order_discounts"],
  ["ShippingVolume", "shipping_discounts"],
  ["ShippingTotal", "shipping_discounts"],
]);

export type GQLDiscountResponse = Maybe<
  Pick<
    DiscountAutomaticApp,
    "discountId" | "status" | "startsAt" | "endsAt" | "title"
  >
>;

export type GQLDiscountError = Array<
  Pick<DiscountUserError, "code" | "message" | "field">
>;

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
  type: ADT;
  productIds: string[];
  collIds: string[];
  shop: string;
  theme: string;
  content: string;
  setting: string;
};

export async function gqlCreateDiscount(
  graphql: GraphQLClient<AdminOperations>,
  req: GqlCreateDiscountRequest,
) {
  const fType = mapFuncType.get(req.type);
  if (!fType) {
    return null;
  }

  var funcs = await gqlGetFunction(graphql, {
    apiType: fType,
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
      id: splitGQLId(rsDiscount.discountId),
      shop: req.shop,
      metafield: req.metafield.value ?? "",
      status: rsDiscount.status,
      title: rsDiscount.title ?? "",
      label: req.label,
      type: req.type,
      startAt: new Date(rsDiscount.startsAt),
      endAt: rsDiscount.endsAt ? new Date(rsDiscount.endsAt) : null,
      createdAt: new Date(),
      productIds: req.productIds ? req.productIds : [],
      collectionIds: req.collIds ? req.collIds : [],
      Theme: {
        create: {
          shop: req.shop,
          theme: req.theme,
          content: req.content,
          setting: req.setting,
        },
      },
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
      metafield: req.config.value ?? undefined,
      collectionIds: req.collIds ? req.collIds : [],
      productIds: req.productIds ? req.productIds : [],
      startAt: new Date(rsDiscount.startsAt),
      endAt: rsDiscount.endsAt ? new Date(rsDiscount.endsAt) : null,
    });
  }
  return rs;
}

export type GqlDiscountChangeStatusRequest = {
  discountId: string; // Not gql id
  shop: string;
  isActive: boolean;
  startsAt: string;
  endsAt?: string;
};

export async function gqlDiscountChangeStatus(
  graphql: GraphQLClient<AdminOperations>,
  req: GqlDiscountChangeStatusRequest,
) {
  var now = new Date();
  var nowTime = now.getTime();
  var startsAtDate = new Date(req.startsAt);
  var endsAtDate = req.endsAt ? new Date(req.endsAt) : null;

  if (req.isActive) {
    if (startsAtDate.getTime() > nowTime) startsAtDate = now;
    if (endsAtDate && endsAtDate?.getTime() <= nowTime) {
      endsAtDate = null;
    }
  } else {
    endsAtDate = now;
  }

  const resp = await graphql(
    `
      #graphql
      mutation gqlDiscountChangeStatus(
        $id: ID!
        $data: DiscountAutomaticAppInput!
      ) {
        discountAutomaticAppUpdate(id: $id, automaticAppDiscount: $data) {
          automaticAppDiscount {
            discountId
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
        data: {
          startsAt: startsAtDate,
          endsAt: endsAtDate,
        } as DiscountAutomaticAppInput,
      },
    },
  );

  const respJson = await resp.json();
  var rs = respJson.data?.discountAutomaticAppUpdate;
  const rsDiscount = rs?.automaticAppDiscount;
  if (!rs?.userErrors.length && rsDiscount) {
    await dbUpdateDiscount(rsDiscount.discountId, {
      status: rsDiscount.status,
      startAt: new Date(rsDiscount.startsAt),
      endAt: rsDiscount.endsAt ? new Date(rsDiscount.endsAt) : null,
    });
  }
  return rs;
}

export async function gqlGetDiscount(
  graphql: GraphQLClient<AdminOperations>,
  discountId: string,
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
        namespace: "$app:beepify",
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

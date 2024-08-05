import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";

type FuncType = "product_discounts" | "order_discounts" | "shipping_discounts";

type GetFuncRequest = {
  apiType?: FuncType;
};

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

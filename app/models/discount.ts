import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";

type GetDiscount = {
  limit: number;
  namespace: string;
  after: string | null;
};

export async function getDiscounts(
  graphql: GraphQLClient<AdminOperations>,
  { limit, namespace, after }: GetDiscount,
) {
  var resp = await graphql(
    `
      query getDiscounts($limit: Int!, $after: String, $namespace: String) {
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

import { AdminOperations } from "@shopify/admin-api-client";
import { StorefrontOperations } from "@shopify/storefront-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { CollectionInfo } from "~/components/SelectCollection";

export async function getSimleProductInfo(
  // graphql: GraphQLClient<StorefrontOperations>,

  graphql: GraphQLClient<AdminOperations>,
  id: string,
) {
  var resp = await graphql(
    `
      #graphql
      query getSimpleProduct($id: ID!) {
        product(id: $id) {
          id
          title
          images(first: 1) {
            nodes {
              id
              altText
              url
            }
          }
        }
      }
    `,
    {
      variables: {
        id: id,
      },
    },
  );
  var respJson = await resp.json();
  if (respJson.data?.product) {
    return {
      id: respJson.data?.product?.id,
      title: respJson.data?.product?.title,
      image: respJson.data?.product?.images.nodes[0].url ?? "",
      imageAlt: respJson.data?.product?.images.nodes[0].altText ?? "",
    };
  }
  return null;
}

export async function getSimpleCollection(
  // graphql: GraphQLClient<StorefrontOperations>,
  graphql: GraphQLClient<AdminOperations>,
  id: string,
) {
  var resp = await graphql(
    `
      #graphql
      query getSimpleCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          image {
            url
            altText
          }
        }
      }
    `,
    {
      variables: {
        id: id,
      },
    },
  );

  var respJson = await resp.json();
  if (respJson.data?.collection) {
    return {
      id: respJson.data?.collection?.id,
      title: respJson.data?.collection?.title,
      image: respJson.data?.collection?.image?.url ?? "",
      imageAlt: respJson.data?.collection?.image?.altText ?? "",
    };
  }
  return null;
}

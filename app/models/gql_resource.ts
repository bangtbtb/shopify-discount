import { AdminOperations } from "@shopify/admin-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";

export async function getSimleProductInfo(
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
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 30) {
            edges {
              node {
                id
                price
              }
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
      priceRangeV2: respJson.data?.product?.priceRangeV2,
      minPrice: respJson.data?.product?.priceRangeV2.minVariantPrice,
      maxPrice: respJson.data?.product?.priceRangeV2.maxVariantPrice,
      variants: respJson.data.product.variants.edges.map((v) => v.node),
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

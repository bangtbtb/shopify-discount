import { getGraphqlProductId, splitGQLId } from "~/models/utils_id";
import { ProductInfo } from "./SelectProduct";

// Example:      loadProduct(["7256919801929", "7265339179081"]);
export async function bridgeLoadProduct(
  productIds: string[],
  nVariant?: number,
) {
  var ids = productIds.map((v) => {
    var idx = v.indexOf("gid:/");
    return idx >= 0 ? splitGQLId(v) : v;
  });

  const res = await fetch("shopify:admin/api/graphql.json", {
    method: "POST",
    body: JSON.stringify({
      query: `#graphql
        query bridgeGetProduct($take: Int!, $query: String!, $nVariant: Int! ) {
          products(first: $take,  query: $query) {
            edges {
              node {
                id
                handle
                description
                images (first: 1) {
                  edges {
                    node {
                      id
                      url
                      altText
                    }
                  }
                }
                variants(first: $nVariant) {
                  edges {
                    node {
                      id
                      price
                      displayName
                    }
                  }
                }
              }
            }
          }
        }`,
      variables: {
        take: productIds.length,
        query: productIds.map((v) => `(id:${v})`).join(" OR "),
        nVariant: nVariant == undefined ? 0 : nVariant,
      },
    }),
  });

  const { data } = await res.json();
  const products: ProductInfo[] =
    data?.products?.edges?.map((v: any) =>
      v?.node
        ? ({
            ...v.node,
            image: v.node.images?.edges?.length
              ? v.node.images?.edges[0].node.url
              : undefined,
            imageAlt: v.node.images?.edges?.length
              ? v.node.images?.edges[0].node.altText
              : undefined,
            images: v.node.images?.edges?.map((v: any) => v.node),
            variants: v.node.variants?.edges?.map((v: any) => v.node),
          } as ProductInfo)
        : null,
    ) || null;
  console.log("Products: ", products);

  return products;
}

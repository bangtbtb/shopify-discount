import { ActionFunctionArgs, json } from "@remix-run/node";
import { StorefrontOperations } from "@shopify/storefront-api-client";
import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import { dbFindBundleDiscount } from "~/models/db_discount";
import { getSimleProductInfo } from "~/models/gql_resource";
import { authenticate, unauthenticated } from "~/shopify.server";

type RequestPayload = {
  pid: string;
  cids: Array<string>;
};
export async function sfGetProductInfo(
  graphql: GraphQLClient<StorefrontOperations>,
  id: string,
) {
  var resp = await graphql(
    `
      #graphql
      query sfGetProductInfo($id: ID!) {
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
      priceRangeV2: respJson.data?.product.priceRangeV2,
    };
  }
  return null;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log(`------------------- Call pick bundle discount`);
  const { session, admin } = await authenticate.public.appProxy(request);

  var payload: RequestPayload = await request.json();
  console.log("Bunble form data: ", payload);
  if (payload.pid) {
    payload.pid = "gid://shopify/Product/" + payload.pid;
  }

  if (payload.cids && payload.cids.length) {
    payload.cids = payload.cids.map((v) => "gid://shopify/Collection/" + v);
  }

  var ds = await dbFindBundleDiscount({
    shop: session?.shop || "",
    productId: payload.pid,
    collectionIds: payload.cids,
  });

  if (ds.length) {
    var products = [];

    if (admin?.graphql) {
      try {
        for (const pid of ds[0].productIds) {
          console.log("Get product id : ", pid);
          var p = await getSimleProductInfo(admin.graphql, pid);
          console.log("Get product: ", p);
          products.push(p);
        }
      } catch (error) {
        console.log("Get product error: ", error);
      }
    } else {
      console.log("Bundle storefront is null");
    }
    var rs = { ...JSON.parse(ds[0].metafield), title: ds[0].title, products };
    console.log("Response of pick d: ", rs);

    return json(rs);
  }

  return json({});
};

import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log(`------------------- Call loader proxy`);
  const { admin, session } = await authenticate.public.appProxy(request);
  return json({
    content: "hello",
    shop: session?.shop,
    id: session?.id || "no_id",
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log(`------------------- Call action proxy`);
  if (request.method.toLocaleLowerCase() == "get") {
    console.log("Return empty");

    return json({ abc: "def" });
  }

  const { admin, liquid } = await authenticate.public.appProxy(request);

  var resp = await admin?.graphql(
    `#graphql
query getDiscounts {
  discountNodes(first: 20) {
    nodes {
      id
      discount {
        __typename
        ... on DiscountAutomaticApp{
          title
          startsAt
          status
          combinesWith {
            orderDiscounts
            productDiscounts
            shippingDiscounts
          }
          appDiscountType {
            targetType
            title
          }
        }
      }
      metafields(first: 1, namespace: "$app:vol_discount") {
         edges {
          node {
            id
            value
          }
        }
      }
    }
	}
}`,
    {},
  );
  var respJson = await resp?.json();
  var discounts = respJson?.data?.discountNodes?.nodes;
  console.log("Discount: ", discounts);
  // return liquid()
  return json({
    discounts: discounts,
  });
};

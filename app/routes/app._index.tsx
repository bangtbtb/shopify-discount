import { useEffect, useState } from "react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { Page, Layout, Text, Card } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { dbGetDiscounts } from "~/models/db_discount";
import { DiscountTable } from "~/components/DiscountTable";
import { Discount } from "@prisma/client";

// type LoaderType = {
//   total: number;
//   page: number;
//   discounts: Discount[];
// };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const { searchParams } = new URL(request.url);
  const { session } = await authenticate.admin(request);

  const page = Number.parseInt(searchParams.get("page") || "") || 1;

  const { total, discounts } = await dbGetDiscounts({
    shop: session.shop,
    page,
  });

  return json({ total, page, discounts });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const { total, page, discounts } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  const [loadSuccess, setLoadSuccess] = useState(false);

  const nav = useNavigate();
  const loc = useLocation();

  const onClickDiscount = (d: SerializeFrom<Discount>) => {
    var dt = d.type === "Bundle" ? "od" : d.type === "Volume" ? "vd" : "sd";
    var idxSplash = d.id.lastIndexOf("/");
    nav(`/app/${dt}/${d.id.slice(idxSplash + 1)}`);
  };

  useEffect(() => {
    setLoadSuccess(true);
  }, [loadSuccess]);

  return (
    <Page
      actionGroups={[
        {
          title: "Create discount",
          actions: [
            {
              content: "Bundle",
              onAction: () => {
                nav("/app/od/new");
              },
            },
            {
              content: "Volume",
              onAction: () => {
                nav("/app/vd/new");
              },
            },
            {
              content: "Shipping",
              onAction: () => {
                nav("/app/sd/new");
              },
            },
          ],
        },
      ]}
    >
      <Layout.Section>
        {loadSuccess && discounts && (
          <DiscountTable
            discounts={discounts ?? []}
            onClick={onClickDiscount}
          />
        )}
      </Layout.Section>
      <Layout.Section>
        <Text as="h2">Performance</Text>
        {/* <Card></Card> */}
      </Layout.Section>
    </Page>
  );
}

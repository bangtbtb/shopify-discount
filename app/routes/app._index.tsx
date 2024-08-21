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
import { Page, Layout, Text, Card, Box } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { dbGetDiscounts } from "~/models/db_discount";
import { DiscountTable } from "~/components/DiscountTable";
import { Discount } from "@prisma/client";

import { randomNumber } from "~/models/utils";
import { LineChart } from "~/components/Chart";

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

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Chart.js Line Chart",
      },
    },
  };

  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
        data: labels.map(() => randomNumber()),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Dataset 2",
        data: labels.map(() => randomNumber()),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
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
        <Box minHeight="300" width="300">
          <LineChart data={data} options={options} />
        </Box>
        <Card></Card>
      </Layout.Section>
    </Page>
  );
}

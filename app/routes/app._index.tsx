import { useEffect, useState } from "react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Text,
  Card,
  InlineGrid,
  Box,
  InlineStack,
  Button,
  BlockStack,
  Icon,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { dbGetDiscounts } from "~/models/db_discount";
import { FunnelCustomTable } from "~/components/Discounts/FunnelTable";
import { Discount } from "@prisma/client";
import LineDataPointChart from "~/components/DiscountChart/LineDataPointChart";
import {
  OrderAppliedValueChart,
  OrderReportParsed,
  parseOrderReports,
} from "~/components/DiscountChart/OrderAppliedChart";
import { getOrdersReport, OrdersReport } from "~/models/db_applied";
import { dayDuration } from "~/models/utils";
import { format as dateFormat } from "date-fns";
import {
  Analytics,
  dbGetShopDiscountAnalytics,
} from "~/models/db_dc_analytics";

import { StatusActiveIcon, StatusIcon } from "@shopify/polaris-icons";
import { SeriesDP } from "~/defs/gui";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  var now = new Date();
  var from = new Date();
  from.setTime(now.getTime() - 190 * dayDuration);

  const shopAnalytics = await dbGetShopDiscountAnalytics({
    from: from,
    to: now,
    groupInterval: "month",
    shop: session.shop,
  });

  const { discounts } = await dbGetDiscounts({
    shop: session.shop,
    page: 1,
  });

  const orderReport = await getOrdersReport({
    shop: session.shop,
    groupInterval: "month",
    from: new Date(dateFormat(from, "yyyy-MM-dd")),
    to: now,
  });

  return json({
    discounts,
    orderReport,
    shopAnalytics,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const { discounts, shopAnalytics, orderReport } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const nav = useNavigate();

  // const loc = useLocation();
  // const isLoading =
  //   ["loading", "submitting"].includes(fetcher.state) &&
  //   fetcher.formMethod === "POST";

  const onClickDiscount = (d: SerializeFrom<Discount>) => {
    nav(`/app/dcs/${d.id}`);
  };

  return (
    <Page title="BootsSell">
      <BlockStack gap={"600"}>
        <WelcomCard />
        <FunnelOverview
          orderReport={orderReport}
          shopAnalytics={shopAnalytics}
        />
        <BlockStack gap={"300"}>
          <Text as="h2" variant="headingSm">
            Funnel dashboard
          </Text>
          <FunnelCustomTable discounts={discounts} />
        </BlockStack>
      </BlockStack>
    </Page>
  );
}

type WelcomCardProps = {};

function WelcomCard({}: WelcomCardProps) {
  return (
    <Card>
      <BlockStack gap={"400"}>
        <BlockStack gap={"200"}>
          <Text as="h2" variant="headingSm">
            Welcome to Your Sales Boosting Journey!
          </Text>

          <Text as="p" variant="bodyMd">
            Easily create your first funnel to boost sales in just a few clicks.
            Follow these steps to get started:
          </Text>
        </BlockStack>

        <InlineStack align="start" aria-colcount={2} gap={"100"}>
          <Box width="28">
            <Icon source={StatusActiveIcon} tone="success" />
          </Box>
          <Text as="p" variant="bodyMd">
            Create your first funnel
          </Text>
        </InlineStack>

        <InlineStack align="start" aria-colcount={2} gap={"100"}>
          <Box width="20">
            <Icon source={StatusIcon} tone="base" />
          </Box>

          <BlockStack gap={"200"}>
            <Text as="p" variant="bodyMd">
              Customize the Design
            </Text>

            <Text as="p" variant="bodyMd">
              Adjust the design to match your store's color scheme and branding.
            </Text>
            <Box>
              <Button>Customize</Button>
            </Box>
          </BlockStack>
        </InlineStack>

        <InlineStack>
          <Box>
            <Icon source={StatusIcon} tone="base" />
          </Box>
          <Text as="p" variant="bodyMd">
            Preview in Your Store
          </Text>
        </InlineStack>

        {/* </CalloutCard> */}
      </BlockStack>
    </Card>
  );
}

type FunnelOverviewProps = {
  orderReport?: OrdersReport[];
  shopAnalytics: SerializeFrom<Analytics[]>;
  // view: SerializeFrom<SeriesDP[]>;
};

function FunnelOverview({ shopAnalytics, orderReport }: FunnelOverviewProps) {
  const [views, setViews] = useState(
    shopAnalytics.map(
      (v) => ({ data: Number(v.views), date: v.date }) as SeriesDP,
    ),
  );

  const [clicks, setClicks] = useState(
    shopAnalytics.map(
      (v) => ({ data: Number(v.addCart), date: v.date }) as SeriesDP,
    ),
  );

  useEffect(() => {
    orderReport && setOrderReportParsed(parseOrderReports(orderReport));
  }, [orderReport]);

  const [orderReportParsed, setOrderReportParsed] =
    useState<OrderReportParsed | null>(null);

  useEffect(() => {
    setViews(
      shopAnalytics.map(
        (v) => ({ data: Number(v.views), date: v.date }) as SeriesDP,
      ),
    );

    setClicks(
      shopAnalytics.map(
        (v) => ({ data: Number(v.addCart), date: v.date }) as SeriesDP,
      ),
    );
  }, [shopAnalytics]);

  return (
    <BlockStack gap={"300"}>
      <Text as="h2" variant="headingSm">
        Funnel Overview
      </Text>

      <InlineStack gap={"300"}>
        <Button>Today</Button>
        <Button>Compare to: Yesterday</Button>
      </InlineStack>

      <InlineGrid gap={"400"} columns={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}>
        <Card>
          <LineDataPointChart data={views} title="Funnel View" />
        </Card>

        <Card>
          <LineDataPointChart data={clicks} title="Funnel click" />
        </Card>

        <Card>
          {orderReportParsed ? (
            <OrderAppliedValueChart
              title="Order value chart"
              labels={orderReportParsed.labels}
              appliedValue={orderReportParsed.appliedValue}
              unappliedValue={orderReportParsed.unappliedValue}
            />
          ) : (
            <></>
          )}
        </Card>
      </InlineGrid>
    </BlockStack>
  );
}

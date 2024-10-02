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
  Layout,
  Text,
  Card,
  InlineGrid,
  Box,
  InlineStack,
  Button,
  BlockStack,
  CalloutCard,
  Icon,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { dbGetDiscounts } from "~/models/db_discount";
import { DiscountTable } from "~/components/Discounts/DiscountTable";
import { Discount } from "@prisma/client";
import LineDataPointChart from "~/components/DiscountChart/LineDataPointChart";
import {
  OrderAppliedCounterChart,
  OrderAppliedValueChart,
  OrderReportParsed,
  parseOrderReports,
} from "~/components/DiscountChart/OrderAppliedChart";
import { getOrdersReport } from "~/models/db_applied";
import { dayDuration } from "~/models/utils";
import { format as dateFormat } from "date-fns";
import { dbGetShopDiscountView } from "~/models/db_dc_view";

import EasyIcon from "public/assets/easy.svg";
import { StatusActiveIcon, StatusIcon } from "@shopify/polaris-icons";
import { SeriesDP } from "~/defs/gui";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // const { searchParams } = new URL(request.url);
  // const page = Number.parseInt(searchParams.get("page") || "") || 1;

  var now = new Date();
  var from = new Date();
  from.setTime(now.getTime() - 190 * dayDuration);

  const discountView = await dbGetShopDiscountView({
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
    discountView,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const { discounts, discountView, orderReport } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const nav = useNavigate();

  // const loc = useLocation();
  // const isLoading =
  //   ["loading", "submitting"].includes(fetcher.state) &&
  //   fetcher.formMethod === "POST";

  const [orderReportParsed, setOrderReportParsed] =
    useState<OrderReportParsed | null>(null);

  const onClickDiscount = (d: SerializeFrom<Discount>) => {
    nav(`/app/dcs/${d.id}`);
  };

  useEffect(() => {
    orderReport && setOrderReportParsed(parseOrderReports(orderReport));
  }, [orderReport]);

  return (
    <Page title="BootsSell">
      {/* Overview discount status was applied */}
      <Layout.Section variant="fullWidth">
        <Box paddingBlockEnd={"600"}>
          {/* <WelcomCard />
          <FunnelOverview view={discountView} /> */}

          <Text as="h2" variant="headingLg">
            Overview
          </Text>
        </Box>

        <InlineGrid gap={"400"} columns={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}>
          <Card>
            <LineDataPointChart
              data={discountView}
              title="Total Discount View"
            />
            {/* <Text as="p">dfdf</Text> */}
          </Card>
          <Card>
            {orderReportParsed ? (
              <OrderAppliedCounterChart
                title="Order counter chart"
                labels={orderReportParsed.labels}
                appliedValue={orderReportParsed.appliedValue}
                unappliedValue={orderReportParsed.unappliedValue}
              />
            ) : (
              <></>
            )}
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
      </Layout.Section>

      <Layout.Section>
        <Box paddingBlockEnd={"400"}>
          <InlineStack align="space-between">
            <Text as="h2" variant="headingLg">
              Recent discount
            </Text>

            <Button
              variant="primary"
              onClick={() => nav("/app/dcs/create_select")}
            >
              Create new
            </Button>
          </InlineStack>
        </Box>
        <DiscountTable discounts={discounts ?? []} onClick={onClickDiscount} />
      </Layout.Section>
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
  view: SerializeFrom<SeriesDP[]>;
};

function FunnelOverview({ view }: FunnelOverviewProps) {
  return (
    <BlockStack gap={"300"}>
      <Text as="h2" variant="headingSm">
        Funnel Overview
      </Text>

      <InlineGrid>
        <Button>Today</Button>
        <Button>Compare to: Yesterday</Button>
      </InlineGrid>

      <InlineGrid gap={"400"} columns={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}>
        <Card>
          <LineDataPointChart data={view} title="Funnel View" />
          {/* <Text as="p">dfdf</Text> */}
        </Card>
        <Card>
          <LineDataPointChart data={view} title="Funnel click" />
          {/* <Text as="p">dfdf</Text> */}
        </Card>
        <Card>
          <LineDataPointChart data={view} title="Total sales  values" />
          {/* <Text as="p">dfdf</Text> */}
        </Card>
      </InlineGrid>
    </BlockStack>
  );
}

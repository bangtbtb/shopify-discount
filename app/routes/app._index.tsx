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
  TextField,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { dbGetDiscounts } from "~/models/db_discount";
import { DiscountTable } from "~/components/Discounts/DiscountTable";
import { Discount } from "@prisma/client";
import ViewCounterChart from "~/components/DiscountChart/ViewCounterChart";
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
import { Midline } from "~/components/Common";
import { useField } from "@shopify/react-form";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

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

  const [loadSuccess, setLoadSuccess] = useState(false);
  const [orderReportParsed, setOrderReportParsed] =
    useState<OrderReportParsed | null>(null);

  const onClickDiscount = (d: SerializeFrom<Discount>) => {
    var dt = d.type === "Bundle" ? "od" : d.type === "Volume" ? "vd" : "sd";
    var idxSplash = d.id.lastIndexOf("/");
    nav(`/app/${dt}/${d.id.slice(idxSplash + 1)}`);
  };

  useEffect(() => {
    !loadSuccess && setLoadSuccess(true);
  }, [loadSuccess]);

  useEffect(() => {
    orderReport && setOrderReportParsed(parseOrderReports(orderReport));
  }, [orderReport]);

  return (
    <Page title="Home">
      <Midline content={"ddd"} borderWidth={"3px"}></Midline>

      <div className="vd_title">
        <h3>dfdf</h3>
      </div>

      {/* Overview discount status was applied */}
      <Layout.Section>
        <Text as="h2"> Overview</Text>

        <InlineGrid gap={"400"} columns={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}>
          <Card>
            <ViewCounterChart data={discountView} title="Total Discount View" />
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
        <Text as="h2">Recent discount</Text>
        <DiscountTable discounts={discounts ?? []} onClick={onClickDiscount} />
      </Layout.Section>
    </Page>
  );
}

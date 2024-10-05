import { Orders } from "@prisma/client";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  EmptyState,
  IndexTable,
  InlineGrid,
  Layout,
  Page,
  Pagination,
  Text,
} from "@shopify/polaris";
import { ThemeEditIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";
import { OverlayImage } from "~/components/Common/OverlayImage";
import { TablePagination } from "~/components/Common/TablePage";
import LineDataPointChart from "~/components/DiscountChart/LineDataPointChart";
import { ProductInfo } from "~/components/Shopify/SelectProduct";
import { bridgeLoadProduct } from "~/components/Shopify/shopify_func";
import { SeriesDP } from "~/defs/gui";
import {
  DiscountAppliedRelation,
  getAggregateApplied,
  getDiscountApplieds,
} from "~/models/db_applied";
import { dbGetShopDiscountAnalytics } from "~/models/db_dc_analytics";
import { dbGetDiscount } from "~/models/db_discount";
import { dayDuration, defaultPageSize } from "~/models/utils";
import { authenticate } from "~/shopify.server";

type AppliedExtend = DiscountAppliedRelation & {
  Products?: ProductInfo[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const id = params.id;
  if (!id) {
    return json({
      discount: null,
      discountView: null,
      ordersApply: null,
      agg: null,
    });
  }

  var now = new Date();
  var from = new Date();
  from.setTime(now.getTime() - 90 * dayDuration);

  const discount = await dbGetDiscount({
    id: id,
    shop: session.shop,
    wApplied: true,
    takeApplied: 10,
    wTheme: true,
  });

  const discountView = await dbGetShopDiscountAnalytics({
    from: from,
    to: now,
    groupInterval: "day",
    shop: session.shop,
  });

  const agg = await getAggregateApplied({
    discountId: id,
    from: from,
    to: now,
    groupInterval: "day",
    shop: session.shop,
  });

  var applies = await getDiscountApplieds({
    discountId: id,
    shop: session.shop,
    wOrder: true,
  });
  var ordersApply = applies.applies.map(
    (v) =>
      ({
        ...(v.OrderApplied || {}),
      }) as Orders,
  );

  // console.log("Applies agg: ", applies);

  return json({
    discount,
    discountView,
    agg,
    ordersApply: {
      maxPage: Math.ceil(Math.ceil(applies.total / defaultPageSize)),
      ordersApply,
    },
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const id = params.id;
  const formAct = formData.get("action")?.toString() || "";
  if (!id) {
    return json({
      action: formAct,
      discountView: null,
      ordersApply: null,
      agg: null,
    });
  }

  switch (formAct) {
    case "load_applied":
      var pageNum = Number.parseInt(formData.get("page")?.toString() || "1");
      var applies = await getDiscountApplieds({
        discountId: id,
        skip: (pageNum - 1) * defaultPageSize,
        shop: session.shop,
        wOrder: true,
      });
      var orders = applies.applies.map(
        (v) =>
          ({
            ...(v.OrderApplied || {}),
          }) as Orders,
      );
      return json({
        action: formAct,
        discountView: null,
        ordersApply: {
          maxPage: Math.ceil(Math.ceil(applies.total / defaultPageSize)),
          ordersApply: orders,
        },
      });
  }

  return json({
    action: formAct,
    discountView: null,
    ordersApply: null,
    agg: null,
  });
};

export default function DiscountDetailPage(props: any) {
  const nav = useNavigate();
  const submitForm = useSubmit();
  const { ordersApply, discount, discountView, agg } =
    useLoaderData<typeof loader>();
  const actData = useActionData<typeof action>();

  const [appliedCount, setAppliedCount] = useState<SeriesDP[]>(
    agg?.map((v) => ({
      data: Number(v.appliedCount),
      date: v.date,
    })) || [],
  );
  const [isEditThemeLoading, setIsEditThemeLoading] = useState(false);

  const [maxOrderPage, setMaxOrderPage] = useState(ordersApply?.maxPage || 0);
  const [currentOrders, setCurrentOrders] = useState(
    ordersApply?.ordersApply || [],
  );

  const handleLoadOrder = (pageNum: number) => {
    console.log("Submit load_applied");

    submitForm(
      {
        action: "load_applied",
        page: pageNum,
      },
      { method: "post" },
    );
  };

  useEffect(() => {
    if (actData?.action == "load_applied") {
      setMaxOrderPage(actData.ordersApply?.maxPage || 0);
      setCurrentOrders(actData.ordersApply?.ordersApply || []);
    }
  }, [actData]);

  return (
    <Page
      title="Detail of "
      primaryAction={<Button>Edit Discount</Button>}
      secondaryActions={[
        {
          icon: ThemeEditIcon,
          content: "Edit theme",
          loading: isEditThemeLoading,
          onAction: () => {
            setIsEditThemeLoading(true);
            nav(`/app/dcs/${discount?.id}/edit/theme`);
            // bridgeLoadProduct(["7256919801929", "7265339179081"]);
          },
        },
      ]}
    >
      <Layout.Section>
        <BlockStack gap={"200"}>
          <Text as="h2" variant="headingMd">
            Discount overview
          </Text>

          <InlineGrid
            gap={"400"}
            columns={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}
          >
            <Card>
              {/* <LineDataPointChart
                data={discountView || []}
                title="Discount View"
              /> */}
            </Card>

            <Card>
              <LineDataPointChart
                data={appliedCount || []}
                title="Order applied"
              />
            </Card>

            <Card></Card>
          </InlineGrid>
        </BlockStack>
      </Layout.Section>

      <Layout.Section>
        {/* <DiscountAppliedTable
          total={ordersApply?.total ?? 0}
          applies={ordersApply?.ordersApply}
        /> */}

        <TablePagination
          data={currentOrders}
          headings={[
            { title: "Order" },
            { title: "Total (USD)" },
            { title: "Products" },
          ]}
          // total={ordersApply?.total || 0}
          maxPage={maxOrderPage}
          onLoad={handleLoadOrder}
        >
          {ordersApply?.ordersApply?.map((v, idx) => (
            <DiscountAppliedRow
              key={idx}
              position={idx}
              order={v}
              onClick={() => {}}
            />
          ))}
        </TablePagination>
      </Layout.Section>

      <Box minHeight="150px"></Box>
    </Page>
  );
}

type DiscountAppliedTableProps = {
  total: number;
  applies?: Array<SerializeFrom<Orders>>;
};

function DiscountAppliedTable({ applies }: DiscountAppliedTableProps) {
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
    }
  });

  const handleNext = () => {};
  const handlePrev = () => {};

  return !loaded || !applies?.length ? (
    <div></div>
  ) : (
    <BlockStack gap={"100"}>
      <IndexTable
        itemCount={applies?.length || 0}
        selectable={false}
        headings={[
          { title: "Order" },
          { title: "Total (USD)" },
          { title: "Products" },
        ]}
        emptyState={
          <EmptyState
            heading="No oprder applies"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            {/* <p>Track and receive your incoming inventory from suppliers.</p> */}
          </EmptyState>
        }
      >
        {applies?.map((v, idx) => (
          <DiscountAppliedRow
            key={idx}
            position={idx}
            order={v}
            onClick={() => {}}
          />
        ))}
      </IndexTable>
      <Pagination
        onNext={() => {}}
        onPrevious={() => {}}
        label="Page 100"
      ></Pagination>
    </BlockStack>
  );
}

type DiscountAppliedRowProps = {
  order: SerializeFrom<Orders>;
  position: number;
  onClick?: () => void;
};

function DiscountAppliedRow({ order, position }: DiscountAppliedRowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductInfo[]>([]);

  useEffect(() => {
    if (order.products?.length && !products.length && !isLoading) {
      setIsLoading(true);
      console.log("Start load product 1: ", order, position);

      bridgeLoadProduct(order.products)
        .then((v) => {
          setProducts(v);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log("Load product from order error: ", err);
          setIsLoading(false);
        });
    }
  }, [order]);

  return (
    <IndexTable.Row id={order.id} position={position}>
      <IndexTable.Cell>{order.id}</IndexTable.Cell>
      <IndexTable.Cell>{order.subTotalUsd} $</IndexTable.Cell>
      <IndexTable.Cell>
        <OverlayImage srcs={products} />
      </IndexTable.Cell>
    </IndexTable.Row>
  );
}

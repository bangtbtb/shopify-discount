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
import {
  Page,
  Layout,
  Text,
  Card,
  Box,
  InlineGrid,
  Button,
  Modal,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { dbGetDiscounts } from "~/models/db_discount";
import { DiscountTable } from "~/components/Discounts/DiscountTable";
import { Discount } from "@prisma/client";
import { getFakeView, getFakeOrderOverview } from "~/fake/homepage";
import ViewCounterChart from "~/components/DiscountChart/ViewCounterChart";
import OrderAppliedChart from "~/components/DiscountChart/OrderAppliedChart";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const { searchParams } = new URL(request.url);
  const { session } = await authenticate.admin(request);

  const page = Number.parseInt(searchParams.get("page") || "") || 1;

  const { discounts } = await dbGetDiscounts({
    shop: session.shop,
    page: 1,
  });

  return json({
    page,
    discounts,
    discountView: getFakeView(),
    orderOverview: getFakeOrderOverview(),
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return json({});
};

export default function Index() {
  const { discounts, discountView, orderOverview } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  // const isLoading =
  //   ["loading", "submitting"].includes(fetcher.state) &&
  //   fetcher.formMethod === "POST";

  const [loadSuccess, setLoadSuccess] = useState(false);

  const nav = useNavigate();
  const loc = useLocation();
  const [openModal, setOpenModal] = useState(false);

  const onClickDiscount = (d: SerializeFrom<Discount>) => {
    var dt = d.type === "Bundle" ? "od" : d.type === "Volume" ? "vd" : "sd";
    var idxSplash = d.id.lastIndexOf("/");
    nav(`/app/${dt}/${d.id.slice(idxSplash + 1)}`);
  };

  useEffect(() => {
    if (!loadSuccess) {
      setLoadSuccess(true);
    }
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
      {/* Overview discount status was applied */}
      <Layout.Section>
        <Box></Box>
        <Text as="h2"> Overview</Text>
        <Button onClick={() => setOpenModal(!openModal)}>Show modal</Button>
        <ui-modal variant="small" src="">
          <Text as="p">Hello modal</Text>
        </ui-modal>
        <Modal
          open={openModal}
          title="dfsdf"
          onClose={() => setOpenModal(!openModal)}
        >
          <Text as="p">Hello modal</Text>
        </Modal>

        <InlineGrid gap={"400"} columns={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}>
          <Card>
            <ViewCounterChart data={discountView} title="Total discount view" />
          </Card>
          <Card>
            <OrderAppliedChart
              applieds={orderOverview.applieds}
              unapplieds={orderOverview.unapplied}
            />
          </Card>
          <Card>
            <ViewCounterChart data={discountView} />
          </Card>
        </InlineGrid>
      </Layout.Section>

      <Layout.Section>
        <Text as="h2"> Overview</Text>
        {loadSuccess && (
          <DiscountTable
            discounts={discounts ?? []}
            onClick={onClickDiscount}
          />
        )}
      </Layout.Section>
    </Page>
  );
}

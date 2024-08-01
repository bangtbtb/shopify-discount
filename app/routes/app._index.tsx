import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { Page, Layout, IndexTable } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getPrismaDiscounts } from "~/models/db_models";

type LoaderData = {};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const { searchParams } = new URL(request.url);
  const { session } = await authenticate.admin(request);

  const page = Number.parseInt(searchParams.get("page") || "") || 1;

  const { total, discounts } = await getPrismaDiscounts(session.shop, page);

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
          <IndexTable
            itemCount={discounts.length}
            selectable={false}
            headings={[
              { title: "Title" },
              { title: "Status" },
              { title: "Type" },
              { title: "Start" },
              { title: "End" },
            ]}
          >
            {discounts.map((d, idx) => (
              <IndexTable.Row
                id={d.id}
                key={d.id}
                position={idx}
                onClick={() => {
                  var dt =
                    d.type === "Bundle"
                      ? "od"
                      : d.type === "Volume"
                        ? "vd"
                        : "sd";
                  var idxSplash = d.id.lastIndexOf("/");
                  nav(`/app/${dt}/${d.id.slice(idxSplash + 1)}`);
                }}
              >
                <IndexTable.Cell>{d.title}</IndexTable.Cell>
                <IndexTable.Cell>{d.status}</IndexTable.Cell>
                <IndexTable.Cell>{d.type}</IndexTable.Cell>
                <IndexTable.Cell>{d.startAt}</IndexTable.Cell>
                <IndexTable.Cell>{d.endAt || ""}</IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        )}
      </Layout.Section>
    </Page>
  );
}

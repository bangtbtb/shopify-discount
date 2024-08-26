import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu, ShopifyGlobal } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { DiscountProvider } from "~/components/providers/DiscountProvider";
import { BillingCheckResponseObject } from "@shopify/shopify-api";
import { useEffect, useState } from "react";
import { AppContextType } from "~/defs/fe";

import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { I18nContext, I18nManager } from "@shopify/react-i18n";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useI18nMultiple } from "~/components/i18n";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { billing } = await authenticate.admin(request);

  const url = new URL(request.url);
  var billStatus: BillingCheckResponseObject | undefined = undefined;
  var idx = url.pathname.indexOf("/app/pricing");
  if (idx < 0) {
    try {
      billStatus = await billing.check();
      // console.log("Bill status: ", billStatus);
    } catch (error) {
      console.log("Get subscription error: ", error);
    }
  }

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    billStatus: billStatus,
  });
};

export default function App() {
  const { apiKey, billStatus } = useLoaderData<typeof loader>();
  const nav = useNavigate();
  const loc = useLocation();

  const [bill, setBill] = useState<BillingCheckResponseObject | null>(null);

  // const [i18n] = useI18nMultiple();
  // const [bridge, setBridge] = useState<ShopifyGlobal | null>(null);
  // const [i18nManager, seti18nManager] = useState(
  //   new I18nManager({
  //     locale: "en",
  //     onError(error) {
  //       console.log("Load i18n error: ", error);
  //     },
  //   }),
  // );

  // useEffect(() => {
  //   if (!bridge) {
  //     var curBridge = useAppBridge();
  //     seti18nManager(
  //       new I18nManager({
  //         locale: curBridge.config.locale,
  //         onError(error) {
  //           console.log("Load i18n error: ", error);
  //         },
  //       }),
  //     );
  //     setBridge(curBridge);
  //     console.log("Reload bridge", curBridge);
  //   }
  // }, []);

  useEffect(() => {
    // console.log(`Path: ${loc.pathname} App subscription: `, billStatus);
    if (billStatus) {
      setBill(billStatus);
    }

    if (!billStatus?.appSubscriptions?.length) {
      if (loc.pathname != "/app/pricing") {
        console.log("Redirect to pricing");
        nav("/app/pricing");
      }
    }
    // else {
    //   console.log("Subscsription has length");
    // }
  }, [billStatus]);

  useEffect(() => {
    console.log("Loc change to: ", loc.pathname);
    if (
      bill &&
      !bill?.appSubscriptions.length &&
      loc.pathname != "/app/pricing"
    ) {
      console.log("Redirect to pricing because: ", bill);
      nav("/app/pricing");
    }
  }, [loc]);

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app">Home</Link>
        <Link to="/app/pricing">Pricing</Link>
        <Link to="/app/settings">Settings</Link>
      </NavMenu>
      <Outlet context={{ bill } satisfies AppContextType} />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
